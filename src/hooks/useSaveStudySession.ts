"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import {
  MIN_SESSION_SECONDS,
  type StudySessionMode,
} from "@/lib/study-session";

interface SaveOptions {
  labelId?: string | null;
}

export function useSaveStudySession() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const saveSession = useCallback(
    async (
      duration: number,
      mode: StudySessionMode,
      options: SaveOptions = {}
    ): Promise<boolean> => {
      if (!session) {
        toast("Sign in to save your study sessions", "info");
        return false;
      }
      if (duration < MIN_SESSION_SECONDS) {
        toast("Study at least 1 minute to save a session", "info");
        return false;
      }
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duration,
            mode,
            labelId: options.labelId ?? null,
          }),
        });
        if (res.status === 401) {
          toast("Sign in to save sessions", "error");
          return false;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast(
            typeof data.error === "string" ? data.error : "Failed to save session",
            "error"
          );
          return false;
        }
        toast("Session saved! Check your dashboard.", "success");
        return true;
      } catch {
        toast("Failed to save session", "error");
        return false;
      }
    },
    [session, toast]
  );

  return { saveSession, isSignedIn: !!session };
}
