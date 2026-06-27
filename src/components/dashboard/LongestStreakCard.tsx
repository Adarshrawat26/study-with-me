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
    <DashboardCard variant="stat" className="h-full">
      <DashboardLabel>Longest streak</DashboardLabel>
      <div className="mt-3 flex items-end gap-2">
        <DashboardStatValue>
          <CountUp value={longestStreak} />
        </DashboardStatValue>
        <span className="mb-1.5 text-sm text-[var(--text-muted)]">days</span>
        {isRecord && <span className="mb-1.5 text-xl">🏆</span>}
      </div>
      {isRecord && (
        <span className="mt-3 inline-flex rounded-full border border-pink-300 bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-600">
          Personal best
        </span>
      )}
    </DashboardCard>
  );
}
