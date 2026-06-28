"use client";

import Link from "next/link";
import { Pause, Square } from "lucide-react";

function formatClock(totalMinutes: number) {
  const totalSeconds = totalMinutes * 60;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function DonezoTimeTrackerCard({ todayMinutes }: { todayMinutes: number }) {
  return (
    <div className="donezo-timer-card relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#831843] via-[#9D174D] to-[#BE185D] p-5 text-white shadow-lg shadow-pink-300/30">
      <div className="donezo-wave-pattern pointer-events-none absolute inset-0 opacity-25" />
      <p className="relative text-sm font-semibold text-pink-100">Time studied today</p>
      <p className="relative mt-3 font-heading text-4xl font-bold tabular-nums tracking-tight">
        {formatClock(todayMinutes)}
      </p>
      <div className="relative mt-5 flex gap-2">
        <Link
          href="/"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/25"
        >
          <Pause className="h-3.5 w-3.5" />
          Open timer
        </Link>
        <Link
          href="/focus"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#831843] transition hover:bg-pink-50"
        >
          <Square className="h-3.5 w-3.5" />
          Focus
        </Link>
      </div>
    </div>
  );
}
