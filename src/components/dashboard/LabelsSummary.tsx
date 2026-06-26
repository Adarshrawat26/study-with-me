"use client";

import Link from "next/link";
import { DashboardCard, DashboardSectionHeader } from "./DashboardCard";
import { AnimatedWidthBar } from "./animations";
import { FREE_LIMITS } from "@/lib/utils";
import type { LabelSummaryItem } from "@/types/dashboard";

function formatHours(minutes: number) {
  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

export function LabelsSummary({
  labels,
  isPremium,
}: {
  labels: LabelSummaryItem[];
  isPremium: boolean;
}) {
  const atLimit = !isPremium && labels.length >= FREE_LIMITS.labels;

  return (
    <DashboardCard accent="rose">
      <DashboardSectionHeader title="Labels" action="+ Add" actionHref="/labels" />

        {labels.length === 0 ? (
          <div className="py-6 text-center">
            <span className="text-3xl">🏷️</span>
            <p className="mt-2 text-sm text-zinc-500">No labels yet — add your first subject</p>
            <Link href="/labels" className="mt-3 inline-block text-sm text-violet-400 hover:text-violet-300">
              Add label →
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {labels.slice(0, isPremium ? 50 : FREE_LIMITS.labels).map((label) => (
              <li key={label.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-200">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                  </span>
                  <span className="text-zinc-500">{formatHours(label.totalMinutes)}</span>
                </div>
                <div className="mt-1.5">
                  <AnimatedWidthBar
                    percent={label.proportion * 100}
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                  />
                </div>
              </li>
            ))}
            {atLimit && (
              <li className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-zinc-500">
                Upgrade for more labels →{" "}
                <Link href="/pricing" className="text-violet-400">
                  Premium
                </Link>
              </li>
            )}
          </ul>
        )}
      </DashboardCard>
  );
}
