import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setSoundPrefs } from "@/lib/sound";
import type { FamiliarLanguageId, LanguageId } from "./content";

type AccessPrefs = {
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

type LanguageProgress = {
  xp: number;
  completedLessons: string[];
  completedGames: string[];
  storyPages: Record<string, number>;
  savedConcepts: string[];
  assistedAnswers: number;
  independentAnswers: number;
  lastActivity: string | null;
};

type LearnerState = {
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
  storyPages: {},
  savedConcepts: [],
  assistedAnswers: 0,
  independentAnswers: 0,
  lastActivity: null,
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
  update: (next: Partial<LearnerState> | ((value: LearnerState) => LearnerState)) => void;
  updateAccess: (next: Partial<AccessPrefs>) => void;
  updateProgress: (language: LanguageId, next: Partial<LanguageProgress> | ((value: LanguageProgress) => LanguageProgress)) => void;
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

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(state));
    } catch {
      // Storage failures are non-destructive; export remains available when the browser permits downloads.
    }
  }, [state, hydrated, userId]);

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

  const value = useMemo(() => ({ state, hydrated, update, updateAccess, updateProgress, saveConcept, exportData, importData, deleteData }), [state, hydrated, update, updateAccess, updateProgress, saveConcept, exportData, importData, deleteData]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useLearner() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useLearner must be used inside LearnerProvider");
  return value;
}
