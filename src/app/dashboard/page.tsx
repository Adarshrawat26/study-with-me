import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import {
  getDashboardData,
  getDemoDashboardData,
  getGreeting,
} from "@/lib/dashboard-data";
import { TodayStudyTime } from "@/components/dashboard/TodayStudyTime";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { LongestStreakCard } from "@/components/dashboard/LongestStreakCard";
import { RankCard } from "@/components/dashboard/RankCard";
import { PlantMiniWidget } from "@/components/dashboard/PlantMiniWidget";
import { LabelsSummary } from "@/components/dashboard/LabelsSummary";
import { RecentSessionsList } from "@/components/dashboard/RecentSessionsList";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AllTimeStats } from "@/components/dashboard/AllTimeStats";
import {
  DashboardSubjectDonutChart,
  DashboardWeeklyBarChart,
} from "@/components/dashboard/DashboardCharts";
import type { DashboardData } from "@/types/dashboard";

export const dynamic = "force-dynamic";

function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
      <div className="h-full sm:col-span-1 lg:col-span-2">
        <TodayStudyTime
          todayMinutes={data.todayMinutes}
          dailyAvgMinutes={data.dailyAvgMinutes}
          dailyGoalMinutes={data.dailyGoalMinutes}
        />
      </div>

      <div className="h-full sm:col-span-1 lg:col-span-2">
        <StreakCard currentStreak={data.currentStreak} />
      </div>

      <div className="h-full sm:col-span-1 lg:col-span-2">
        <LongestStreakCard
          longestStreak={data.longestStreak}
          currentStreak={data.currentStreak}
          isNewRecord={data.isNewRecord}
        />
      </div>

      <div className="h-full sm:col-span-1 lg:col-span-3">
        <RankCard rank={data.rank} />
      </div>

      <div className="h-full sm:col-span-1 lg:col-span-3">
        <PlantMiniWidget
          plantStage={data.plantStage}
          plantXP={data.plantXP}
          plantStageName={data.plantStageName}
          nextStageXP={data.nextStageXP}
          isWilting={data.isWilting}
        />
      </div>

      <div className="col-span-full lg:col-span-6">
        <DashboardWeeklyBarChart data={data.weeklyData} weekTotalHours={data.weekTotalHours} />
      </div>

      <div className="sm:col-span-1 lg:col-span-3">
        <DashboardSubjectDonutChart
          data={data.labelBreakdown}
          weekTotalHours={data.weekTotalHours}
        />
      </div>

      <div className="sm:col-span-1 lg:col-span-3">
        <LabelsSummary labels={data.labels} isPremium={data.isPremium} />
      </div>

      <div className="col-span-full lg:col-span-7">
        <RecentSessionsList
          sessions={data.recentSessions}
          hasOlderSessions={data.hasOlderSessions}
        />
      </div>

      <div className="col-span-full lg:col-span-5">
        <GoalsProgress goals={data.goals} isPremium={data.isPremium} />
      </div>

      <div className="col-span-full">
        <ActivityHeatmap
          data={data.heatmapData}
          year={data.heatmapYear}
          totalHours={data.heatmapTotalHours}
          activeDays={data.heatmapActiveDays}
          isPremium={data.isPremium}
        />
      </div>

      <div className="col-span-full">
        <QuickActions isPremium={data.isPremium} />
      </div>

      <div className="col-span-full">
        <AllTimeStats stats={data.allTime} />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const isDemo = !session?.user?.id;

  let data: DashboardData;
  if (isDemo) {
    data = getDemoDashboardData();
  } else {
    try {
      data = await getDashboardData(session.user!.id!, session.user!.name);
    } catch {
      data = getDemoDashboardData();
    }
  }

  const greeting = getGreeting(data.userName);
  const firstName = data.userName.split(" ")[0];
  const timeGreeting = greeting.split(",")[0];
  const dateLabel = format(new Date(), "EEEE, d MMMM yyyy");

  return (
    <div className="dashboard-page min-h-screen px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="relative mx-auto w-full max-w-[1400px]">
        {isDemo && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
            <p className="text-sm text-violet-200">
              Preview mode — sample data shown. Sign in to track your real stats.
            </p>
            <Link
              href="/auth/signin?callbackUrl=/dashboard"
              className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-500"
            >
              Sign in
            </Link>
          </div>
        )}

        <header className="mb-8 border-b border-white/[0.06] pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400/90">
            Your study overview
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {timeGreeting},{" "}
            <span className="gradient-text">{firstName}</span>{" "}
            <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{dateLabel}</p>
        </header>

        <DashboardContent data={data} />
      </div>
    </div>
  );
}
