import { useEffect, useState, type ComponentType } from "react";

export type StageKind = "hero" | "auth" | "map" | "orb";

export function ClientStage({ kind }: { kind: StageKind }) {
  const [View, setView] = useState<ComponentType<{ kind: StageKind }> | null>(null);
  useEffect(() => {
    let live = true;
    void import("./scenes").then((mod) => {
      if (live) setView(() => mod.StageCanvas);
    });
    return () => {
      live = false;
    };
  }, []);
  if (!View) return <div className={`stage-fallback stage-${kind}`} aria-hidden="true" />;
  return <View kind={kind} />;
}
