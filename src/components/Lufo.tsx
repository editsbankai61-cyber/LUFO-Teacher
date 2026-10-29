import { useEffect, useRef, useState } from "react";
import { Hand, Heart, MessageCircle, Minus, MousePointer2, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useLearner } from "@/lib/store";

type Mood = "idle" | "curious" | "listening" | "thinking" | "speaking" | "surprised" | "encouraging" | "celebrating" | "resting";

const moodText: Record<Mood, string> = {
  idle: "I’m here when you need a hint.",
  curious: "Ooh—what does that word reveal?",
  listening: "I’m listening. Typing works beautifully too.",
  thinking: "Let’s think one small step at a time.",
  speaking: "Here’s a clear, written explanation.",
  surprised: "Boink! My hat nearly learned to fly.",
  encouraging: "Mistakes are useful clues. Try another route.",
  celebrating: "You connected the meaning—high five!",
  resting: "Quiet company mode is on.",
};

export function Lufo({ mood: externalMood = "idle", compact = false }: { mood?: Mood; compact?: boolean }) {
  const { state, updateAccess } = useLearner();
  const [mood, setMood] = useState<Mood>(externalMood);
  const [message, setMessage] = useState(moodText[externalMood]);
  const [minimized, setMinimized] = useState(compact);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMood(externalMood);
    setMessage(moodText[externalMood]);
  }, [externalMood]);

  if (!state.access.lufoVisible) return null;

  const react = (next: Mood, text?: string) => {
    setMood(next);
    setMessage(text ?? moodText[next]);
    window.setTimeout(() => setMood(state.access.quiet ? "resting" : "idle"), 1600);
  };

  const pointerDown = (event: React.PointerEvent) => {
    start.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerUp = (event: React.PointerEvent) => {
    const origin = start.current;
    setDragging(false);
    if (!origin) return;
    const distance = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
    react(distance > 24 ? "celebrating" : "curious", distance > 24 ? "Safe landing! My feet were dangling." : "Hat adjusted. Ready!");
    start.current = null;
  };

  return (
    <aside className={`lufo-dock ${minimized ? "is-minimized" : ""}`} aria-label="LUFO companion" aria-live="polite">
      {!minimized && (
        <div className="lufo-speech" role="status">
          <strong>{mood === "celebrating" ? "Nice work" : "LUFO says"}</strong>
          <span>{message}</span>
        </div>
      )}
      <div className={`lufo-character mood-${mood} ${dragging ? "is-dragging" : ""}`} onPointerDown={pointerDown} onPointerUp={pointerUp} aria-hidden="true">
        <div className="lufo-hat"><i /><b /></div>
        <div className="lufo-ear left" />
        <div className="lufo-ear right" />
        <div className="lufo-body">
          <div className="lufo-eyes"><i /><i /></div>
          <div className="lufo-mouth" />
          <div className="lufo-glow" />
        </div>
        <div className="lufo-arm left" /><div className="lufo-arm right" />
        <div className="lufo-foot left" /><div className="lufo-foot right" />
      </div>
      <div className="lufo-actions" aria-label="LUFO interaction alternatives">
        <button className="icon-button" aria-label={minimized ? "Expand LUFO" : "Minimize LUFO"} title={minimized ? "Expand LUFO" : "Minimize LUFO"} onClick={() => setMinimized((value) => !value)}><Minus size={17} /></button>
        {!minimized && <>
          <button className="icon-button" aria-label="Pat LUFO on the head" title="Pat head" onClick={() => react("curious", "Blink, bounce… hat secure!")}><Hand size={17} /></button>
          <button className="icon-button" aria-label="Tap LUFO’s belly" title="Belly tap" onClick={() => react("celebrating", "That tickles—tiny giggle unlocked.")}><Heart size={17} /></button>
          <button className="icon-button" aria-label="Pet LUFO" title="Pet LUFO" onClick={() => react("encouraging", "I’m leaning in. We can learn gently.")}><MousePointer2 size={17} /></button>
          <button className="icon-button" aria-label="Playfully bonk LUFO’s hat" title="Playful bonk" onClick={() => react("surprised")}><Sparkles size={17} /></button>
          <a className="icon-button" aria-label="Open Talk to LUFO" title="Open chat" href="/app/talk"><MessageCircle size={17} /></a>
          <button className="icon-button" aria-label={state.access.quiet ? "Turn off quiet-study mode" : "Turn on quiet-study mode"} title="Quiet study" onClick={() => updateAccess({ quiet: !state.access.quiet })}>{state.access.quiet ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
        </>}
      </div>
    </aside>
  );
}
