import { useEffect, type ReactNode } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { LearnerProvider, useLearner } from "@/lib/store";
import { bindUiTicks } from "@/lib/sound";

function SoundRoot() {
  const { state } = useLearner();
  useEffect(() => {
    bindUiTicks();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = state.access.reducedMotion ? "reduced" : "full";
  }, [state.access.reducedMotion]);
  return null;
}

export function LearnerBridge({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="boot-screen">
        <span className="brand-orbit">L</span>
        <p>Opening LUFO…</p>
      </div>
    );
  }
  return (
    <LearnerProvider userId={user?.id ?? "guest"}>
      <SoundRoot />
      {children}
    </LearnerProvider>
  );
}
