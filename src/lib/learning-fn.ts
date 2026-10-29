import { createServerFn } from "@tanstack/react-start";
import { getSql } from "./db";
import { authMiddleware } from "./auth/middleware";

export type ActivityRecordInput = {
  languageId: string;
  activityType: "lesson" | "game" | "story" | "script" | "quiz";
  activityId: string;
  score: number;
  accuracy: number; // 0.0 - 1.0
  idempotencyKey: string;
  clientDate: string; // YYYY-MM-DD
  assistedCount?: number;
  independentCount?: number;
  completedLessonId?: string;
  completedGameId?: string;
  completedStoryId?: string;
  storyPage?: { storyId: string; page: number };
  savedConceptId?: string;
};

export type ProgressPayload = {
  xp: number;
  completedLessons: string[];
  completedGames: string[];
  completedStories: string[];
  storyPages: Record<string, number>;
  savedConcepts: string[];
  assistedAnswers: number;
  independentAnswers: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  lastActivityAt: string | null;
};

const DEFAULT_PROGRESS: ProgressPayload = {
  xp: 0,
  completedLessons: [],
  completedGames: [],
  completedStories: [],
  storyPages: {},
  savedConcepts: [],
  assistedAnswers: 0,
  independentAnswers: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  lastActivityAt: null,
};

/**
 * Calculate Streak safely from client local date (YYYY-MM-DD)
 */
function calculateStreak(
  lastDate: string | null,
  clientDate: string,
  currentStreak: number,
  longestStreak: number,
): { currentStreak: number; longestStreak: number } {
  if (!clientDate) return { currentStreak, longestStreak };
  if (!lastDate) {
    return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1) };
  }
  if (lastDate === clientDate) {
    // Already counted today
    return { currentStreak, longestStreak };
  }

  // Calculate day difference between lastDate and clientDate
  const lastTime = new Date(`${lastDate}T00:00:00Z`).getTime();
  const currTime = new Date(`${clientDate}T00:00:00Z`).getTime();
  const diffDays = Math.round((currTime - lastTime) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    const nextStreak = currentStreak + 1;
    return {
      currentStreak: nextStreak,
      longestStreak: Math.max(longestStreak, nextStreak),
    };
  } else if (diffDays > 1) {
    // Streak broken
    return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1) };
  }

  return { currentStreak, longestStreak };
}

/**
 * Calculate bounded server-side XP based on activity rules.
 * Never trust client XP claims.
 */
function calculateServerXp(type: string, score: number, accuracy: number): number {
  const base =
    type === "lesson" ? 15 :
    type === "game" ? 10 :
    type === "story" ? 12 :
    type === "script" ? 8 : 5;
  const bonus = Math.round(accuracy * 5);
  return Math.max(1, Math.min(base + bonus, 30));
}

/**
 * Fetch authenticated user's progress for a given language.
 */
export const getUserProgressServer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { languageId: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{
      xp: number;
      completed_lessons: string;
      completed_games: string;
      completed_stories: string;
      story_pages: string;
      saved_concepts: string;
      assisted_answers: number;
      independent_answers: number;
      current_streak: number;
      longest_streak: number;
      last_activity_date: string | null;
      last_activity_at: string | null;
    }>`
      SELECT * FROM learner_progress
      WHERE user_id = ${context.userId} AND language_id = ${data.languageId}
    `;

    if (!rows || rows.length === 0) {
      return { success: true, progress: DEFAULT_PROGRESS };
    }

    const row = rows[0];
    const parseJson = (val: string, fallback: unknown) => {
      try {
        return typeof val === "string" ? JSON.parse(val) : val;
      } catch {
        return fallback;
      }
    };

    const progress: ProgressPayload = {
      xp: Number(row.xp || 0),
      completedLessons: parseJson(row.completed_lessons, []),
      completedGames: parseJson(row.completed_games, []),
      completedStories: parseJson(row.completed_stories, []),
      storyPages: parseJson(row.story_pages, {}),
      savedConcepts: parseJson(row.saved_concepts, []),
      assistedAnswers: Number(row.assisted_answers || 0),
      independentAnswers: Number(row.independent_answers || 0),
      currentStreak: Number(row.current_streak || 0),
      longestStreak: Number(row.longest_streak || 0),
      lastActivityDate: row.last_activity_date,
      lastActivityAt: row.last_activity_at ? new Date(row.last_activity_at).toISOString() : null,
    };

    return { success: true, progress };
  });

