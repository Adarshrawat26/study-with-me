"use client";

import { useMemo, useState } from "react";
import { eachDayOfInterval, format, subDays, startOfDay } from "date-fns";
import type { HeatmapCell } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { DonezoFullStatsModal } from "./DonezoFullStatsModal";

function intensity(minutes: number) {
  if (minutes === 0) return "bg-pink-50 ring-1 ring-pink-100/80";
  if (minutes <= 25) return "bg-pink-200";
  if (minutes <= 60) return "bg-pink-300";
  if (minutes <= 120) return "bg-pink-400";
  return "bg-pink-600";
}

export function DonezoMiniHeatmap({
  data,
  yearTotalHours,
  yearActiveDays,
  currentStreak,
  longestStreak,
  totalSessions,
  avgSessionMinutes,
  year,
  isPremium,
}: {
  data: HeatmapCell[];
  yearTotalHours: number;
  yearActiveDays: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  avgSessionMinutes: number;
  year: number;
  isPremium: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const { days, maxMinutes, weekTotalHours, weekActiveDays } = useMemo(() => {
    const map = new Map(data.map((d) => [d.date, d.minutes]));
    const end = startOfDay(new Date());
    const dayCount = isPremium ? 83 : 13;
    const start = subDays(end, dayCount);
    const interval = eachDayOfInterval({ start, end });
    const list = interval.map((date) => {
      const key = format(date, "yyyy-MM-dd");
      return { date, minutes: map.get(key) ?? 0 };
    });
    const max = Math.max(...list.map((d) => d.minutes), 1);
    const weekMinutes = list.reduce((s, d) => s + d.minutes, 0);
    return {
      days: list,
      maxMinutes: max,
      weekTotalHours: Math.round((weekMinutes / 60) * 10) / 10,
      weekActiveDays: list.filter((d) => d.minutes > 0).length,
    };
  }, [data, isPremium]);

  return (
    <>
      <div className="donezo-panel rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-bold text-[#831843]">Study consistency</h2>
            <p className="mt-1 text-xs text-pink-400">
              {isPremium ? "Last 12 weeks · darker = more focus time" : "Last 14 days · upgrade for full year"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-[#831843]">{weekTotalHours}h</p>
            <p className="text-[10px] text-pink-400">{weekActiveDays} active days</p>
          </div>
        </div>

        <div className={cn("grid gap-1 sm:gap-1.5", isPremium ? "grid-cols-[repeat(12,minmax(0,1fr))]" : "grid-cols-[repeat(2,minmax(0,1fr))]")}>
          {Array.from({ length: isPremium ? 12 : 2 }).map((_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1 sm:gap-1.5">
              {days.slice(weekIdx * 7, weekIdx * 7 + 7).map((cell) => (
                <div
                  key={cell.date.toISOString()}
                  title={`${format(cell.date, "MMM d")} — ${cell.minutes} min`}
                  className={cn(
                    "aspect-square w-full rounded-[4px] transition-transform hover:scale-110",
                    intensity(cell.minutes)
                  )}
                  style={
                    cell.minutes > 0
                      ? { opacity: 0.45 + (cell.minutes / maxMinutes) * 0.55 }
                      : undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-pink-400">
            <span>Less</span>
            {[0, 30, 60, 120].map((m, i) => (
              <span
                key={m}
                className={cn("h-2.5 w-2.5 rounded-sm", intensity(m))}
                style={i > 0 ? { opacity: 0.5 + i * 0.15 } : undefined}
              />
            ))}
            <span>More</span>
          </div>
          <button
            type="button"
            onClick={() => isPremium && setModalOpen(true)}
            className={cn(
              "text-xs font-semibold text-pink-600 hover:text-pink-800",
              !isPremium && "cursor-not-allowed opacity-60"
            )}
          >
            {isPremium ? "View full stats →" : "Full stats (Premium) 🔒"}
          </button>
        </div>
      </div>

      {isPremium && (
        <DonezoFullStatsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          data={data}
          yearTotalHours={yearTotalHours}
          yearActiveDays={yearActiveDays}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          totalSessions={totalSessions}
          avgSessionMinutes={avgSessionMinutes}
          year={year}
        />
      )}
    </>
  );
}
