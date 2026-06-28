"use client";

import Link from "next/link";
import { format } from "date-fns";
import { exportStatsImage, exportStatsCsv } from "@/lib/export-stats";
import { cn } from "@/lib/utils";

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name.split(" ")[0]}`;
}

interface DonezoHeroHeaderProps {
  userName: string;
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
  todayMinutes: number;
  weekTotalHours: number;
  isPremium: boolean;
  totalHours: number;
}

export function DonezoHeroHeader({
  userName,
  currentStreak,
  longestStreak,
  isNewRecord,
  todayMinutes,
  weekTotalHours,
  isPremium,
  totalHours,
}: DonezoHeroHeaderProps) {
  const h = Math.floor(todayMinutes / 60);
  const m = todayMinutes % 60;

  const handleExportPng = () => {
    exportStatsImage({
      todayHours: Math.round((todayMinutes / 60) * 10) / 10,
      currentStreak,
      longestStreak,
      totalHours,
      userName: userName.split(" ")[0],
    });
  };

  const handleExportCsv = () => {
    exportStatsCsv({
      todayHours: Math.round((todayMinutes / 60) * 10) / 10,
      currentStreak,
      longestStreak,
      totalHours,
      weekHours: weekTotalHours,
      userName: userName.split(" ")[0],
    });
  };

  return (
    <div className={cn(
      "donezo-hero relative overflow-hidden rounded-2xl px-4 py-3.5 shadow-sm sm:px-5 sm:py-4",
      isPremium
        ? "bg-gradient-to-br from-amber-50/80 via-white to-[#FCE7F3] ring-1 ring-amber-200/60"
        : "bg-gradient-to-br from-[#FDF2F8] via-white to-[#FCE7F3] ring-1 ring-pink-100/80"
    )}>
      <div className="donezo-hero-blob pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-pink-200/30 blur-2xl" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h1 className="font-heading text-lg font-bold tracking-tight text-[#831843] sm:text-xl">
              {getGreeting(userName)}
            </h1>
            {isPremium && <span className="badge-pro">Pro</span>}
            <span className="text-[10px] font-medium uppercase tracking-wide text-pink-400">
              {format(new Date(), "EEE · MMM d")}
            </span>
          </div>
          <p className="mt-1 text-xs text-pink-500/90">
            {todayMinutes > 0
              ? `${h > 0 ? `${h}h ` : ""}${m}m today · ${weekTotalHours}h this week`
              : `Pomodoro ready · ${weekTotalHours}h this week`}
          </p>

          {(currentStreak > 0 || (longestStreak > 0 && currentStreak < longestStreak)) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {currentStreak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-pink-700 ring-1 ring-pink-100">
                  🔥 {currentStreak}d{isNewRecord ? " · record!" : ""}
                </span>
              )}
              {longestStreak > 0 && currentStreak < longestStreak && (
                <span className="inline-flex items-center rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium text-pink-500 ring-1 ring-pink-100">
                  Best {longestStreak}d
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-pink-200/50 transition hover:from-pink-500 hover:to-rose-400"
          >
            ▶ Start timer
          </Link>
          <Link
            href="/goals"
            className="inline-flex items-center rounded-xl border border-pink-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-pink-700 transition hover:bg-pink-50"
          >
            + Goal
          </Link>
          {isPremium ? (
            <>
              <button
                type="button"
                onClick={handleExportPng}
                className="inline-flex items-center rounded-xl border border-pink-200 bg-white/90 px-3 py-2 text-xs font-semibold text-pink-700 transition hover:bg-pink-50"
              >
                ↓ PNG
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center rounded-xl border border-amber-200 bg-white/90 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-50"
              >
                CSV
              </button>
            </>
          ) : (
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-xl border border-pink-200 bg-white/60 px-3.5 py-2 text-xs font-semibold text-pink-500 transition hover:bg-pink-50"
            >
              Export stats 🔒
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
