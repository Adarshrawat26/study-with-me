"use client";

import {
  DashboardCard,
  DashboardLabel,
  DashboardStatValue,
} from "./DashboardCard";
import { CountUp } from "./animations";

interface LongestStreakCardProps {
  longestStreak: number;
  currentStreak: number;
  isNewRecord: boolean;
}

export function LongestStreakCard({
  longestStreak,
  currentStreak,
  isNewRecord,
}: LongestStreakCardProps) {
  const isRecord = isNewRecord && currentStreak === longestStreak && longestStreak > 0;

  return (
    <DashboardCard variant="stat" accent="cyan" className="h-full">
      <DashboardLabel>Longest streak</DashboardLabel>
      <div className="mt-3 flex items-end gap-2">
        <DashboardStatValue>
          <CountUp value={longestStreak} />
        </DashboardStatValue>
        <span className="mb-1.5 text-sm text-zinc-400">days</span>
        {isRecord && <span className="mb-1.5 text-xl">🏆</span>}
      </div>
      {isRecord && (
        <span className="mt-3 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
          Personal best
        </span>
      )}
    </DashboardCard>
  );
}
