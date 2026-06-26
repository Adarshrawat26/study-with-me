"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DashboardCard, DashboardSectionHeader } from "./DashboardCard";
import { formatMinutesHm } from "@/lib/dashboard-data";
import type { WeeklyDayData } from "@/types/dashboard";

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const minutes = Math.round((payload[0].value ?? 0) * 60);
  return (
    <div className="rounded-xl border border-white/10 bg-[#12121a]/95 px-3 py-2 text-sm shadow-xl backdrop-blur-md">
      <span className="font-medium text-white">{formatMinutesHm(minutes)}</span>
    </div>
  );
}

export function WeeklyBarChart({
  data,
  weekTotalHours,
}: {
  data: WeeklyDayData[];
  weekTotalHours: number;
}) {
  const chartData = data.map((d) => ({
    ...d,
    hours: d.minutes / 60,
  }));
  const maxHours = Math.max(...chartData.map((d) => d.hours), 1);

  return (
    <DashboardCard accent="violet" className="flex flex-col">
      <DashboardSectionHeader
        title="This week"
        badge={`${weekTotalHours} hrs`}
      />
      <div className="h-[160px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />
            <YAxis
              domain={[0, maxHours + 1]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              className="max-sm:hidden"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
            <Bar
              dataKey="hours"
              radius={[6, 6, 0, 0]}
              animationBegin={200}
              animationDuration={800}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.isFuture
                      ? "#27272a"
                      : entry.isToday
                        ? "#22D3EE"
                        : "#8B5CF6"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
