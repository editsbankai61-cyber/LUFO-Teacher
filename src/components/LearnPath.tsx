import { Link } from "@/components/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Lock,
  Sparkles,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import { languages } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";
import { speakText } from "@/lib/audio";
import { ScriptText } from "./LanguageLens";
import {
  getCourseUnitsForLanguage,
  type CourseUnit,
  type Lesson,
} from "@/lib/curriculum";

export function LearningPath() {
  const { state } = useLearner();
  const profile = languages[state.target];
  const units = getCourseUnitsForLanguage(state.target, profile);
  const progress = state.progress[state.target];

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <span className="eyebrow">{profile.native} · Interactive Learning Path</span>
          <h1>{profile.name} Curriculum</h1>
          <p>
            Master {profile.name} through interactive vocabulary, sentence building, listening, and grammar exercises.
          </p>
        </div>
        <div className="screen-actions">
          <div className="streak-badge glass-card" title="Current Daily Streak">
            <span className="streak-flame">🔥</span>
            <b>{progress.currentStreak || 0} Day Streak</b>
          </div>
          <div className="xp-pill glass-card">
            <Sparkles size={16} />
            <b>{progress.xp} XP</b>
          </div>
        </div>
      </header>

      <div className="units-container">
        {units.map((unit, uIndex) => {
          const isUnlocked =
            !unit.requiredUnitId ||
            progress.completedLessons.some((id) => id.startsWith(unit.requiredUnitId!)) ||
            uIndex === 0;

          const unitLessons = unit.lessons;
          const completedCount = unitLessons.filter((l) =>
            progress.completedLessons.includes(l.id),
          ).length;
          const isUnitCompleted = completedCount === unitLessons.length;

          return (
            <article
              key={unit.id}
              className={`unit-card glass-card ${!isUnlocked ? "locked-unit" : ""} ${isUnitCompleted ? "completed-unit" : ""}`}
            >
              <div className="unit-header-bar">
                <div className="unit-badge">
                  <span>Unit {unit.unitNumber}</span>
                  <small className="unit-level-tag">{unit.level}</small>
                </div>
                {!isUnlocked ? (
                  <span className="unit-status-chip locked">
                    <Lock size={14} /> Locked
                  </span>
                ) : isUnitCompleted ? (
                  <span className="unit-status-chip completed">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                ) : (
                  <span className="unit-status-chip active">
                    In Progress ({completedCount}/{unitLessons.length})
                  </span>
                )}
              </div>

              <div className="unit-content-body">
                <h2>{unit.title}</h2>
                <p className="unit-subtitle">{unit.subtitle}</p>
                <p className="unit-desc">{unit.description}</p>
              </div>

              <div className="unit-lessons-list">
                {unitLessons.map((lesson, lIndex) => {
                  const isLessonDone = progress.completedLessons.includes(lesson.id);
                  const isLessonUnlocked =
                    isUnlocked &&
                    (lIndex === 0 ||
                      progress.completedLessons.includes(unitLessons[lIndex - 1]?.id));

                  return (
                    <div
                      key={lesson.id}
                      className={`lesson-row-card ${isLessonDone ? "done" : ""} ${!isLessonUnlocked ? "locked" : ""}`}
                    >
                      <div className="lesson-info">
                        <span className="lesson-number">{lIndex + 1}</span>
                        <div>
                          <strong>{lesson.title}</strong>
                          <small>{lesson.subtitle} · +{lesson.xp} XP</small>
                        </div>
                      </div>

                      {isLessonUnlocked ? (
                        <Link
                          className={`lesson-action-btn ${isLessonDone ? "soft-button" : "primary-button"}`}
                          href={`/app/learn/${lesson.id}`}
                        >
                          {isLessonDone ? "Practice" : "Start"}
                          <ArrowRight size={15} />
                        </Link>
                      ) : (
                        <button className="lesson-action-btn disabled" disabled>
                          <Lock size={14} /> Locked
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const { state, recordActivity } = useLearner();
  const profile = languages[state.target];
  const units = getCourseUnitsForLanguage(state.target, profile);

  // Find target lesson
  let targetLesson: Lesson | undefined;
  let targetUnit: CourseUnit | undefined;
  for (const unit of units) {
    const found = unit.lessons.find((l) => l.id === lessonId);
    if (found) {
      targetLesson = found;
      targetUnit = unit;
      break;
    }
  }

  // Fallback to first available lesson if invalid id
  if (!targetLesson) {
    targetUnit = units[0];
    targetLesson = units[0]?.lessons[0];
  }

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [earnedXpTotal, setEarnedXpTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!targetLesson || !targetUnit) {
    return (
      <div className="narrow-screen">
        <div className="glass-card empty-state">
          <h2>Lesson not found</h2>
          <Link href="/app/learn" className="primary-button">
            Return to Learning Path
          </Link>
        </div>
      </div>
    );
  }

  const exercises = targetLesson.exercises;
  const currentExercise = exercises[currentIdx];

  const handleSpeech = (slow = false) => {
    const textToSpeak = currentExercise.targetText || currentExercise.correctAnswer;
    speakText(textToSpeak, profile.locale, { rate: slow ? 0.65 : 0.85 });
  };

  const handleSentenceWordClick = (word: string) => {
    if (isAnswered) return;
    setBuiltSentence((prev) => [...prev, word]);
  };

  const handleSentenceWordRemove = (index: number) => {
    if (isAnswered) return;
    setBuiltSentence((prev) => prev.filter((_, i) => i !== index));
  };

  const checkAnswer = () => {
    if (isAnswered) return;

    let candidateAnswer = selectedAnswer;
    if (currentExercise.type === "sentence-builder") {
      candidateAnswer = builtSentence.join(" ").trim();
    }

    if (!candidateAnswer) return;

    // Normalizing whitespace and punctuation
    const cleanAnswer = candidateAnswer.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
    const cleanCorrect = currentExercise.correctAnswer.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
    const correct = cleanAnswer.toLowerCase() === cleanCorrect.toLowerCase();

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      playSound("success");
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      playSound("miss");
      setHearts((prev) => Math.max(1, prev - 1));
    }
  };

  const handleNext = async () => {
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setBuiltSentence([]);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Completed all exercises in the lesson!
      setSubmitting(true);
      const accuracy = exercises.length > 0 ? correctAnswersCount / exercises.length : 1;
      const res = await recordActivity({
        languageId: state.target,
        activityType: "lesson",
        activityId: targetLesson.id,
        score: targetLesson.xp,
        accuracy,
        completedLessonId: targetLesson.id,
        independentCount: correctAnswersCount,
        assistedCount: exercises.length - correctAnswersCount,
      });

      setEarnedXpTotal(res.xpAwarded);
      setIsFinished(true);
      setSubmitting(false);
    }
  };

  if (isFinished) {
    const accuracyPct = Math.round((correctAnswersCount / exercises.length) * 100);
    return (
      <div className="narrow-screen">
        <section className="completion-card glass-card">
          <div className="trophy-ring">
            <Trophy size={48} className="trophy-icon" />
          </div>
          <span className="eyebrow">Lesson Complete!</span>
          <h2>{targetLesson.title}</h2>
          <p>You have taken another genuine step into {profile.name}.</p>

          <div className="completion-stats-grid">
            <div className="stat-box">
              <Sparkles size={20} className="stat-icon" />
              <strong>+{earnedXpTotal}</strong>
              <small>XP Earned</small>
            </div>
            <div className="stat-box">
              <CheckCircle2 size={20} className="stat-icon" />
              <strong>{accuracyPct}%</strong>
              <small>Accuracy</small>
            </div>
            <div className="stat-box">
              <Heart size={20} className="stat-icon" />
              <strong>{hearts}/3</strong>
              <small>Hearts Saved</small>
            </div>
          </div>

          <div className="completion-actions">
            <Link className="primary-button" href="/app/learn">
              Continue Learning Path <ArrowRight size={16} />
            </Link>
            <Link className="soft-button" href="/app/dashboard">
              View My Progress
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const progressPct = ((currentIdx + 1) / exercises.length) * 100;

  return (
    <div className="lesson-shell">
      {/* Top bar with progress and hearts */}
      <header className="lesson-topbar">
        <Link href="/app/learn" className="icon-button" aria-label="Exit lesson">
          <X size={20} />
        </Link>
        <div className="lesson-progress-track">
          <div
            className="lesson-progress-fill"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={currentIdx + 1}
            aria-valuemin={1}
            aria-valuemax={exercises.length}
          />
        </div>
        <div className="hearts-display">
          <Heart size={18} className="heart-icon active" />
          <span>{hearts}</span>
        </div>
      </header>

      {/* Main exercise view */}
      <main className="exercise-card glass-card">
        <span className="exercise-type-tag">
          Exercise {currentIdx + 1} of {exercises.length} · {currentExercise.type.replace("-", " ")}
        </span>

        <h2 className="exercise-prompt">{currentExercise.prompt}</h2>

        {/* Audio Button if target text is available */}
        {(currentExercise.targetText || currentExercise.type === "listening") && (
          <div className="audio-row">
            <button
              className="primary-button audio-play-btn"
              onClick={() => handleSpeech(false)}
              aria-label="Play audio"
            >
              <Volume2 size={22} /> Listen
            </button>
            <button
              className="soft-button slow-audio-btn"
              onClick={() => handleSpeech(true)}
              aria-label="Play slow audio"
            >
              Slow
            </button>
            {currentExercise.romanTransliteration && (
              <span className="transliteration-pill">
                {currentExercise.romanTransliteration}
              </span>
            )}
          </div>
        )}

        {/* Exercise Body by Type */}
        {currentExercise.type === "sentence-builder" ? (
          <div className="sentence-builder-stage">
            <div className="assembled-sentence-box" aria-label="Built sentence">
              {builtSentence.length === 0 ? (
                <span className="placeholder-text">Click words below to assemble your sentence...</span>
              ) : (
                builtSentence.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    className="word-chip built"
                    disabled={isAnswered}
                    onClick={() => handleSentenceWordRemove(idx)}
                  >
                    <ScriptText language={state.target}>{word}</ScriptText>
                  </button>
                ))
              )}
            </div>

            <div className="word-chips-bank">
              {currentExercise.choices.map((choice, idx) => (
                <button
                  key={`${choice}-${idx}`}
                  className="word-chip selectable"
                  disabled={isAnswered}
                  onClick={() => handleSentenceWordClick(choice)}
                >
                  <ScriptText language={state.target}>{choice}</ScriptText>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="choices-grid">
            {currentExercise.choices.map((choice, idx) => {
              const isSelected = selectedAnswer === choice;
              let extraClass = "";
              if (isAnswered) {
                if (choice === currentExercise.correctAnswer) extraClass = "correct";
                else if (isSelected && !isCorrect) extraClass = "incorrect";
              } else if (isSelected) {
                extraClass = "selected";
              }

              return (
                <button
                  key={`${choice}-${idx}`}
                  className={`choice-card ${extraClass}`}
                  disabled={isAnswered}
                  onClick={() => setSelectedAnswer(choice)}
                >
                  <span className="choice-key">{idx + 1}</span>
                  <span className="choice-text">
                    <ScriptText language={state.target}>{choice}</ScriptText>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Action / Feedback Drawer */}
      <footer className={`exercise-footer ${isAnswered ? (isCorrect ? "correct-footer" : "incorrect-footer") : ""}`}>
        {!isAnswered ? (
          <div className="footer-bar">
            <button
              className="primary-button check-btn"
              disabled={
                currentExercise.type === "sentence-builder"
                  ? builtSentence.length === 0
                  : !selectedAnswer
              }
              onClick={checkAnswer}
            >
              Check Answer
            </button>
          </div>
        ) : (
          <div className="feedback-banner">
            <div className="feedback-content">
              <div className="feedback-status-row">
                {isCorrect ? (
                  <>
                    <CheckCircle2 size={24} className="feedback-icon correct" />
                    <strong>उत्कृष्ट! Excellent connection!</strong>
                  </>
                ) : (
                  <>
                    <X size={24} className="feedback-icon incorrect" />
                    <div>
                      <strong>Correct answer:</strong>{" "}
                      <span className="correct-answer-text">{currentExercise.correctAnswer}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="explanation-text">{currentExercise.explanation}</p>
            </div>
            <button
              className="primary-button continue-btn"
              disabled={submitting}
              onClick={handleNext}
            >
              {submitting ? "Saving..." : currentIdx === exercises.length - 1 ? "Complete Lesson" : "Continue"}
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
