import Link from "next/link";
import { format } from "date-fns";
import { getGreeting } from "@/lib/dashboard-data";

interface DonezoHeroHeaderProps {
  userName: string;
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
  todayMinutes: number;
  weekTotalHours: number;
}

export function DonezoHeroHeader({
  userName,
  currentStreak,
  longestStreak,
  isNewRecord,
  todayMinutes,
  weekTotalHours,
}: DonezoHeroHeaderProps) {
  const h = Math.floor(todayMinutes / 60);
  const m = todayMinutes % 60;

  return (
    <div className="donezo-hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FDF2F8] via-white to-[#FCE7F3] px-4 py-3.5 shadow-sm ring-1 ring-pink-100/80 sm:px-5 sm:py-4">
      <div className="donezo-hero-blob pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-pink-200/30 blur-2xl" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h1 className="font-heading text-lg font-bold tracking-tight text-[#831843] sm:text-xl">
              {getGreeting(userName)}
            </h1>
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

        <div className="flex shrink-0 gap-2">
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
        </div>
      </div>
    </div>
  );
}
