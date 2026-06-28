export interface WeeklyDayData {
  day: string;
  minutes: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface AnalyticsBar {
  label: string;
  minutes: number;
  isToday?: boolean;
  isFuture?: boolean;
  isCurrent?: boolean;
}

export interface LabelBreakdownItem {
  labelId: string;
  name: string;
  color: string;
  totalMinutes: number;
}

export interface LabelSummaryItem {
  id: string;
  name: string;
  color: string;
  totalMinutes: number;
  proportion: number;
}

export interface RecentSessionItem {
  id: string;
  duration: number;
  mode: string;
  createdAt: string;
  label: { name: string; color: string } | null;
}

export interface GoalItem {
  id: string;
  title: string;
  targetHrs: number;
  progress: number;
  deadline: string | null;
  isCompleted: boolean;
  isOverdue: boolean;
}

export interface HeatmapCell {
  date: string;
  minutes: number;
}

export interface RankData {
  weeklyRank: number;
  totalUsers: number;
  topPercent: number;
  hoursToNextRank: number | null;
  weeklyHours: number;
}

export interface AllTimeStatsData {
  totalHours: number;
  totalSessions: number;
  totalPomodoros: number;
  dailyAvg30Days: number;
}

export interface DashboardData {
  userName: string;
  isPremium: boolean;
  todayMinutes: number;
  dailyAvgMinutes: number;
  dailyGoalMinutes: number | null;
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
  rank: RankData;
  plantStage: number;
  plantXP: number;
  plantStageName: string;
  nextStageXP: number | null;
  lastStudiedAt: string | null;
  isWilting: boolean;
  weeklyData: WeeklyDayData[];
  dailyChartData: AnalyticsBar[];
  monthlyChartData: AnalyticsBar[];
  weekTotalHours: number;
  labelBreakdown: LabelBreakdownItem[];
  allTimeLabelBreakdown: LabelBreakdownItem[];
  prevWeekTotalHours: number;
  weekChangePercent: number | null;
  labels: LabelSummaryItem[];
  recentSessions: RecentSessionItem[];
  hasOlderSessions: boolean;
  goals: GoalItem[];
  heatmapData: HeatmapCell[];
  heatmapYear: number;
  heatmapTotalHours: number;
  heatmapActiveDays: number;
  allTime: AllTimeStatsData;
  avgSessionMinutes: number;
}
