"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MiniTimerWidget } from "@/components/timer/MiniTimerWidget";
import {
  isMiniFloatingEnabled,
  setMiniFloatingEnabled,
  subscribeMiniTimer,
} from "@/lib/mini-timer-store";

interface MiniTimerContextValue {
  floating: boolean;
  enableFloating: () => void;
  disableFloating: () => void;
}

const MiniTimerContext = createContext<MiniTimerContextValue | null>(null);

const HIDDEN_ROUTES = ["/embed", "/mini", "/flip-clock"];

export function MiniTimerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [floating, setFloating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFloating(isMiniFloatingEnabled());
    setMounted(true);
    return subscribeMiniTimer((msg) => {
      if (msg.type === "floating" && typeof msg.enabled === "boolean") {
        setFloating(msg.enabled);
      }
      if (msg.type === "storage") {
        setFloating(isMiniFloatingEnabled());
      }
    });
  }, []);

  const enableFloating = () => {
    setMiniFloatingEnabled(true);
    setFloating(true);
  };

  const disableFloating = () => {
    setMiniFloatingEnabled(false);
    setFloating(false);
  };

  const hidden = HIDDEN_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  return (
    <MiniTimerContext.Provider value={{ floating, enableFloating, disableFloating }}>
      {children}
      {mounted && floating && !hidden && (
        <MiniTimerWidget onClose={disableFloating} />
      )}
    </MiniTimerContext.Provider>
  );
}

export function useMiniTimerFloating() {
  const ctx = useContext(MiniTimerContext);
  if (!ctx) throw new Error("useMiniTimerFloating must be used within MiniTimerProvider");
  return ctx;
}
