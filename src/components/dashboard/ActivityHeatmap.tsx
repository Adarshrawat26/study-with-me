"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  startOfWeek,
  eachDayOfInterval,
  format,
  endOfYear,
  startOfYear,
} from "date-fns";
import { DashboardCard } from "./DashboardCard";
import { formatMinutesHm } from "@/lib/dashboard-data";
import type { HeatmapCell } from "@/types/dashboard";
import { cn } from "@/lib/utils";

function intensityClass(minutes: number) {
  if (minutes === 0) return "bg-pink-100";
  if (minutes <= 30) return "bg-pink-200";
  if (minutes <= 60) return "bg-pink-300";
  if (minutes <= 120) return "bg-pink-400";
  return "bg-pink-500";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

export function ActivityHeatmap({
  data,
  year,
  isPremium,
}: {
  data: HeatmapCell[];
  year: number;
  totalHours: number;
  activeDays: number;
  isPremium: boolean;
}) {
  const [selectedYear, setSelectedYear] = useState(year);
  const years = isPremium
    ? [year - 2, year - 1, year].filter((y) => y >= 2024)
    : [year];

  const { dataMap, yearStats } = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      if (d.date.startsWith(String(selectedYear))) {
        map.set(d.date, d.minutes);
      }
    });
    let total = 0;
    let days = 0;
    map.forEach((minutes) => {
      if (minutes > 0) {
        total += minutes;
        days += 1;
      }
    });
    return {
      dataMap: map,
      yearStats: {
        hours: Math.round((total / 60) * 10) / 10,
        days,
      },
    };
  }, [data, selectedYear]);

  const grid = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(yearStart);
    const gridStart = startOfWeek(yearStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: gridStart, end: yearEnd });

    const weeks: { date: Date; minutes: number }[][] = [];
    let week: { date: Date; minutes: number }[] = [];

    days.forEach((date) => {
      const key = format(date, "yyyy-MM-dd");
      week.push({ date, minutes: dataMap.get(key) ?? 0 });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ date: new Date(), minutes: -1 });
      }
      weeks.push(week);
    }
    return weeks.slice(0, 53);
  }, [dataMap, selectedYear]);

  const monthPositions = useMemo(() => {
    const positions: { month: string; col: number }[] = [];
    let lastMonth = -1;
    grid.forEach((week, col) => {
      const firstValid = week.find((c) => c.minutes >= 0);
      if (!firstValid) return;
      const m = firstValid.date.getMonth();
      if (m !== lastMonth) {
        positions.push({ month: MONTHS[m], col });
        lastMonth = m;
      }
    });
    return positions;
  }, [grid]);

  return (
    <DashboardCard className="relative overflow-hidden">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-semibold tracking-tight text-[var(--text)]">Activity</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs text-[var(--text)] outline-none transition focus:border-pink-400"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="relative mb-1 ml-8 flex h-4">
            {monthPositions.map(({ month, col }) => (
              <span
                key={`${month}-${col}`}
                className="absolute text-[10px] text-[var(--text-muted)]"
                style={{ left: col * 13 }}
              >
                {month}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="flex flex-col gap-[3px] pt-0.5">
              {DAY_LABELS.map((label, i) => (
                <span key={i} className="flex h-[10px] w-6 items-center text-[9px] text-pink-400">
                  {label}
                </span>
              ))}
            </div>
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, di) => {
                  if (cell.minutes < 0) {
                    return <div key={di} className="h-[10px] w-[10px]" />;
                  }
                  return (
                    <div
                      key={di}
                      title={`${format(cell.date, "MMM d")} — ${formatMinutesHm(cell.minutes)}`}
                      className={cn(
                        "h-[10px] w-[10px] rounded-sm transition-colors hover:ring-1 hover:ring-pink-400/60",
                        intensityClass(cell.minutes)
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          {yearStats.hours} hours across {yearStats.days} days in {selectedYear}
        </p>
        {!isPremium && (
          <p className="mt-2 text-xs text-pink-500">
            Showing this year ·{" "}
            <Link href="/pricing" className="text-[var(--primary)] hover:text-[var(--secondary)]">
              Upgrade for 2+ years of history
            </Link>
          </p>
        )}
      </div>
      </DashboardCard>
  );
}
