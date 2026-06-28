"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

import { GlobalTimerProvider } from "@/components/providers/GlobalTimerProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <GlobalTimerProvider>{children}</GlobalTimerProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
