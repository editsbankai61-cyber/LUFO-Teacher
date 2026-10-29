import { Link } from "@/components/link";
import {
  BookOpen,
  CheckCircle2,
  Flame,
  Gamepad2,
  GraduationCap,
  Printer,
  Sparkles,
  Volume2,
} from "lucide-react";
import { getConcept, languages } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { speakText } from "@/lib/audio";
import { ScriptText } from "./LanguageLens";

export function ProgressDashboard() {
  const { state } = useLearner();
  const profile = languages[state.target];
  const p = state.progress[state.target];

  // Derived Level Calculation
  const totalXp = p.xp || 0;
  const levelNumber = Math.max(1, Math.floor(totalXp / 50) + 1);
  const nextLevelXp = levelNumber * 50;
  const currentLevelProgress = ((totalXp % 50) / 50) * 100;

  const levelTitles = [
    "Beginner Explorer",
    "Word Scout",
    "Script Wanderer",
    "Phrase Builder",
    "Story Voyager",
    "Multilingual Champion",
  ];
  const currentTitle = levelTitles[Math.min(levelNumber - 1, levelTitles.length - 1)];

  // Achievements based on actual records
  const achievements = [
    {
      id: "first-step",
      title: "First Steps",
      desc: "Earn your first 15 XP in learning activities.",
      unlocked: totalXp >= 15,
      icon: "🌱",
    },
    {
      id: "streak-3",
      title: "Consistent Habit",
      desc: "Maintain a daily learning streak of 3 days.",
      unlocked: (p.longestStreak || 0) >= 3,
      icon: "🔥",
    },
    {
      id: "game-player",
      title: "Playful Mind",
      desc: "Complete 3 educational games in the Playground.",
      unlocked: (p.completedGames || []).length >= 3,
      icon: "🎮",
    },
    {
      id: "story-reader",
      title: "Story Enthusiast",
      desc: "Complete your first interactive Indian story.",
      unlocked: (p.completedStories || []).length >= 1,
      icon: "📖",
    },
    {
      id: "word-collector",
      title: "Vocabulary Vault",
      desc: "Save 5 or more essential words for revision.",
      unlocked: (p.savedConcepts || []).length >= 5,
      icon: "💎",
    },
  ];

  const handleAudio = (text: string) => {
    speakText(text, profile.locale);
  };

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <span className="eyebrow">{profile.native} · Genuine Learning Trail</span>
          <h1>{state.name}’s Dashboard</h1>
          <p>
            Real progress recorded for {profile.name}. Derived entirely from verified completions on your account.
          </p>
        </div>
        <div className="screen-actions">
          <button className="soft-button" onClick={() => window.print()}>
            <Printer size={16} /> Print Milestone Record
          </button>
        </div>
      </header>

      {/* Level & Streaks Banner */}
      <section className="level-streak-banner glass-card">
        <div className="level-card-left">
          <div className="level-badge-large">
            <span>Lvl</span>
            <strong>{levelNumber}</strong>
          </div>
          <div className="level-text-meta">
            <span className="eyebrow">Learner Rank</span>
            <h2>{currentTitle}</h2>
            <div className="level-bar-track">
              <div className="level-bar-fill" style={{ width: `${currentLevelProgress}%` }} />
            </div>
            <small>{totalXp} / {nextLevelXp} XP to Level {levelNumber + 1}</small>
          </div>
        </div>

        <div className="streak-card-right">
          <div className="streak-flame-box">
            <Flame size={36} className="flame-icon active" />
          </div>
          <div>
            <strong>{p.currentStreak || 0} Day Streak</strong>
            <p>Best: {p.longestStreak || 0} days</p>
            <small>Active in timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</small>
          </div>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <div className="dashboard-stats-grid">
        <article className="stat-card glass-card">
          <Sparkles className="stat-icon-theme" />
          <div>
            <strong>{totalXp}</strong>
            <b>Total XP</b>
            <small>From verified completions</small>
          </div>
        </article>

        <article className="stat-card glass-card">
          <GraduationCap className="stat-icon-theme" />
          <div>
            <strong>{p.completedLessons.length}</strong>
            <b>Lessons Explored</b>
            <small>Course milestones</small>
          </div>
        </article>

        <article className="stat-card glass-card">
          <Gamepad2 className="stat-icon-theme" />
          <div>
            <strong>{p.completedGames.length}</strong>
            <b>Games Mastered</b>
            <small>Playground rounds</small>
          </div>
        </article>

        <article className="stat-card glass-card">
          <BookOpen className="stat-icon-theme" />
          <div>
            <strong>{p.completedStories?.length || 0}</strong>
            <b>Stories Read</b>
            <small>Cultural narratives</small>
          </div>
        </article>
      </div>

      {/* Main 2-Column Split: Achievements & Personal Vocabulary Vault */}
      <div className="dashboard-two-col">
        {/* Left: Achievements & Milestones */}
        <section className="achievements-section glass-card">
          <div className="section-head">
            <span className="eyebrow">Milestones</span>
            <h2>Earned Achievements</h2>
          </div>

          <div className="achievements-list">
            {achievements.map((item) => (
              <div
                key={item.id}
                className={`achievement-row ${item.unlocked ? "unlocked" : "locked"}`}
              >
                <span className="achievement-badge-icon">{item.icon}</span>
                <div className="achievement-info">
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
                {item.unlocked ? (
                  <span className="status-tag unlocked">
                    <CheckCircle2 size={15} /> Unlocked
                  </span>
                ) : (
                  <span className="status-tag locked">In Progress</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Right: Personal Vocabulary Collection */}
        <section className="vocabulary-vault-section glass-card">
          <div className="section-head">
            <span className="eyebrow">Personal Collection</span>
            <h2>Saved Words ({p.savedConcepts.length})</h2>
          </div>

          {p.savedConcepts.length === 0 ? (
            <div className="empty-vault-state">
              <p>You have not saved any words yet.</p>
              <Link href="/app/learn" className="primary-button">
                Start a Lesson to Collect Words
              </Link>
            </div>
          ) : (
            <div className="vocabulary-chips-list">
              {p.savedConcepts.map((id) => {
                const c = getConcept(id);
                return (
                  <div key={id} className="vocab-card glass-card">
                    <div className="vocab-left">
                      <strong>
                        <ScriptText language={state.target}>{c.values[state.target]}</ScriptText>
                      </strong>
                      <span className="vocab-meaning">{c.values.en}</span>
                    </div>
                    <button
                      className="icon-button audio-btn"
                      onClick={() => handleAudio(c.values[state.target])}
                      title="Listen"
                      aria-label={`Listen to ${c.values[state.target]}`}
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="vault-footer-action">
            <Link className="soft-button" href="/app/flashcards">
              Practice in Spaced Revision →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
