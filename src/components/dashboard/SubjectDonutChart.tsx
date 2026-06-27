"use client";

import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DashboardCard, DashboardSectionHeader } from "./DashboardCard";
import { formatMinutesHm } from "@/lib/dashboard-data";
import type { LabelBreakdownItem } from "@/types/dashboard";

const PINK_CHART = ["#F9A8D4", "#F472B6", "#EC4899", "#DB2777", "#FBCFE8", "#BE185D"];

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: LabelBreakdownItem & { percent: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm shadow-lg shadow-pink-100">
      <p className="font-medium text-pink-900">{item.name}</p>
      <p className="text-pink-600">
        {formatMinutesHm(item.totalMinutes)} ({Math.round(item.percent * 100)}%)
      </p>
    </div>
  );
}

export function SubjectDonutChart({
  data,
  weekTotalHours,
}: {
  data: LabelBreakdownItem[];
  weekTotalHours: number;
}) {
  const totalMinutes = data.reduce((s, d) => s + d.totalMinutes, 0);
  const chartData = data.map((d, i) => ({
    ...d,
    percent: totalMinutes > 0 ? d.totalMinutes / totalMinutes : 0,
    chartColor: d.color?.startsWith("#") ? d.color : PINK_CHART[i % PINK_CHART.length],
  }));

  if (data.length === 0) {
    return (
      <DashboardCard className="flex flex-col items-center justify-center text-center">
        <DashboardSectionHeader title="By subject" />
        <span className="text-4xl">📊</span>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Add subjects to track where your time goes
        </p>
        <Link href="/labels" className="mt-4 text-sm text-[var(--primary)] hover:text-[var(--secondary)]">
          Add your first label →
        </Link>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="flex flex-col">
      <DashboardSectionHeader title="By subject" badge={`${weekTotalHours}h`} />
      <div className="relative mx-auto w-full max-w-[220px]">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="totalMinutes"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                animationBegin={300}
                animationDuration={800}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.labelId} fill={entry.chartColor} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-heading text-xl font-semibold text-[var(--text)]">
            {weekTotalHours}h
          </span>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {chartData.map((item) => (
          <li key={item.labelId} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-[var(--text)]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.chartColor }}
              />
              {item.name}
            </span>
            <span className="text-[var(--text-muted)]">{Math.round(item.percent * 100)}%</span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
