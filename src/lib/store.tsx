import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setSoundPrefs } from "@/lib/sound";
import type { FamiliarLanguageId, LanguageId } from "./content";
import { getUserProgressServer, recordActivityServer } from "./learning-fn";

export type AccessPrefs = {
  reducedMotion: boolean;
  reducedTransparency: boolean;
  highContrast: boolean;
  largeText: boolean;
  calm: boolean;
  captions: boolean;
  quiet: boolean;
  nonTimed: boolean;
  lineFocus: boolean;
  theme: "dark" | "light" | "system";
  volume: number;
  lufoVisible: boolean;
};

export type LanguageProgress = {
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
  lastActivity: string | null;
  lastActivityDate: string | null;
};

export type LearnerState = {
  version: 2;
  onboarded: boolean;
  name: string;
  target: LanguageId;
  familiar: FamiliarLanguageId[];
  primaryFamiliar: FamiliarLanguageId;
  interfaceLanguage: FamiliarLanguageId;
  lensMode: "hidden" | "peek" | "visible" | "side-by-side";
  showTransliteration: boolean;
  access: AccessPrefs;
  progress: Record<LanguageId, LanguageProgress>;
  localMemes: { id: string; target: LanguageId; text: string; help: string; template: string }[];
  memories: string[];
  restDays: string[];
};

const ids: LanguageId[] = ["mr", "bn", "te", "ta", "gu", "ur", "kn", "or", "ml", "pa"];
const emptyProgress = (): LanguageProgress => ({
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
  lastActivity: null,
  lastActivityDate: null,
});

const initialState: LearnerState = {
  version: 2,
  onboarded: false,
  name: "Explorer",
  target: "mr",
  familiar: ["en"],
  primaryFamiliar: "en",
  interfaceLanguage: "en",
  lensMode: "hidden",
  showTransliteration: false,
  access: {
    reducedMotion: false,
    reducedTransparency: false,
    highContrast: false,
    largeText: false,
    calm: false,
    captions: true,
    quiet: false,
    nonTimed: true,
    lineFocus: false,
    theme: "dark",
    volume: 0.65,
    lufoVisible: true,
  },
  progress: Object.fromEntries(ids.map((id) => [id, emptyProgress()])) as Record<LanguageId, LanguageProgress>,
  localMemes: [],
  memories: [],
  restDays: [],
};

