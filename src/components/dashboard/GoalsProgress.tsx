"use client";

import Link from "next/link";
import { format } from "date-fns";
import { DashboardCard, DashboardSectionHeader } from "./DashboardCard";
import { AnimatedWidthBar } from "./animations";
import { FREE_LIMITS } from "@/lib/utils";
import type { GoalItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

function goalBarColor(goal: GoalItem) {
  if (goal.isCompleted) return "from-emerald-500 to-emerald-400";
  if (goal.isOverdue) return "from-red-500 to-red-400";
  const pct = goal.targetHrs > 0 ? goal.progress / goal.targetHrs : 0;
  if (pct >= 0.7) return "from-emerald-500 to-lime-400";
  return "from-amber-500 to-amber-400";
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
    <DashboardCard accent="emerald">
      <DashboardSectionHeader title="Goals" action="+ Add goal" actionHref="/goals" />

        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-8 text-center">
            <span className="text-3xl">🎯</span>
            <p className="mt-2 text-sm text-zinc-500">Set a weekly goal to stay on track</p>
            <Link href="/goals" className="mt-3 inline-block text-sm text-violet-400 hover:text-violet-300">
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
                    "rounded-xl border border-white/5 bg-white/[0.02] p-4",
                    goal.isOverdue && "border-red-500/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white">{goal.title}</p>
                    {goal.isCompleted && (
                      <span className="shrink-0 text-xs text-emerald-400">Completed</span>
                    )}
                    {goal.isOverdue && !goal.isCompleted && (
                      <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
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
                  <p className="mt-2 text-xs text-zinc-500">
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
          <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-zinc-500">
            Upgrade for 50 goals →{" "}
            <Link href="/pricing" className="text-violet-400">
              Premium
            </Link>
          </div>
        )}
      </DashboardCard>
  );
}
