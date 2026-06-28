import Link from "next/link";
import { format } from "date-fns";
import type { GoalItem } from "@/types/dashboard";

export function DonezoReminders({ goals }: { goals: GoalItem[] }) {
  const upcoming = goals
    .filter((g) => !g.isCompleted && g.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0];

  const nextGoal = upcoming ?? goals.find((g) => !g.isCompleted);

  return (
    <div className="donezo-panel rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-base font-bold text-[#831843]">Reminders</h2>
      {nextGoal ? (
        <>
          <p className="mt-4 text-sm font-semibold text-[#831843]">{nextGoal.title}</p>
          <p className="mt-1 text-xs text-pink-400">
            {nextGoal.deadline
              ? `Due ${format(new Date(nextGoal.deadline), "MMM d · h:mm a")}`
              : `${nextGoal.progress} / ${nextGoal.targetHrs} hrs completed`}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-xl bg-pink-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-pink-700"
          >
            Start session
          </Link>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-pink-400">No upcoming goals</p>
          <Link
            href="/goals"
            className="mt-4 inline-flex rounded-xl bg-pink-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-pink-700"
          >
            Create a goal
          </Link>
        </>
      )}
    </div>
  );
}
