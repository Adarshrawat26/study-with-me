import Link from "next/link";
import {
  formatRelativeTime,
  formatSessionDuration,
} from "@/lib/dashboard-data";
import type { RecentSessionItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

function statusForSession(session: RecentSessionItem) {
  const hours = session.duration / 3600;
  if (hours >= 1) return { label: "Completed", className: "donezo-badge-completed" };
  if (hours >= 0.5) return { label: "In Progress", className: "donezo-badge-progress" };
  return { label: "Pending", className: "donezo-badge-pending" };
}

export function DonezoActivityFeed({
  sessions,
}: {
  sessions: RecentSessionItem[];
}) {
  return (
    <div className="donezo-panel rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-base font-bold text-[#831843]">Recent activity</h2>
        <Link href="/" className="rounded-lg border border-pink-200 px-3 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-50">
          + Add session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="py-8 text-center text-sm text-pink-400">No sessions yet — start the timer</p>
      ) : (
        <ul className="space-y-4">
          {sessions.slice(0, 4).map((session) => {
            const status = statusForSession(session);
            const initial = session.label?.name?.charAt(0) ?? session.mode.charAt(0).toUpperCase();
            return (
              <li key={session.id} className="flex items-center gap-3 border-b border-pink-50 pb-4 last:border-0 last:pb-0">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    backgroundColor: session.label?.color ?? "#EC4899",
                  }}
                >
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#831843]">
                    {session.label?.name ?? session.mode}
                  </p>
                  <p className="truncate text-xs text-pink-400">
                    {formatSessionDuration(session.duration)} · {formatRelativeTime(session.createdAt)}
                  </p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold", status.className)}>
                  {status.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
