import type { DashboardData } from "@/types/dashboard";
import { partitionGoals } from "@/lib/dashboard-algorithms";
import { DonezoHeroHeader } from "./DonezoHeroHeader";
import { DonezoStatCards } from "./DonezoStatCards";
import { DonezoInsights } from "./DonezoInsights";
import { DonezoAnalyticsChart } from "./DonezoAnalyticsChart";
import { DonezoReminders } from "./DonezoReminders";
import { DonezoGoalsList } from "./DonezoGoalsList";
import { DonezoActivityFeed } from "./DonezoActivityFeed";
import { DonezoProgressGauge } from "./DonezoProgressGauge";
import { DonezoTimeTrackerCard } from "./DonezoTimeTrackerCard";
import { DonezoSubjectChart } from "./DonezoSubjectChart";
import { DonezoMiniHeatmap } from "./DonezoMiniHeatmap";
import { DonezoPlantCard } from "./DonezoPlantCard";
import { DonezoProBanner } from "./DonezoProBanner";
import { DonezoQuickActions } from "./DonezoQuickActions";

interface DonezoDashboardProps {
  data: DashboardData;
}

export function DonezoDashboard({ data }: DonezoDashboardProps) {
  const { completed: completedGoals, active: activeGoals, pending: pendingGoals } =
    partitionGoals(data.goals);

  return (
    <div className="mx-auto max-w-[1280px] space-y-5 sm:space-y-6">
      <DonezoHeroHeader
        userName={data.userName}
        currentStreak={data.currentStreak}
        longestStreak={data.longestStreak}
        isNewRecord={data.isNewRecord}
        todayMinutes={data.todayMinutes}
        weekTotalHours={data.weekTotalHours}
        isPremium={data.isPremium}
        totalHours={data.allTime.totalHours}
      />

      {data.isPremium && (
        <DonezoProBanner
          weekTotalHours={data.weekTotalHours}
          prevWeekTotalHours={data.prevWeekTotalHours}
          weekChangePercent={data.weekChangePercent}
        />
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <DonezoProgressGauge goals={data.goals} weekTotalHours={data.weekTotalHours} />
        <DonezoTimeTrackerCard todayMinutes={data.todayMinutes} />
      </div>

      <DonezoStatCards
        totalSessions={data.allTime.totalSessions}
        totalHours={data.allTime.totalHours}
        todayMinutes={data.todayMinutes}
        dailyAvgMinutes={data.dailyAvgMinutes}
        completedGoals={completedGoals}
        activeGoals={activeGoals}
        pendingGoals={pendingGoals}
        currentStreak={data.currentStreak}
      />

      <DonezoInsights
        weekTotalHours={data.weekTotalHours}
        dailyAvgMinutes={data.dailyAvgMinutes}
        todayMinutes={data.todayMinutes}
        avgSessionMinutes={data.avgSessionMinutes}
        totalPomodoros={data.allTime.totalPomodoros}
        activeDaysThisYear={data.heatmapActiveDays}
        totalHours={data.allTime.totalHours}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <DonezoAnalyticsChart
            daily={data.dailyChartData}
            weekly={data.weeklyData}
            monthly={data.monthlyChartData}
            isPremium={data.isPremium}
          />
        </div>
        <div className="flex flex-col gap-5 lg:col-span-4">
          <DonezoPlantCard
            plantStage={data.plantStage}
            plantXP={data.plantXP}
            plantStageName={data.plantStageName}
            nextStageXP={data.nextStageXP}
            isWilting={data.isWilting}
            isPremium={data.isPremium}
          />
          <DonezoReminders goals={data.goals} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <DonezoSubjectChart
            weekData={data.labelBreakdown}
            allTimeData={data.allTimeLabelBreakdown}
            weekTotalHours={data.weekTotalHours}
            allTimeTotalHours={data.allTime.totalHours}
            isPremium={data.isPremium}
          />
        </div>
        <div className="lg:col-span-8">
          <DonezoMiniHeatmap
            data={data.heatmapData}
            yearTotalHours={data.heatmapTotalHours}
            yearActiveDays={data.heatmapActiveDays}
            currentStreak={data.currentStreak}
            longestStreak={data.longestStreak}
            totalSessions={data.allTime.totalSessions}
            avgSessionMinutes={data.avgSessionMinutes}
            year={data.heatmapYear}
            isPremium={data.isPremium}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <DonezoActivityFeed sessions={data.recentSessions} hasOlderSessions={data.hasOlderSessions} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DonezoGoalsList goals={data.goals.slice(0, 5)} />
        <DonezoQuickActions isPremium={data.isPremium} />
      </div>
    </div>
  );
}
