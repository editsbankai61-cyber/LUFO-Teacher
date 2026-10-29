// @ts-check
import { getSoundPrefs } from "./sound";

export type SpeechOptions = {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Play synthesized speech for Indian language phrases.
 * Respects quiet mode and volume settings from sound preferences.
 */
export function speakText(
  text: string,
  locale: string,
  options: SpeechOptions = {},
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const prefs = getSoundPrefs();
  if (prefs.quiet || prefs.volume <= 0) {
    return false;
  }

  try {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = options.rate ?? 0.85;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = prefs.volume;

    // Search for a matching Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = locale.split("-")[0].toLowerCase();
    const matchingVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === locale.toLowerCase() ||
        v.lang.toLowerCase().startsWith(langPrefix),
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      currentUtterance = null;
      options.onError?.(e);
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn("[audio] Speech synthesis playback error:", err);
    return false;
  }
}

/**
 * Cancel and stop any ongoing speech synthesis immediately.
 */
export function stopSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  return currentUtterance !== null;
}

/**
 * Check if the browser currently supports speech synthesis for a locale.
 */
export function isSpeechSupported(locale?: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  if (!locale) return true;

  const voices = window.speechSynthesis.getVoices();
  const langPrefix = locale.split("-")[0].toLowerCase();
  return voices.some(
    (v) =>
      v.lang.toLowerCase() === locale.toLowerCase() ||
      v.lang.toLowerCase().startsWith(langPrefix),
  );
}
