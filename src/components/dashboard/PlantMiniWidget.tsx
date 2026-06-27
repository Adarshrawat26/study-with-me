"use client";

import Link from "next/link";
import { DashboardCard, DashboardLabel } from "./DashboardCard";
import { AnimatedWidthBar } from "./animations";
import { PlantVisual } from "@/components/plant/PlantVisual";
import { cn } from "@/lib/utils";

interface PlantMiniWidgetProps {
  plantStage: number;
  plantXP: number;
  plantStageName: string;
  nextStageXP: number | null;
  isWilting: boolean;
}

export function PlantMiniWidget({
  plantStage,
  plantXP,
  plantStageName,
  nextStageXP,
  isWilting,
}: PlantMiniWidgetProps) {
  const xpPercent = nextStageXP ? Math.min(100, (plantXP / nextStageXP) * 100) : 100;

  return (
    <DashboardCard variant="stat" className="flex h-full flex-col items-center text-center">
      <DashboardLabel>Your plant</DashboardLabel>
      <div
        className={cn(
          "relative my-4 rounded-2xl border border-pink-100/80 bg-gradient-to-b from-pink-50/80 to-white px-6 py-4 shadow-inner",
          isWilting && "opacity-60 grayscale"
        )}
      >
        <PlantVisual stage={plantStage} wilting={isWilting} size="sm" />
      </div>
      <p className="font-heading text-sm font-semibold text-[var(--text)]">{plantStageName}</p>
      {nextStageXP ? (
        <>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {plantXP} / {nextStageXP} XP to next stage
          </p>
          <div className="mt-3 w-full">
            <AnimatedWidthBar
              percent={xpPercent}
              className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600"
            />
          </div>
        </>
      ) : (
        <p className="mt-1 text-xs font-medium text-pink-500">Max stage reached</p>
      )}
      {isWilting && (
        <p className="mt-2 text-xs text-pink-600">Wilting — study today to revive</p>
      )}
      <Link
        href="/study-plant"
        className="mt-4 text-sm font-medium text-[var(--primary)] transition-colors hover:text-[var(--secondary)]"
      >
        View plant →
      </Link>
    </DashboardCard>
  );
}
