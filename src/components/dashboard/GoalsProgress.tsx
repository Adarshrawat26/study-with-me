"use client";

import Link from "next/link";
import { format } from "date-fns";
import { DashboardCard, DashboardSectionHeader } from "./DashboardCard";
import { AnimatedWidthBar } from "./animations";
import { FREE_LIMITS } from "@/lib/utils";
import type { GoalItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

function goalBarColor(goal: GoalItem) {
  if (goal.isCompleted) return "from-pink-500 to-pink-400";
  if (goal.isOverdue) return "from-pink-700 to-pink-600";
  const pct = goal.targetHrs > 0 ? goal.progress / goal.targetHrs : 0;
  if (pct >= 0.7) return "from-pink-400 to-pink-300";
  return "from-pink-300 to-pink-200";
}

export function GoalsProgress({
  goals,
  isPremium,
}: {
  goals: GoalItem[];
  isPremium: boolean;
}) {
  const visible = goals.slice(0, isPremium ? 50 : FREE_LIMITS.goals);

  return (
    <DashboardCard>
      <DashboardSectionHeader title="Goals" action="+ Add goal" actionHref="/goals" />

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-pink-200 bg-pink-50/50 py-8 text-center">
          <span className="text-3xl">🎯</span>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Set a weekly goal to stay on track</p>
          <Link href="/goals" className="mt-3 inline-block text-sm text-[var(--primary)] hover:text-[var(--secondary)]">
            Create a goal →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((goal) => {
            const pct =
              goal.targetHrs > 0
                ? Math.min(100, (goal.progress / goal.targetHrs) * 100)
                : 0;
            return (
              <div
                key={goal.id}
                className={cn(
                  "rounded-xl border border-pink-100 bg-pink-50/40 p-4",
                  goal.isOverdue && "border-pink-400"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--text)]">{goal.title}</p>
                  {goal.isCompleted && (
                    <span className="shrink-0 text-xs text-pink-600">Completed</span>
                  )}
                  {goal.isOverdue && !goal.isCompleted && (
                    <span className="shrink-0 rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700">
                      Overdue
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <AnimatedWidthBar
                    percent={pct}
                    className={cn("h-full rounded-full bg-gradient-to-r", goalBarColor(goal))}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {goal.progress} / {goal.targetHrs} hrs
                  {goal.deadline && (
                    <> · due {format(new Date(goal.deadline), "MMM d")}</>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!isPremium && (
        <div className="mt-4 rounded-lg border border-pink-100 bg-pink-50 px-3 py-2 text-xs text-[var(--text-muted)]">
          Upgrade for 50 goals →{" "}
          <Link href="/pricing" className="text-[var(--primary)]">
            Premium
          </Link>
        </div>
      )}
    </DashboardCard>
  );
}
