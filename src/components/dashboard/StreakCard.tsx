"use client";

import { motion } from "framer-motion";
import {
  DashboardCard,
  DashboardLabel,
  DashboardStatValue,
} from "./DashboardCard";
import { CountUp } from "./animations";
import { cn } from "@/lib/utils";

export function StreakCard({ currentStreak }: { currentStreak: number }) {
  const golden = currentStreak >= 7 && currentStreak < 30;
  const rainbow = currentStreak >= 30;

  return (
    <DashboardCard
      variant="stat"
      className={cn(
        "h-full",
        golden && "border-pink-300 shadow-[0_0_32px_rgba(244,114,182,0.15)]",
        rainbow && "border-pink-400"
      )}
    >
      {rainbow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(135deg, rgba(251,207,232,0.4), rgba(244,114,182,0.2), rgba(236,72,153,0.15))",
          }}
        />
      )}
      <div className="relative z-10">
        <DashboardLabel>Current streak</DashboardLabel>
        <div className="mt-3 flex items-end gap-2">
          {currentStreak > 0 ? (
            <>
              <DashboardStatValue>
                <CountUp value={currentStreak} />
              </DashboardStatValue>
              <span className="mb-1.5 text-sm text-[var(--text-muted)]">days</span>
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-1.5 text-xl"
              >
                🔥
              </motion.span>
            </>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
              Study today to start your streak
            </p>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}
