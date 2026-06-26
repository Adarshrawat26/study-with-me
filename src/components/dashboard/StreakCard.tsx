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
      accent="amber"
      className={cn(
        "h-full",
        golden && "border-amber-400/30 shadow-[0_0_32px_rgba(251,191,36,0.12)]",
        rainbow && "border-violet-400/30"
      )}
    >
      {rainbow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.12), rgba(251,191,36,0.1))",
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
              <span className="mb-1.5 text-sm text-zinc-400">days</span>
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-1.5 text-xl"
              >
                🔥
              </motion.span>
            </>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              Study today to start your streak
            </p>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}
