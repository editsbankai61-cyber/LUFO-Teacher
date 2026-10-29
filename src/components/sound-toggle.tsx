import { Volume2, VolumeX } from "lucide-react";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";

export function SoundToggle() {
  const { state, updateAccess } = useLearner();
  const muted = state.access.quiet || state.access.volume === 0;
  return (
    <button
      type="button"
      className="icon-button sound-switch"
      data-sound="silent"
      aria-pressed={!muted}
      aria-label={muted ? "Turn sound effects on" : "Turn sound effects off"}
      title={muted ? "Sound off" : "Sound on"}
      onClick={() => {
        // muted=true means sound is off. We want to flip it.
        const turningOn = muted;
        updateAccess({ quiet: !turningOn, volume: state.access.volume || 0.65 });
        if (turningOn) playSound("chime");
      }}
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}