type StoreContextValue = {
  state: LearnerState;
  hydrated: boolean;
  userId: string;
  update: (next: Partial<LearnerState> | ((value: LearnerState) => LearnerState)) => void;
  updateAccess: (next: Partial<AccessPrefs>) => void;
  updateProgress: (language: LanguageId, next: Partial<LanguageProgress> | ((value: LanguageProgress) => LanguageProgress)) => void;
  recordActivity: (activity: {
    languageId: LanguageId;
    activityType: "lesson" | "game" | "story" | "script" | "quiz";
    activityId: string;
    score: number;
    accuracy?: number;
    completedLessonId?: string;
    completedGameId?: string;
    completedStoryId?: string;
    storyPage?: { storyId: string; page: number };
    savedConceptId?: string;
    assistedCount?: number;
    independentCount?: number;
  }) => Promise<{ xpAwarded: number; totalXp: number; streak: number }>;
  saveConcept: (conceptId: string) => void;
  exportData: () => void;
  importData: (raw: string) => { ok: boolean; message: string };
  deleteData: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function storageKey(userId: string) {
  return `lufo-learner-v3:${userId}`;
}

function migrate(value: unknown): LearnerState {
  if (!value || typeof value !== "object") return initialState;
  const candidate = value as Partial<LearnerState>;
  const progress = Object.fromEntries(ids.map((id) => [id, { ...emptyProgress(), ...(candidate.progress?.[id] ?? {}) }])) as Record<LanguageId, LanguageProgress>;
  return {
    ...initialState,
    ...candidate,
    version: 2,
    access: { ...initialState.access, ...(candidate.access ?? {}) },
    progress,
  };
}

export function LearnerProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [bucket, setBucket] = useState(userId);
  const [state, setState] = useState<LearnerState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  if (userId !== bucket) {
    setBucket(userId);
    setHydrated(false);
  }

  // 1. Load from localStorage first (instant response)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(userId));
      setState(saved ? migrate(JSON.parse(saved)) : initialState);
    } catch {
      setState(initialState);
    } finally {
      setHydrated(true);
    }
  }, [userId]);

  // 2. Fetch server progress for signed-in user and synchronize
  useEffect(() => {
    if (!hydrated || userId === "guest") return;

    let isMounted = true;
    getUserProgressServer({ data: { languageId: state.target } })
      .then((res) => {
        if (!isMounted || !res?.success || !res.progress) return;
        const srv = res.progress;
        setState((current) => {
          const existing = current.progress[current.target];
          // Merge server progress with existing
          const merged: LanguageProgress = {
            ...existing,
            xp: Math.max(existing.xp, srv.xp),
            completedLessons: Array.from(new Set([...existing.completedLessons, ...srv.completedLessons])),
            completedGames: Array.from(new Set([...existing.completedGames, ...srv.completedGames])),
            completedStories: Array.from(new Set([...(existing.completedStories || []), ...(srv.completedStories || [])])),
            storyPages: { ...existing.storyPages, ...srv.storyPages },
            savedConcepts: Array.from(new Set([...existing.savedConcepts, ...srv.savedConcepts])),
            assistedAnswers: Math.max(existing.assistedAnswers, srv.assistedAnswers),
            independentAnswers: Math.max(existing.independentAnswers, srv.independentAnswers),
            currentStreak: Math.max(existing.currentStreak || 0, srv.currentStreak || 0),
            longestStreak: Math.max(existing.longestStreak || 0, srv.longestStreak || 0),
            lastActivity: srv.lastActivityAt || existing.lastActivity,
            lastActivityDate: srv.lastActivityDate || existing.lastActivityDate,
          };
          return {
            ...current,
            progress: {
              ...current.progress,
              [current.target]: merged,
            },
          };
        });
      })
      .catch((err) => {
        console.debug("[store] Server progress fetch skipped:", err?.message || err);
      });

    return () => {
      isMounted = false;
    };
  }, [hydrated, userId, state.target]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(state));
    } catch {
      // Local storage failure handled gracefully
    }
  }, [state, hydrated, userId]);

  // Synchronize CSS custom properties and accessibility preferences
  useEffect(() => {
    setSoundPrefs({ quiet: state.access.quiet, volume: state.access.volume, reducedMotion: state.access.reducedMotion });
    const root = document.documentElement;
    const resolve = () => {
      const theme = state.access.theme;
      const resolved = theme === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : theme;
      root.dataset.appearance = theme;
      root.dataset.resolved = resolved;
    };
    resolve();
    root.dataset.motion = state.access.reducedMotion ? "reduced" : "full";
    root.dataset.transparency = state.access.reducedTransparency ? "reduced" : "full";
    root.dataset.contrast = state.access.highContrast ? "high" : "standard";
    root.dataset.text = state.access.largeText ? "large" : "standard";
    root.style.setProperty("--accent", `var(--${state.target}-accent)`);
    root.style.setProperty("--accent-2", `var(--${state.target}-accent-2)`);
    root.setAttribute("dir", "ltr");
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => resolve();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [state.access, state.target]);

  const update = useCallback<StoreContextValue["update"]>((next) => {
    setState((current) => typeof next === "function" ? next(current) : { ...current, ...next });
  }, []);

  const updateAccess = useCallback((next: Partial<AccessPrefs>) => {
    setState((current) => ({ ...current, access: { ...current.access, ...next } }));
  }, []);

  const updateProgress = useCallback<StoreContextValue["updateProgress"]>((language, next) => {
    setState((current) => {
      const existing = current.progress[language];
      const updated = typeof next === "function" ? next(existing) : { ...existing, ...next };
      return { ...current, progress: { ...current.progress, [language]: { ...updated, lastActivity: new Date().toISOString() } } };
    });
  }, []);

  // Record an educational activity (lessons, games, stories, scripts)
  const recordActivity = useCallback<StoreContextValue["recordActivity"]>(
    async (activity) => {
      const clientDate = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local user timezone
      const idempotencyKey = `${userId}_${activity.languageId}_${activity.activityId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      let earnedXp = Math.max(5, Math.round((activity.score || 10) * (activity.accuracy ?? 1)));

      if (userId !== "guest") {
        try {
          const res = await recordActivityServer({
            data: {
              languageId: activity.languageId,
              activityType: activity.activityType,
              activityId: activity.activityId,
              score: activity.score,
              accuracy: activity.accuracy ?? 1.0,
              idempotencyKey,
              clientDate,
              assistedCount: activity.assistedCount,
              independentCount: activity.independentCount,
              completedLessonId: activity.completedLessonId,
              completedGameId: activity.completedGameId,
              completedStoryId: activity.completedStoryId,
              storyPage: activity.storyPage,
              savedConceptId: activity.savedConceptId,
            },
          });

          if (res?.success) {
            earnedXp = res.xpAwarded;
            const resTotalXp = res.totalXp ?? 0;
            const resStreak = res.currentStreak ?? 1;
            setState((current) => {
              const p = current.progress[activity.languageId];
              const completedLessons = activity.completedLessonId && !p.completedLessons.includes(activity.completedLessonId)
                ? [...p.completedLessons, activity.completedLessonId]
                : p.completedLessons;
              const completedGames = activity.completedGameId && !p.completedGames.includes(activity.completedGameId)
                ? [...p.completedGames, activity.completedGameId]
                : p.completedGames;
              const completedStories = activity.completedStoryId && !p.completedStories?.includes(activity.completedStoryId)
                ? [...(p.completedStories || []), activity.completedStoryId]
                : (p.completedStories || []);
              const storyPages = activity.storyPage
                ? { ...p.storyPages, [activity.storyPage.storyId]: Math.max(p.storyPages[activity.storyPage.storyId] || 0, activity.storyPage.page) }
                : p.storyPages;
              const savedConcepts = activity.savedConceptId && !p.savedConcepts.includes(activity.savedConceptId)
                ? [...p.savedConcepts, activity.savedConceptId]
                : p.savedConcepts;

              return {
                ...current,
                progress: {
                  ...current.progress,
                  [activity.languageId]: {
                    ...p,
                    xp: resTotalXp,
                    completedLessons,
                    completedGames,
                    completedStories,
                    storyPages,
                    savedConcepts,
                    currentStreak: resStreak,
                    longestStreak: Math.max(p.longestStreak || 0, res.longestStreak || resStreak),
                    lastActivity: new Date().toISOString(),
                    lastActivityDate: clientDate,
                    assistedAnswers: p.assistedAnswers + (activity.assistedCount || 0),
                    independentAnswers: p.independentAnswers + (activity.independentCount || 0),
                  },
                },
              };
            });

            return {
              xpAwarded: res.xpAwarded,
              totalXp: resTotalXp,
              streak: resStreak,
            };
          }
        } catch (err) {
          console.debug("[store] Fallback to optimistic local progress update:", err);
        }
      }

      // Guest / Offline fallback update
      let updatedTotalXp = 0;
      let calculatedStreak = 1;
      setState((current) => {
        const p = current.progress[activity.languageId];
        updatedTotalXp = p.xp + earnedXp;
        calculatedStreak = (p.currentStreak || 0) + 1;
        const completedLessons = activity.completedLessonId && !p.completedLessons.includes(activity.completedLessonId)
          ? [...p.completedLessons, activity.completedLessonId]
          : p.completedLessons;
        const completedGames = activity.completedGameId && !p.completedGames.includes(activity.completedGameId)
          ? [...p.completedGames, activity.completedGameId]
          : p.completedGames;
        const completedStories = activity.completedStoryId && !p.completedStories?.includes(activity.completedStoryId)
          ? [...(p.completedStories || []), activity.completedStoryId]
          : (p.completedStories || []);
        const storyPages = activity.storyPage
          ? { ...p.storyPages, [activity.storyPage.storyId]: Math.max(p.storyPages[activity.storyPage.storyId] || 0, activity.storyPage.page) }
          : p.storyPages;
        const savedConcepts = activity.savedConceptId && !p.savedConcepts.includes(activity.savedConceptId)
          ? [...p.savedConcepts, activity.savedConceptId]
          : p.savedConcepts;

        return {
          ...current,
          progress: {
            ...current.progress,
            [activity.languageId]: {
              ...p,
              xp: updatedTotalXp,
              completedLessons,
              completedGames,
              completedStories,
              storyPages,
              savedConcepts,
              currentStreak: calculatedStreak,
              longestStreak: Math.max(p.longestStreak || 0, calculatedStreak),
              lastActivity: new Date().toISOString(),
              lastActivityDate: clientDate,
              assistedAnswers: p.assistedAnswers + (activity.assistedCount || 0),
              independentAnswers: p.independentAnswers + (activity.independentCount || 0),
            },
          },
        };
      });

      return {
        xpAwarded: earnedXp,
        totalXp: updatedTotalXp,
        streak: calculatedStreak,
      };
    },
    [userId],
  );

  const saveConcept = useCallback((conceptId: string) => {
    updateProgress(state.target, (progress) => ({
      ...progress,
      savedConcepts: progress.savedConcepts.includes(conceptId) ? progress.savedConcepts : [...progress.savedConcepts, conceptId],
      xp: progress.xp + (progress.savedConcepts.includes(conceptId) ? 0 : 2),
    }));
  }, [state.target, updateProgress]);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lufo-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [state]);

  const importData = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      setState(migrate(parsed));
      return { ok: true, message: "Progress imported on this device." };
    } catch {
      return { ok: false, message: "That file is not valid LUFO progress data." };
    }
  }, []);

  const deleteData = useCallback(() => {
    localStorage.removeItem(storageKey(userId));
    setState(initialState);
  }, [userId]);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      userId,
      update,
      updateAccess,
      updateProgress,
      recordActivity,
      saveConcept,
      exportData,
      importData,
      deleteData,
    }),
    [state, hydrated, userId, update, updateAccess, updateProgress, recordActivity, saveConcept, exportData, importData, deleteData],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useLearner() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useLearner must be used inside LearnerProvider");
  return value;
}
