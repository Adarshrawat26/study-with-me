import Link from "next/link";
import { DashboardCard, DashboardSectionHeader } from "./DashboardCard";
import {
  formatRelativeTime,
  formatSessionDuration,
} from "@/lib/dashboard-data";
import type { RecentSessionItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const MODE_STYLES: Record<string, string> = {
  pomodoro: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20",
  stopwatch: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20",
  countdown: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20",
  focus: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
};

function modeLabel(mode: string) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function RecentSessionsList({
  sessions,
  hasOlderSessions,
}: {
  sessions: RecentSessionItem[];
  hasOlderSessions: boolean;
}) {
  return (
    <DashboardCard className="relative" accent="violet">
      <DashboardSectionHeader
        title="Recent sessions"
        action="Start timer →"
        actionHref="/"
      />

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
          <span className="text-3xl">⏱️</span>
          <p className="mt-3 text-sm text-zinc-500">Nothing yet — start your first session</p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
          >
            Start timer
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-white/5 hover:bg-white/[0.04] sm:grid-cols-[minmax(100px,1.2fr)_auto_auto_auto]"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-sm text-zinc-300">
                {session.label ? (
                  <>
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/10"
                      style={{ backgroundColor: session.label.color }}
                    />
                    <span className="truncate">{session.label.name}</span>
                  </>
                ) : (
                  <span className="text-zinc-500">Unlabeled</span>
                )}
              </span>
              <span className="text-sm font-semibold tabular-nums text-white">
                {formatSessionDuration(session.duration)}
              </span>
              <span
                className={cn(
                  "justify-self-start rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize",
                  MODE_STYLES[session.mode] ?? "bg-white/10 text-zinc-400"
                )}
              >
                {modeLabel(session.mode)}
              </span>
              <span className="text-xs text-zinc-500 sm:justify-self-end">
                {formatRelativeTime(session.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {hasOlderSessions && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-end justify-center rounded-b-2xl bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/80 to-transparent pb-4">
          <p className="pointer-events-auto text-center text-xs text-zinc-400">
            Upgrade to see 2 years of history →{" "}
            <Link href="/pricing" className="font-medium text-violet-400 hover:text-violet-300">
              Premium
            </Link>
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
