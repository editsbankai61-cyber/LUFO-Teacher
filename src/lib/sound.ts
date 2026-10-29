type Cue = "tick" | "success" | "miss" | "chime" | "whoosh" | "pin";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let quiet = false;
let volume = 0.65;
let reducedMotion = false;
let bound = false;

export function setSoundPrefs(next: { quiet: boolean; volume: number; reducedMotion?: boolean }) {
  quiet = next.quiet;
  volume = next.volume;
  if (typeof next.reducedMotion === "boolean") reducedMotion = next.reducedMotion;
  if (master && ctx) {
    const target = quiet ? 0 : volume * volume;
    master.gain.setTargetAtTime(target, ctx.currentTime, 0.03);
  }
}

export function unlockAudio() {
  if (typeof window === "undefined") return;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!ctx) {
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    sfx = ctx.createGain();
    sfx.gain.value = 1;
    sfx.connect(master);
    master.connect(ctx.destination);
    master.gain.value = quiet ? 0 : volume * volume;
  }
  if (ctx.state === "suspended") void ctx.resume();
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, slide = 0) {
  if (!ctx || !sfx || quiet) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const node = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(48, freq + slide), t + dur);
  node.gain.setValueAtTime(0.0001, t);
  node.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  node.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(node);
  node.connect(sfx);
  osc.start(t);
  osc.stop(t + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    node.disconnect();
  };
}

export function playSound(cue: Cue) {
  unlockAudio();
  if (!ctx || quiet) return;
  const jitter = reducedMotion ? 1 : 1 + (Math.random() - 0.5) * 0.08;
  if (cue === "tick") tone(680 * jitter, 0.045, "triangle", 0.05);
  if (cue === "success") {
    tone(523 * jitter, 0.1, "sine", 0.12);
    tone(784 * jitter, 0.16, "sine", 0.08);
  }
  if (cue === "miss") tone(196, 0.16, "sine", 0.08, -70);
  if (cue === "chime") {
    tone(880 * jitter, 0.12, "sine", 0.08);
    tone(1318, 0.18, "triangle", 0.045);
  }
  if (cue === "whoosh") tone(220, 0.22, "sawtooth", 0.03, 280);
  if (cue === "pin") tone(540 * jitter, 0.09, "triangle", 0.09, 160);
}

export function bindUiTicks() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  const unlock = () => unlockAudio();
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") unlockAudio();
  });
  document.addEventListener("click", (event) => {
    const el = (event.target as HTMLElement | null)?.closest("button, a, [role='tab']");
    if (!el || el.closest("[data-sound='silent']")) return;
    playSound("tick");
  });
}
