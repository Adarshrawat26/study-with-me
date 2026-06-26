"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Pusher from "pusher-js";
import { isPusherConfigured } from "@/lib/pusher-client";
import { formatDuration } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { GroupTimerState } from "@/lib/group-timer";

interface GroupSharedTimerProps {
  groupId: string;
  isAdmin: boolean;
}

export function GroupSharedTimer({ groupId, isAdmin }: GroupSharedTimerProps) {
  const { toast } = useToast();
  const [timer, setTimer] = useState<GroupTimerState | null>(null);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTimer = useCallback(async () => {
    const res = await fetch(`/api/groups/${groupId}/timer`);
    const data = await res.json();
    if (data.timer) {
      setTimer(data.timer);
      setDisplaySeconds(data.timer.remaining);
    }
  }, [groupId]);

  useEffect(() => { fetchTimer(); }, [fetchTimer]);

  useEffect(() => {
    if (!isPusherConfigured()) {
      const poll = setInterval(fetchTimer, 3000);
      return () => clearInterval(poll);
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(`group-${groupId}`);
    channel.bind("timer-update", (state: GroupTimerState) => {
      setTimer(state);
      setDisplaySeconds(state.remaining);
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`group-${groupId}`);
      pusher.disconnect();
    };
  }, [groupId, fetchTimer]);

  useEffect(() => {
    if (!timer?.isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setDisplaySeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer?.isRunning]);

  useEffect(() => {
    if (displaySeconds === 0 && timer?.isRunning) {
      toast("Group Pomodoro complete!", "success");
    }
  }, [displaySeconds, timer?.isRunning, toast]);

  const sendAction = async (action: "start" | "pause" | "reset") => {
    const res = await fetch(`/api/groups/${groupId}/timer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, duration: timer?.duration ?? 1500 }),
    });
    const data = await res.json();
    if (res.ok) {
      setTimer(data.timer);
      setDisplaySeconds(data.timer.remaining);
    } else {
      toast(data.error ?? "Failed", "error");
    }
  };

  if (!timer) return null;

  return (
    <div className="glass-card p-4">
      <h3 className="section-title mb-3">Shared Pomodoro</h3>

      <div className="text-center">
        <motion.span
          key={displaySeconds}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          className="font-heading text-3xl font-bold tabular-nums"
        >
          {formatDuration(displaySeconds)}
        </motion.span>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {timer.isRunning ? "Running" : "Paused"}
        </p>
      </div>

      {isAdmin ? (
        <div className="mt-3 flex justify-center gap-2">
          {!timer.isRunning ? (
            <button onClick={() => sendAction("start")} className="btn-primary px-3 py-1.5 text-xs">
              Start
            </button>
          ) : (
            <button onClick={() => sendAction("pause")} className="btn-secondary px-3 py-1.5 text-xs">
              Pause
            </button>
          )}
          <button onClick={() => sendAction("reset")} className="btn-secondary px-3 py-1.5 text-xs">
            Reset
          </button>
        </div>
      ) : (
        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          Synced with group admin
        </p>
      )}
    </div>
  );
}
