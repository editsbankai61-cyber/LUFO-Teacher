import { Moon, Sun } from "lucide-react";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";

export function ThemeSwitch() {
  const { state, updateAccess } = useLearner();
  const light = state.access.theme === "light";
  return (
    <button
      type="button"
      className="icon-button theme-switch"
      data-sound="silent"
      aria-pressed={light}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      title={light ? "Dark mode" : "Light mode"}
      onClick={() => {
        updateAccess({ theme: light ? "dark" : "light" });
        playSound("chime");
      }}
    >
      {light ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
