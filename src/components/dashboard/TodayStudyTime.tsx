"use client";

import { useEffect, useState } from "react";
import { useSpring, useTransform } from "framer-motion";
import {
  DashboardCard,
  DashboardLabel,
  DashboardStatValue,
} from "./DashboardCard";
import { AnimatedWidthBar } from "./animations";

interface TodayStudyTimeProps {
  todayMinutes: number;
  dailyAvgMinutes: number;
  dailyGoalMinutes: number | null;
}

function AnimatedTimeDisplay({ minutes }: { minutes: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 18 });
  const hDisplay = useTransform(spring, (v) => Math.floor(v / 60));
  const mDisplay = useTransform(spring, (v) => Math.floor(v % 60));
  const [h, setH] = useState(0);
  const [m, setM] = useState(0);

  useEffect(() => {
    spring.set(minutes);
  }, [spring, minutes]);

  useEffect(() => {
    const u1 = hDisplay.on("change", (v) => setH(Math.round(v)));
    const u2 = mDisplay.on("change", (v) => setM(Math.round(v)));
    return () => {
      u1();
      u2();
    };
  }, [hDisplay, mDisplay]);

  return (
    <span className={minutes > 0 ? "gradient-text" : undefined}>
      {h}h {String(m).padStart(2, "0")}m
    </span>
  );
}

function formatMinutesHmStatic(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function TodayStudyTime({
  todayMinutes,
  dailyAvgMinutes,
  dailyGoalMinutes,
}: TodayStudyTimeProps) {
  const progressPercent =
    dailyAvgMinutes > 0 ? (todayMinutes / dailyAvgMinutes) * 100 : todayMinutes > 0 ? 100 : 0;

  return (
    <DashboardCard variant="hero" className="flex h-full flex-col justify-between">
      <div>
        <DashboardLabel>Today</DashboardLabel>
        <DashboardStatValue muted={todayMinutes === 0} className="mt-3 sm:text-5xl">
          <AnimatedTimeDisplay minutes={todayMinutes} />
        </DashboardStatValue>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {dailyGoalMinutes
            ? `of your daily goal (${formatMinutesHmStatic(dailyGoalMinutes)})`
            : "Keep it up — you're building momentum"}
        </p>
        {todayMinutes === 0 && (
          <p className="mt-2 inline-flex rounded-full bg-pink-50 px-2.5 py-1 text-xs text-[var(--text-muted)]">
            Start your first session today
          </p>
        )}
      </div>
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-xs text-[var(--text-muted)]">
          <span>vs 7-day average</span>
          <span className="font-medium text-[var(--text)]">
            {formatMinutesHmStatic(dailyAvgMinutes)}/day
          </span>
        </div>
        <AnimatedWidthBar percent={progressPercent} />
      </div>
    </DashboardCard>
  );
}
