"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

import { MiniTimerProvider } from "@/components/providers/MiniTimerProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <MiniTimerProvider>{children}</MiniTimerProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
