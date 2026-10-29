-- Learning progress, gamification, activity log, spaced review, and user settings

CREATE TABLE IF NOT EXISTS learner_progress (
  user_id TEXT NOT NULL,
  language_id TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  completed_lessons TEXT NOT NULL DEFAULT '[]',
  completed_games TEXT NOT NULL DEFAULT '[]',
  completed_stories TEXT NOT NULL DEFAULT '[]',
  story_pages TEXT NOT NULL DEFAULT '{}',
  saved_concepts TEXT NOT NULL DEFAULT '[]',
  assisted_answers INTEGER NOT NULL DEFAULT 0,
  independent_answers INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date TEXT,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, language_id)
);

CREATE INDEX IF NOT EXISTS learner_progress_user_idx ON learner_progress (user_id);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT NOT NULL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 1.0,
  idempotency_key TEXT UNIQUE,
  client_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS activity_log_user_lang_idx ON activity_log (user_id, language_id);
CREATE INDEX IF NOT EXISTS activity_log_client_date_idx ON activity_log (user_id, client_date);

CREATE TABLE IF NOT EXISTS review_queue (
  id TEXT NOT NULL PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  repetitions INTEGER NOT NULL DEFAULT 0,
  interval_days REAL NOT NULL DEFAULT 1.0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  mistake_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, language_id, concept_id)
);

CREATE INDEX IF NOT EXISTS review_queue_due_idx ON review_queue (user_id, language_id, next_review_at);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT NOT NULL PRIMARY KEY,
  target_language TEXT NOT NULL DEFAULT 'mr',
  primary_familiar TEXT NOT NULL DEFAULT 'en',
  daily_goal_minutes INTEGER NOT NULL DEFAULT 10,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  theme TEXT NOT NULL DEFAULT 'dark',
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  preferences TEXT NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
