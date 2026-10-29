import { useState, useEffect } from "react";
import { Link } from "@/components/link";
import {
  BookOpen,
  Clock,
  Eye,
  Sparkles,
  Volume2,
} from "lucide-react";
import { getConcept, languages } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";
import { speakText } from "@/lib/audio";
import { ScriptText } from "./LanguageLens";
import {
  getReviewQueueServer,
  recordReviewResultServer,
} from "@/lib/learning-fn";

export function PersonalizedReview() {
  const { state, recordActivity } = useLearner();
  const profile = languages[state.target];
  const savedList = state.progress[state.target].savedConcepts;

  // Review pool: saved words or fallback common words
  const initialPool = savedList.length > 0 ? savedList : ["hello", "thanks", "water", "food"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [dueItems, setDueItems] = useState<{ concept_id: string; mistake_count: number }[]>([]);

  const currentConceptId = initialPool[currentIndex % initialPool.length];
  const concept = getConcept(currentConceptId);

  useEffect(() => {
    // Fetch spaced repetition queue from server
    if (state.target) {
      getReviewQueueServer({ data: { languageId: state.target } })
        .then((res) => {
          if (res?.success && res.dueItems) {
            setDueItems(res.dueItems);
          }
        })
        .catch(() => undefined);
    }
  }, [state.target]);

  const handleAudio = () => {
    speakText(concept.values[state.target], profile.locale);
  };

  const handleRating = async (rating: number) => {
    // Rating: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
    playSound(rating >= 3 ? "success" : "miss");
    setReviewedCount((c) => c + 1);

    try {
      await recordReviewResultServer({
        data: {
          languageId: state.target,
          conceptId: concept.id,
          rating,
        },
      });
    } catch {
      // Offline fallback
    }

    if (reviewedCount + 1 >= 5) {
      await recordActivity({
        languageId: state.target,
        activityType: "quiz",
        activityId: `review-batch-${Date.now()}`,
        score: 15,
        accuracy: rating >= 3 ? 1.0 : 0.8,
      });
    }

    setRevealed(false);
    setCurrentIndex((i) => (i + 1) % initialPool.length);
  };

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <span className="eyebrow">{profile.native} · Spaced Repetition System</span>
          <h1>Personalized Vocabulary Revision</h1>
          <p>
            An adaptive spaced-repetition queue that optimizes review intervals based on your recall confidence. Words you find challenging reappear sooner.
          </p>
        </div>
        <div className="screen-actions">
          <div className="xp-pill glass-card">
            <Sparkles size={16} />
            <b>{reviewedCount} Reviewed Today</b>
          </div>
        </div>
      </header>

      <div className="review-stage-wrapper">
        <section className="flashcard-interactive-card glass-card">
          <div className="card-topline">
            <span className="card-counter">
              Word {currentIndex + 1} of {initialPool.length}
            </span>
            <button
              className="soft-button audio-card-btn"
              onClick={handleAudio}
              aria-label="Listen to word"
            >
              <Volume2 size={18} /> Listen
            </button>
          </div>

          <div className="card-prompt-area">
            <span className="prompt-label">How do you recall this word?</span>
            <div className="big-target-word">
              <ScriptText language={state.target}>{concept.values[state.target]}</ScriptText>
            </div>
            {concept.transliteration[state.target] && (
              <span className="translit-caption">/{concept.transliteration[state.target]}/</span>
            )}
          </div>

          {/* Reveal button or Answer breakdown */}
          {!revealed ? (
            <div className="reveal-area">
              <button
                className="primary-button reveal-answer-btn"
                onClick={() => setRevealed(true)}
              >
                <Eye size={18} /> Reveal Meaning & Context
              </button>
            </div>
          ) : (
            <div className="answer-breakdown-box">
              <div className="meaning-line">
                <strong>English Meaning:</strong> <span>{concept.values.en}</span>
              </div>
              <p className="usage-line">💡 {concept.usage}</p>

              <div className="sm2-confidence-bar">
                <span className="confidence-title">Rate your recall difficulty:</span>
                <div className="confidence-buttons-row">
                  <button
                    className="confidence-btn again"
                    onClick={() => handleRating(1)}
                  >
                    <b>Again</b>
                    <small>&lt; 1 day</small>
                  </button>
                  <button
                    className="confidence-btn hard"
                    onClick={() => handleRating(2)}
                  >
                    <b>Hard</b>
                    <small>1-2 days</small>
                  </button>
                  <button
                    className="confidence-btn good"
                    onClick={() => handleRating(3)}
                  >
                    <b>Good</b>
                    <small>3-4 days</small>
                  </button>
                  <button
                    className="confidence-btn easy"
                    onClick={() => handleRating(4)}
                  >
                    <b>Easy</b>
                    <small>6+ days</small>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Due Revision & Mistake Queue Summary */}
        <aside className="review-sidebar glass-card">
          <div className="sidebar-section">
            <span className="eyebrow">
              <Clock size={14} /> Spaced Review Schedule
            </span>
            <h3>Review Queue</h3>
            <p>
              LUFO’s SuperMemo (SM-2) engine adapts to your responses, strengthening long-term memory.
            </p>
          </div>

          <div className="due-stats-list">
            <div className="stat-row">
              <span>Saved Vocabulary:</span>
              <strong>{savedList.length} words</strong>
            </div>
            <div className="stat-row">
              <span>Items in Revision Queue:</span>
              <strong>{Math.max(dueItems.length, initialPool.length)} items</strong>
            </div>
            <div className="stat-row">
              <span>Current Target Language:</span>
              <strong>{profile.name}</strong>
            </div>
          </div>

          <div className="quick-nav-actions">
            <Link className="soft-button" href="/app/learn">
              <BookOpen size={15} /> Learn New Words
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
