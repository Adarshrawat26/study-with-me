"use client";

import { DashboardCard } from "./DashboardCard";
import { CountUp } from "./animations";
import type { AllTimeStatsData } from "@/types/dashboard";

export function AllTimeStats({ stats }: { stats: AllTimeStatsData }) {
  const items = [
    { label: "Total hours", value: stats.totalHours, suffix: "h", decimals: 1 },
    { label: "Total sessions", value: stats.totalSessions, suffix: "", decimals: 0 },
    { label: "Total pomodoros", value: stats.totalPomodoros, suffix: "", decimals: 0 },
    { label: "Daily average (30d)", value: stats.dailyAvg30Days, suffix: "h", decimals: 1 },
  ];

  return (
    <DashboardCard accent="cyan">
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        All-time stats
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="relative rounded-xl bg-white/[0.03] px-4 py-3 sm:rounded-none sm:bg-transparent sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0"
          >
            {i > 0 && (
              <div className="dash-stat-divider absolute bottom-2 left-0 top-2 hidden sm:block" />
            )}
            <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
              <CountUp value={item.value} decimals={item.decimals} suffix={item.suffix} />
            </p>
            <p className="mt-1.5 text-xs text-zinc-500">{item.label}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
