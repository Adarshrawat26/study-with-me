"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsBar, WeeklyDayData } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Period = "daily" | "weekly" | "monthly";

const PERIODS: { id: Period; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

function formatTotal(minutes: number) {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function barFill(entry: AnalyticsBar, maxMinutes: number): string {
  if (entry.isFuture) return "url(#emptyBar)";
  if (entry.minutes === 0) return "url(#emptyBar)";
  if (entry.isToday || entry.isCurrent) return "url(#todayBar)";
  const ratio = maxMinutes > 0 ? entry.minutes / maxMinutes : 0;
  if (ratio >= 0.65) return "url(#strongBar)";
  return "url(#softBar)";
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: AnalyticsBar }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-pink-100 bg-white px-3 py-2 shadow-lg shadow-pink-100/80">
      <p className="text-sm font-bold text-[#831843]">{formatTotal(item.minutes)}</p>
      <p className="text-xs text-pink-400">{item.label}</p>
    </div>
  );
}

interface DonezoAnalyticsChartProps {
  daily: AnalyticsBar[];
  weekly: WeeklyDayData[];
  monthly: AnalyticsBar[];
  isPremium: boolean;
}

export function DonezoAnalyticsChart({ daily, weekly, monthly, isPremium }: DonezoAnalyticsChartProps) {
  const [period, setPeriod] = useState<Period>("weekly");

  const chartData = useMemo((): AnalyticsBar[] => {
    if (period === "daily") return daily;
    if (period === "monthly") return isPremium ? monthly : [];
    return weekly.map((d) => ({
      label: d.day.charAt(0),
      minutes: d.minutes,
      isToday: d.isToday,
      isFuture: d.isFuture,
    }));
  }, [period, daily, weekly, monthly, isPremium]);

  const totalMinutes = chartData.reduce((s, d) => s + d.minutes, 0);
  const maxMinutes = Math.max(...chartData.map((d) => d.minutes), 1);
  const activeDays = chartData.filter((d) => d.minutes > 0 && !d.isFuture).length;

  const subtitle =
    period === "daily"
      ? totalMinutes > 0
        ? `${formatTotal(totalMinutes)} studied today · by hour`
        : "No study time logged today yet"
      : period === "weekly"
        ? totalMinutes > 0
          ? `${formatTotal(totalMinutes)} this week · ${activeDays} active days`
          : "No study time logged yet this week"
        : totalMinutes > 0
          ? `${formatTotal(totalMinutes)} this month · ${activeDays} active days`
          : "No study time logged this month yet";

  return (
    <div className="donezo-panel overflow-hidden rounded-2xl border border-pink-100/80 bg-white shadow-sm">
      <div className="border-b border-pink-50 bg-gradient-to-r from-pink-50/50 to-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#831843]">Study analytics</h2>
            <p className="mt-0.5 text-sm text-pink-500">{subtitle}</p>
          </div>
          <div className="flex rounded-xl bg-pink-50/80 p-1 ring-1 ring-pink-100">
            {PERIODS.map((p) => {
              const locked = p.id === "monthly" && !isPremium;
              return (
              <button
                key={p.id}
                type="button"
                onClick={() => !locked && setPeriod(p.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm",
                  period === p.id
                    ? "bg-white text-[#831843] shadow-sm shadow-pink-100"
                    : "text-pink-400 hover:text-pink-600",
                  locked && "cursor-not-allowed opacity-60"
                )}
              >
                {p.label}{locked ? " 🔒" : ""}
              </button>
            );
            })}
          </div>
        </div>
      </div>

      <div className="px-2 pb-4 pt-2 sm:px-4 sm:pb-6">
        <div className="h-[220px] w-full sm:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="todayBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DB2777" />
                  <stop offset="100%" stopColor="#831843" />
                </linearGradient>
                <linearGradient id="strongBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F472B6" />
                  <stop offset="100%" stopColor="#DB2777" />
                </linearGradient>
                <linearGradient id="softBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBCFE8" />
                  <stop offset="100%" stopColor="#F472B6" />
                </linearGradient>
                <pattern id="emptyBar" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                  <rect width="6" height="6" fill="#FDF2F8" />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#FBCFE8" strokeWidth="2" />
                </pattern>
              </defs>
              <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#FCE7F3" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#F472B6", fontSize: 11, fontWeight: 600 }}
                interval={period === "monthly" ? 4 : period === "daily" ? 2 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#F9A8D4", fontSize: 10 }}
                tickFormatter={(v) => (v >= 60 ? `${Math.round(v / 60)}h` : `${v}m`)}
                width={36}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(252, 231, 243, 0.35)" }} />
              <Bar dataKey="minutes" radius={[8, 8, 4, 4]} maxBarSize={period === "monthly" ? 14 : 36}>
                {chartData.map((entry, i) => (
                  <Cell key={`${entry.label}-${i}`} fill={barFill(entry, maxMinutes)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-pink-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-pink-400 to-pink-600" />
            Study time
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#831843]" />
            Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-pink-200 bg-pink-50" />
            No data
          </span>
        </div>

        {!isPremium && (
          <p className="mt-3 text-center text-xs text-pink-500">
            Monthly view & full-year history are Premium —{" "}
            <Link href="/pricing" className="font-semibold text-pink-600 hover:text-pink-800">
              Upgrade
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
