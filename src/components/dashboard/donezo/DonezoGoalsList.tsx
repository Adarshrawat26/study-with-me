import Link from "next/link";
import { format } from "date-fns";
import type { GoalItem } from "@/types/dashboard";

const ICONS = ["📖", "🧪", "📐", "💻", "📝"];

export function DonezoGoalsList({ goals }: { goals: GoalItem[] }) {
  return (
    <div className="donezo-panel rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-base font-bold text-[#831843]">Goals</h2>
      {goals.length === 0 ? (
        <p className="mt-4 text-sm text-pink-400">No goals yet</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {goals.map((goal, i) => (
            <li key={goal.id} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-lg">
                {ICONS[i % ICONS.length]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#831843]">{goal.title}</p>
                <p className="text-xs text-pink-400">
                  {goal.deadline
                    ? `Due ${format(new Date(goal.deadline), "MMM d, yyyy")}`
                    : `${goal.progress}/${goal.targetHrs} hrs`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/goals" className="mt-4 inline-block text-xs font-semibold text-pink-500 hover:text-pink-700">
        View all →
      </Link>
    </div>
  );
}