/**
 * Record a completed learning activity with server-validated XP, idempotency, and streaks.
 */
export const recordActivityServer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: ActivityRecordInput) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();

    // 1. Idempotency Check: prevent duplicate XP if client replays completion request
    const existingActivity = await sql<{ id: string; xp_awarded: number }>`
      SELECT id, xp_awarded FROM activity_log WHERE idempotency_key = ${data.idempotencyKey}
    `;

    if (existingActivity && existingActivity.length > 0) {
      return {
        success: true,
        alreadyProcessed: true,
        xpAwarded: existingActivity[0].xp_awarded,
      };
    }

    // 2. Compute verified XP
    const boundedAccuracy = Math.max(0, Math.min(Number(data.accuracy) || 0, 1.0));
    const xpAwarded = calculateServerXp(data.activityType, data.score, boundedAccuracy);

    // 3. Log activity
    const activityId = `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await sql`
      INSERT INTO activity_log (
        id, user_id, language_id, activity_type, activity_id,
        score, xp_awarded, accuracy, idempotency_key, client_date
      ) VALUES (
        ${activityId}, ${context.userId}, ${data.languageId}, ${data.activityType},
        ${data.activityId}, ${data.score}, ${xpAwarded}, ${boundedAccuracy},
        ${data.idempotencyKey}, ${data.clientDate}
      )
    `;

    // 4. Fetch current progress
    const currentRows = await sql<{
      xp: number;
      completed_lessons: string;
      completed_games: string;
      completed_stories: string;
      story_pages: string;
      saved_concepts: string;
      assisted_answers: number;
      independent_answers: number;
      current_streak: number;
      longest_streak: number;
      last_activity_date: string | null;
    }>`
      SELECT * FROM learner_progress
      WHERE user_id = ${context.userId} AND language_id = ${data.languageId}
    `;

    const parseJson = (val: string, fallback: unknown) => {
      try {
        return typeof val === "string" ? JSON.parse(val) : val;
      } catch {
        return fallback;
      }
    };

    let xp = 0;
    let completedLessons: string[] = [];
    let completedGames: string[] = [];
    let completedStories: string[] = [];
    let storyPages: Record<string, number> = {};
    let savedConcepts: string[] = [];
    let assistedAnswers = 0;
    let independentAnswers = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate: string | null = null;

    if (currentRows && currentRows.length > 0) {
      const r = currentRows[0];
      xp = Number(r.xp || 0);
      completedLessons = parseJson(r.completed_lessons, []);
      completedGames = parseJson(r.completed_games, []);
      completedStories = parseJson(r.completed_stories, []);
      storyPages = parseJson(r.story_pages, {});
      savedConcepts = parseJson(r.saved_concepts, []);
      assistedAnswers = Number(r.assisted_answers || 0);
      independentAnswers = Number(r.independent_answers || 0);
      currentStreak = Number(r.current_streak || 0);
      longestStreak = Number(r.longest_streak || 0);
      lastDate = r.last_activity_date;
    }

    // Apply updates
    xp += xpAwarded;
    assistedAnswers += data.assistedCount || 0;
    independentAnswers += data.independentCount || 0;

    if (data.completedLessonId && !completedLessons.includes(data.completedLessonId)) {
      completedLessons.push(data.completedLessonId);
    }
    if (data.completedGameId && !completedGames.includes(data.completedGameId)) {
      completedGames.push(data.completedGameId);
    }
    if (data.completedStoryId && !completedStories.includes(data.completedStoryId)) {
      completedStories.push(data.completedStoryId);
    }
    if (data.storyPage) {
      storyPages[data.storyPage.storyId] = Math.max(
        storyPages[data.storyPage.storyId] || 0,
        data.storyPage.page,
      );
    }
    if (data.savedConceptId && !savedConcepts.includes(data.savedConceptId)) {
      savedConcepts.push(data.savedConceptId);
    }

    // Streak update
    const streakResult = calculateStreak(lastDate, data.clientDate, currentStreak, longestStreak);

    // Save to database
    await sql`
      INSERT INTO learner_progress (
        user_id, language_id, xp, completed_lessons, completed_games, completed_stories,
        story_pages, saved_concepts, assisted_answers, independent_answers,
        current_streak, longest_streak, last_activity_date, last_activity_at, updated_at
      ) VALUES (
        ${context.userId}, ${data.languageId}, ${xp},
        ${JSON.stringify(completedLessons)}, ${JSON.stringify(completedGames)},
        ${JSON.stringify(completedStories)}, ${JSON.stringify(storyPages)},
        ${JSON.stringify(savedConcepts)}, ${assistedAnswers}, ${independentAnswers},
        ${streakResult.currentStreak}, ${streakResult.longestStreak}, ${data.clientDate},
        NOW(), NOW()
      )
      ON CONFLICT (user_id, language_id) DO UPDATE SET
        xp = ${xp},
        completed_lessons = ${JSON.stringify(completedLessons)},
        completed_games = ${JSON.stringify(completedGames)},
        completed_stories = ${JSON.stringify(completedStories)},
        story_pages = ${JSON.stringify(storyPages)},
        saved_concepts = ${JSON.stringify(savedConcepts)},
        assisted_answers = ${assistedAnswers},
        independent_answers = ${independentAnswers},
        current_streak = ${streakResult.currentStreak},
        longest_streak = ${streakResult.longestStreak},
        last_activity_date = ${data.clientDate},
        last_activity_at = NOW(),
        updated_at = NOW()
    `;

    return {
      success: true,
      xpAwarded,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      totalXp: xp,
    };
  });

/**
 * Spaced Repetition System (SM-2): Record mistake or success for vocabulary revision.
 */
export const recordReviewResultServer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { languageId: string; conceptId: string; rating: number }) => d) // rating: 1 (again), 2 (hard), 3 (good), 4 (easy)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{
      repetitions: number;
      interval_days: number;
      ease_factor: number;
      mistake_count: number;
      correct_count: number;
    }>`
      SELECT * FROM review_queue
      WHERE user_id = ${context.userId} AND language_id = ${data.languageId} AND concept_id = ${data.conceptId}
    `;

    let reps = 0;
    let interval = 1.0;
    let ef = 2.5;
    let mistakes = 0;
    let corrects = 0;

    if (rows && rows.length > 0) {
      reps = Number(rows[0].repetitions);
      interval = Number(rows[0].interval_days);
      ef = Number(rows[0].ease_factor);
      mistakes = Number(rows[0].mistake_count);
      corrects = Number(rows[0].correct_count);
    }

    if (data.rating < 3) {
      // Repeat / hard: reset interval
      reps = 0;
      interval = 1.0;
      mistakes += 1;
      ef = Math.max(1.3, ef - 0.2);
    } else {
      // Good / easy: expand interval
      corrects += 1;
      if (reps === 0) {
        interval = 1.0;
      } else if (reps === 1) {
        interval = 3.0;
      } else {
        interval = Math.round(interval * ef);
      }
      reps += 1;
      ef = Math.max(1.3, ef + (0.1 - (4 - data.rating) * (0.08 + (4 - data.rating) * 0.02)));
    }

    const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toISOString();
    const queueId = `rq_${context.userId}_${data.languageId}_${data.conceptId}`;

    await sql`
      INSERT INTO review_queue (
        id, user_id, language_id, concept_id, repetitions, interval_days,
        ease_factor, mistake_count, correct_count, last_reviewed_at, next_review_at
      ) VALUES (
        ${queueId}, ${context.userId}, ${data.languageId}, ${data.conceptId},
        ${reps}, ${interval}, ${ef}, ${mistakes}, ${corrects}, NOW(), ${nextReview}
      )
      ON CONFLICT (user_id, language_id, concept_id) DO UPDATE SET
        repetitions = ${reps},
        interval_days = ${interval},
        ease_factor = ${ef},
        mistake_count = ${mistakes},
        correct_count = ${corrects},
        last_reviewed_at = NOW(),
        next_review_at = ${nextReview}
    `;

    return { success: true, nextReviewDays: interval };
  });

/**
 * Fetch due revision items for the learner.
 */
export const getReviewQueueServer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { languageId: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{
      concept_id: string;
      mistake_count: number;
      correct_count: number;
      repetitions: number;
    }>`
      SELECT concept_id, mistake_count, correct_count, repetitions
      FROM review_queue
      WHERE user_id = ${context.userId} AND language_id = ${data.languageId}
        AND next_review_at <= NOW()
      ORDER BY mistake_count DESC, next_review_at ASC
      LIMIT 20
    `;

    return { success: true, dueItems: rows || [] };
  });
