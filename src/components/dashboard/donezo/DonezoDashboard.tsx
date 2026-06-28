import Link from "next/link";
import { format } from "date-fns";
import type { DashboardData } from "@/types/dashboard";
import { partitionGoals } from "@/lib/dashboard-algorithms";
import { DonezoStatCards } from "./DonezoStatCards";
import { DonezoWeeklyChart } from "./DonezoWeeklyChart";
import { DonezoReminders } from "./DonezoReminders";
import { DonezoGoalsList } from "./DonezoGoalsList";
import { DonezoActivityFeed } from "./DonezoActivityFeed";
import { DonezoProgressGauge } from "./DonezoProgressGauge";
import { DonezoTimeTrackerCard } from "./DonezoTimeTrackerCard";

interface DonezoDashboardProps {
  data: DashboardData;
}

export function DonezoDashboard({ data }: DonezoDashboardProps) {
  const { completed: completedGoals, active: activeGoals, pending: pendingGoals } =
    partitionGoals(data.goals);

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#831843] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-pink-400">
            Plan, prioritize, and track your study sessions with ease.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/labels"
            className="inline-flex items-center rounded-xl border-2 border-pink-500 bg-white px-4 py-2.5 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
          >
            Import labels
          </Link>
          <Link
            href="/goals"
            className="inline-flex items-center rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-pink-200 transition hover:bg-pink-700"
          >
            + Add goal
          </Link>
        </div>
      </div>

      <DonezoStatCards
        totalSessions={data.allTime.totalSessions}
        todayMinutes={data.todayMinutes}
        dailyAvgMinutes={data.dailyAvgMinutes}
        completedGoals={completedGoals}
        activeGoals={activeGoals}
        pendingGoals={pendingGoals}
        currentStreak={data.currentStreak}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <DonezoWeeklyChart data={data.weeklyData} />
        </div>
        <div className="flex flex-col gap-5 lg:col-span-5">
          <DonezoReminders goals={data.goals} />
          <DonezoGoalsList goals={data.goals.slice(0, 3)} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <DonezoActivityFeed sessions={data.recentSessions} />
        </div>
        <div className="flex flex-col gap-5 lg:col-span-5">
          <DonezoProgressGauge goals={data.goals} weekTotalHours={data.weekTotalHours} />
          <DonezoTimeTrackerCard todayMinutes={data.todayMinutes} />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-pink-300">
        {format(new Date(), "EEEE, d MMMM yyyy")} · {data.heatmapActiveDays} active days this year
      </p>
    </div>
  );
}
