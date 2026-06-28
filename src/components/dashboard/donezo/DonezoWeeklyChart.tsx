"use client";

import type { CSSProperties } from "react";
import type { WeeklyDayData } from "@/types/dashboard";

function barStyle(entry: WeeklyDayData, maxMinutes: number): CSSProperties {
  const heightPct = maxMinutes > 0 ? Math.max(8, (entry.minutes / maxMinutes) * 100) : 8;

  if (entry.isFuture || entry.minutes === 0) {
    return {
      height: `${Math.max(12, heightPct * 0.4)}%`,
      background:
        "repeating-linear-gradient(-45deg, #FCE7F3, #FCE7F3 4px, #FDF2F8 4px, #FDF2F8 8px)",
      border: "1px solid #FBCFE8",
    };
  }

  if (entry.isToday) {
    return {
      height: `${heightPct}%`,
      background: "linear-gradient(180deg, #DB2777 0%, #BE185D 100%)",
    };
  }

  const ratio = entry.minutes / maxMinutes;
  if (ratio >= 0.7) {
    return {
      height: `${heightPct}%`,
      background: "linear-gradient(180deg, #EC4899 0%, #DB2777 100%)",
    };
  }

  return {
    height: `${heightPct}%`,
    background: "linear-gradient(180deg, #F9A8D4 0%, #F472B6 100%)",
  };
}

export function DonezoWeeklyChart({ data }: { data: WeeklyDayData[] }) {
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);
  const todayEntry = data.find((d) => d.isToday);
  const todayPct =
    todayEntry && maxMinutes > 0
      ? Math.round((todayEntry.minutes / maxMinutes) * 100)
      : 0;

  const dayLabels = data.map((d) => d.day.charAt(0));

  return (
    <div className="donezo-panel rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-base font-bold text-[#831843]">Study analytics</h2>
        <select className="rounded-lg border border-pink-100 bg-[#FAFAFA] px-2 py-1 text-xs text-pink-600 focus:outline-none">
          <option>This week</option>
        </select>
      </div>

      <div className="relative flex h-[180px] items-end justify-between gap-2 px-1 sm:gap-3">
        {data.map((entry, i) => (
          <div key={entry.day} className="group relative flex flex-1 flex-col items-center">
            {entry.isToday && todayPct > 0 && (
              <span className="absolute -top-7 rounded-md bg-[#831843] px-2 py-0.5 text-[10px] font-semibold text-white">
                {todayPct}%
              </span>
            )}
            <div className="flex h-[140px] w-full items-end justify-center">
              <div
                className="w-full max-w-[36px] rounded-t-lg transition-all duration-500 group-hover:opacity-90"
                style={barStyle(entry, maxMinutes)}
              />
            </div>
            <span
              className={`mt-2 text-xs font-medium ${
                entry.isToday ? "font-bold text-pink-600" : "text-pink-400"
              }`}
            >
              {dayLabels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
