"use client";

import { useGlobalTimer } from "@/components/providers/GlobalTimerProvider";

/** Mini timer widget hook — backed by the global timer engine. */
export function useMiniTimer() {
  const ctx = useGlobalTimer();
  return {
    mounted: ctx.mounted,
    state: ctx.state,
    toggle: ctx.toggle,
    reset: ctx.reset,
    saveAndReset: ctx.saveAndReset,
    elapsedSeconds: ctx.elapsedSeconds,
    showSave: ctx.showSave,
    isSignedIn: ctx.isSignedIn,
  };
}
