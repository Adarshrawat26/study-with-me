"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, eachDayOfInterval, subDays, startOfDay } from "date-fns";
import type { HeatmapCell } from "@/types/dashboard";
import { cn } from "@/lib/utils";

function intensity(minutes: number) {
  if (minutes === 0) return "bg-pink-50 ring-1 ring-pink-100/80";
  if (minutes <= 25) return "bg-pink-200";
  if (minutes <= 60) return "bg-pink-300";
  if (minutes <= 120) return "bg-pink-400";
  return "bg-pink-600";
}

function formatHm(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function computeDetailedStats(data: HeatmapCell[]) {
  const map = new Map(data.map((d) => [d.date, d.minutes]));
  const end = startOfDay(new Date());
  const start = subDays(end, 83);
  const days = eachDayOfInterval({ start, end }).map((date) => ({
    date,
    minutes: map.get(format(date, "yyyy-MM-dd")) ?? 0,
  }));

  const active = days.filter((d) => d.minutes > 0);
  const totalMinutes = days.reduce((s, d) => s + d.minutes, 0);
  const best = active.length
    ? active.reduce((max, d) => (d.minutes > max.minutes ? d : max), active[0])
    : null;

  let longestStreak = 0;
  let streak = 0;
  for (const d of days) {
    if (d.minutes > 0) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  const topDays = [...active].sort((a, b) => b.minutes - a.minutes).slice(0, 5);

  const monthly = new Map<string, number>();
  for (const cell of data) {
    const month = cell.date.slice(0, 7);
    monthly.set(month, (monthly.get(month) ?? 0) + cell.minutes);
  }
  const monthlySorted = Array.from(monthly.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, minutes]) => ({
      label: format(new Date(`${key}-01`), "MMM yyyy"),
      minutes,
    }));

  return {
    days,
    totalMinutes,
    activeCount: active.length,
    avgActive: active.length ? Math.round(totalMinutes / active.length) : 0,
    best,
    longestStreak,
    topDays,
    monthlySorted,
    maxDay: Math.max(...days.map((d) => d.minutes), 1),
  };
}

interface DonezoFullStatsModalProps {
  open: boolean;
  onClose: () => void;
  data: HeatmapCell[];
  yearTotalHours: number;
  yearActiveDays: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  avgSessionMinutes: number;
  year: number;
}

export function DonezoFullStatsModal({
  open,
  onClose,
  data,
  yearTotalHours,
  yearActiveDays,
  currentStreak,
  longestStreak,
  totalSessions,
  avgSessionMinutes,
  year,
}: DonezoFullStatsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const stats = useMemo(() => computeDetailedStats(data), [data]);

  const yearMap = useMemo(() => new Map(data.map((d) => [d.date, d.minutes])), [data]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-pink-950/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[78vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl shadow-pink-200/40 sm:max-w-xl sm:rounded-2xl"
          >
            <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-white px-4 py-3 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-bold text-[#831843]">Detailed study stats</h2>
                  <p className="mt-0.5 text-xs text-pink-500">Last 12 weeks + {year} overview</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-pink-200 px-2.5 py-1 text-xs font-medium text-pink-600 hover:bg-pink-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-4 py-3 sm:px-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "12-week total", value: formatHm(stats.totalMinutes) },
                  { label: "Active days", value: String(stats.activeCount) },
                  { label: "Avg / active day", value: stats.avgActive > 0 ? formatHm(stats.avgActive) : "—" },
                  { label: "Best streak", value: `${stats.longestStreak}d` },
                  { label: `${year} total`, value: `${yearTotalHours}h` },
                  { label: `${year} active`, value: String(yearActiveDays) },
                  { label: "Current streak", value: `${currentStreak}d` },
                  { label: "All-time best", value: `${longestStreak}d` },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-pink-100 bg-pink-50/40 p-2">
                    <p className="text-base font-bold tabular-nums text-[#831843]">{item.value}</p>
                    <p className="mt-0.5 text-[10px] font-medium leading-tight text-pink-500">{item.label}</p>
                  </div>
                ))}
              </div>

              {stats.best && (
                <p className="mt-3 rounded-lg bg-gradient-to-r from-pink-600 to-rose-500 px-3 py-2 text-xs font-medium text-white">
                  Best day: {format(stats.best.date, "EEE, MMM d")} · {formatHm(stats.best.minutes)}
                </p>
              )}

              <div className="mt-4">
                <h3 className="text-xs font-bold text-[#831843]">12-week heatmap</h3>
                <div className="mx-auto mt-2 max-w-[280px] grid grid-cols-[repeat(12,minmax(0,1fr))] gap-0.5">
                  {Array.from({ length: 12 }).map((_, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1">
                      {stats.days.slice(weekIdx * 7, weekIdx * 7 + 7).map((cell) => (
                        <div
                          key={cell.date.toISOString()}
                          title={`${format(cell.date, "MMM d, yyyy")} — ${cell.minutes} min`}
                          className={cn(
                            "aspect-square w-full rounded-[3px]",
                            intensity(cell.minutes)
                          )}
                          style={
                            cell.minutes > 0
                              ? { opacity: 0.45 + (cell.minutes / stats.maxDay) * 0.55 }
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {stats.monthlySorted.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-[#831843]">Monthly breakdown</h3>
                  <ul className="mt-2 space-y-1.5">
                    {stats.monthlySorted.map((m) => {
                      const maxM = Math.max(...stats.monthlySorted.map((x) => x.minutes), 1);
                      return (
                        <li key={m.label} className="flex items-center gap-3">
                          <span className="w-20 shrink-0 text-xs font-medium text-pink-600">{m.label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-pink-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500"
                              style={{ width: `${(m.minutes / maxM) * 100}%` }}
                            />
                          </div>
                          <span className="w-14 shrink-0 text-right text-xs tabular-nums text-pink-500">
                            {formatHm(m.minutes)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {stats.topDays.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-[#831843]">Top study days</h3>
                  <ul className="mt-2 divide-y divide-pink-50 rounded-lg border border-pink-100">
                    {stats.topDays.slice(0, 3).map((day, i) => (
                      <li key={day.date.toISOString()} className="flex items-center justify-between px-3 py-2">
                        <span className="text-xs text-[#831843]">
                          <span className="mr-1.5 text-pink-400">#{i + 1}</span>
                          {format(day.date, "EEE, MMM d")}
                        </span>
                        <span className="text-xs font-semibold tabular-nums text-pink-600">
                          {formatHm(day.minutes)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-pink-100 bg-pink-50/30 p-3">
                <div>
                  <p className="text-[10px] text-pink-500">Total sessions</p>
                  <p className="text-base font-bold text-[#831843]">{totalSessions}</p>
                </div>
                <div>
                  <p className="text-[10px] text-pink-500">Avg session (30d)</p>
                  <p className="text-base font-bold text-[#831843]">
                    {avgSessionMinutes > 0 ? formatHm(avgSessionMinutes) : "—"}
                  </p>
                </div>
              </div>

              <p className="mt-3 pb-1 text-center text-[10px] text-pink-300">
                {yearMap.size} days with data recorded in {year}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
