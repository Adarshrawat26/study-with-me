"use client";

import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { LabelBreakdownItem } from "@/types/dashboard";
import { formatMinutesHm } from "@/lib/dashboard-data";

const FALLBACK = ["#F9A8D4", "#F472B6", "#EC4899", "#DB2777", "#FBCFE8", "#BE185D"];

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: LabelBreakdownItem & { percent: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-[#831843]">{item.name}</p>
      <p className="text-pink-500">
        {formatMinutesHm(item.totalMinutes)} ({Math.round(item.percent * 100)}%)
      </p>
    </div>
  );
}

export function DonezoSubjectChart({
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
    fill: d.color?.startsWith("#") ? d.color : FALLBACK[i % FALLBACK.length],
  }));

  return (
    <div className="donezo-panel flex h-full flex-col rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-[#831843]">Subject breakdown</h2>
          <p className="text-xs text-pink-400">Where your time went this week</p>
        </div>
        <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-600">
          {weekTotalHours}h
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <span className="text-4xl">🏷️</span>
          <p className="mt-3 text-sm text-pink-400">Add labels to see subject stats</p>
          <Link href="/labels" className="mt-3 text-xs font-semibold text-pink-600 hover:text-pink-800">
            Create labels →
          </Link>
        </div>
      ) : (
        <>
          <div className="relative mx-auto w-full max-w-[200px]">
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="totalMinutes"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    animationDuration={700}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.labelId} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-lg font-bold text-[#831843]">{weekTotalHours}h</span>
            </div>
          </div>
          <ul className="mt-2 space-y-2.5">
            {chartData.map((item) => (
              <li key={item.labelId} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#831843]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}
                </span>
                <span className="tabular-nums text-pink-400">
                  {formatMinutesHm(item.totalMinutes)} · {Math.round(item.percent * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
