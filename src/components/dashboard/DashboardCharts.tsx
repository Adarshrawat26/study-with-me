"use client";

import dynamic from "next/dynamic";
import { StatCardSkeleton } from "./DashboardCard";
import type { LabelBreakdownItem, WeeklyDayData } from "@/types/dashboard";

const WeeklyBarChart = dynamic(
  () => import("./WeeklyBarChart").then((mod) => ({ default: mod.WeeklyBarChart })),
  { ssr: false, loading: () => <StatCardSkeleton /> }
);

const SubjectDonutChart = dynamic(
  () => import("./SubjectDonutChart").then((mod) => ({ default: mod.SubjectDonutChart })),
  { ssr: false, loading: () => <StatCardSkeleton /> }
);

export function DashboardWeeklyBarChart({
  data,
  weekTotalHours,
}: {
  data: WeeklyDayData[];
  weekTotalHours: number;
}) {
  return <WeeklyBarChart data={data} weekTotalHours={weekTotalHours} />;
}

export function DashboardSubjectDonutChart({
  data,
  weekTotalHours,
}: {
  data: LabelBreakdownItem[];
  weekTotalHours: number;
}) {
  return <SubjectDonutChart data={data} weekTotalHours={weekTotalHours} />;
}
