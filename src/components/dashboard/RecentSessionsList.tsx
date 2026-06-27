import Link from "next/link";
import { DashboardCard, DashboardSectionHeader } from "./DashboardCard";
import {
  formatRelativeTime,
  formatSessionDuration,
} from "@/lib/dashboard-data";
import type { RecentSessionItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const MODE_STYLES: Record<string, string> = {
  pomodoro: "bg-pink-100 text-pink-700 ring-1 ring-pink-200",
  stopwatch: "bg-pink-50 text-pink-600 ring-1 ring-pink-200",
  countdown: "bg-pink-200/60 text-pink-800 ring-1 ring-pink-300",
  focus: "bg-pink-300/40 text-pink-900 ring-1 ring-pink-300",
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
    <DashboardCard className="relative">
      <DashboardSectionHeader
        title="Recent sessions"
        action="Start timer →"
        actionHref="/"
      />

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-pink-200 bg-pink-50/50 py-10 text-center">
          <span className="text-3xl">⏱️</span>
          <p className="mt-3 text-sm text-[var(--text-muted)]">Nothing yet — start your first session</p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-400"
          >
            Start timer
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-pink-200 hover:bg-pink-50/60 sm:grid-cols-[minmax(100px,1.2fr)_auto_auto_auto]"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-sm text-[var(--text)]">
                {session.label ? (
                  <>
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-pink-100"
                      style={{ backgroundColor: session.label.color }}
                    />
                    <span className="truncate">{session.label.name}</span>
                  </>
                ) : (
                  <span className="text-[var(--text-muted)]">Unlabeled</span>
                )}
              </span>
              <span className="text-sm font-semibold tabular-nums text-[var(--text)]">
                {formatSessionDuration(session.duration)}
              </span>
              <span
                className={cn(
                  "justify-self-start rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize",
                  MODE_STYLES[session.mode] ?? "bg-pink-50 text-pink-600"
                )}
              >
                {modeLabel(session.mode)}
              </span>
              <span className="text-xs text-[var(--text-muted)] sm:justify-self-end">
                {formatRelativeTime(session.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {hasOlderSessions && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-end justify-center rounded-b-2xl bg-gradient-to-t from-white via-white/90 to-transparent pb-4">
          <p className="pointer-events-auto text-center text-xs text-[var(--text-muted)]">
            Upgrade to see 2 years of history →{" "}
            <Link href="/pricing" className="font-medium text-[var(--primary)] hover:text-[var(--secondary)]">
              Premium
            </Link>
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
