"use client";

import Link from "next/link";
import {
  DashboardCard,
  DashboardLabel,
  DashboardStatValue,
} from "./DashboardCard";
import type { RankData } from "@/types/dashboard";

function rankIcon(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 10) return "⭐";
  return "🌐";
}

export function RankCard({ rank }: { rank: RankData }) {
  return (
    <DashboardCard variant="stat" className="h-full">
      <DashboardLabel>Global rank</DashboardLabel>
      <div className="mt-3 flex items-center gap-2">
        <DashboardStatValue>#{rank.weeklyRank}</DashboardStatValue>
        <span className="text-2xl">{rankIcon(rank.weeklyRank)}</span>
      </div>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Top {rank.topPercent}% this week</p>
      {rank.hoursToNextRank != null && rank.hoursToNextRank > 0 && (
        <p className="mt-1 text-xs text-pink-500">
          {rank.hoursToNextRank}h behind #{Math.max(1, rank.weeklyRank - 1)} ↑
        </p>
      )}
      <Link
        href="/leaderboard"
        className="mt-4 inline-flex items-center text-sm font-medium text-[var(--primary)] transition-colors hover:text-[var(--secondary)]"
      >
        View leaderboard →
      </Link>
    </DashboardCard>
  );
}
