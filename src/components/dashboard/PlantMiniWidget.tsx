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
    <DashboardCard variant="stat" accent="emerald" className="flex h-full flex-col items-center text-center">
      <DashboardLabel>Your plant</DashboardLabel>
      <div
        className={cn(
          "relative my-4 rounded-2xl bg-emerald-500/5 px-6 py-3",
          isWilting && "opacity-60 grayscale"
        )}
      >
        <PlantVisual stage={plantStage} wilting={isWilting} size="sm" />
      </div>
      <p className="font-heading text-sm font-semibold text-white">{plantStageName}</p>
      {nextStageXP ? (
        <>
          <p className="mt-1 text-xs text-zinc-500">
            {plantXP} / {nextStageXP} XP to next stage
          </p>
          <div className="mt-3 w-full">
            <AnimatedWidthBar
              percent={xpPercent}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
            />
          </div>
        </>
      ) : (
        <p className="mt-1 text-xs font-medium text-emerald-400">Max stage reached</p>
      )}
      {isWilting && (
        <p className="mt-2 text-xs text-amber-400">Wilting — study today to revive</p>
      )}
      <Link
        href="/study-plant"
        className="mt-4 text-sm font-medium text-violet-400 transition-colors hover:text-violet-300"
      >
        View plant →
      </Link>
    </DashboardCard>
  );
}
