"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PLANT_STAGES } from "@/lib/utils";
import { PlantVisual, PlantStageIcon } from "@/components/plant/PlantVisual";
import { PageHeader } from "@/components/layout/PageHeader";

interface PlantData {
  plantStage: number;
  plantXP: number;
  totalHours: number;
  lastStudiedAt: string | null;
}

export default function StudyPlantPage() {
  const { data: session } = useSession();
  const isPremium = session?.user?.isPremium ?? false;
  const [data, setData] = useState<PlantData | null>(null);

  useEffect(() => {
    fetch("/api/plant")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const stage = data?.plantStage ?? 0;
  const stageInfo = PLANT_STAGES[stage] ?? PLANT_STAGES[0];
  const nextStage = PLANT_STAGES[stage + 1];
  const hours = data?.totalHours ?? 0;
  const xpProgress = nextStage
    ? ((hours - stageInfo.minHours) / (nextStage.minHours - stageInfo.minHours)) * 100
    : 100;

  const daysSinceStudy = data?.lastStudiedAt
    ? Math.floor((Date.now() - new Date(data.lastStudiedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isWilting = daysSinceStudy >= 2;

  return (
    <div className="page-shell-narrow text-center">
      <PageHeader
        title="Study plant"
        subtitle={
          isPremium
            ? "Pro garden skin — grow your plant by studying consistently"
            : "Grow your plant by studying consistently"
        }
      />

      {isPremium && (
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
          <span className="badge-pro">Pro</span>
          Golden plant skin active
        </p>
      )}

      <div className="my-8">
        <PlantVisual stage={stage} wilting={isWilting} size="lg" premium={isPremium} />
        {isWilting && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-warning"
          >
            Your plant is wilting — study today to revive it
          </motion.p>
        )}
      </div>

      <div className="glass-card p-6 text-left">
        <h2 className="font-heading text-xl font-bold text-center">{stageInfo.name}</h2>
        <p className="mt-1 text-center text-sm text-[var(--text-muted)]">{hours.toFixed(1)} total hours studied</p>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-[var(--text-muted)]">
            <span>{data?.plantXP ?? 0} XP</span>
            {nextStage && <span>Next: {nextStage.name} ({nextStage.minHours}h)</span>}
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--border)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, xpProgress)}%` }}
              className="h-full rounded-full bg-gradient-to-r from-success to-secondary"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-2">
          {PLANT_STAGES.map((s) => (
            <div
              key={s.stage}
              className={`rounded-lg p-1 text-xs ${s.stage <= stage ? "bg-success/20 text-success" : "bg-[var(--border)] text-[var(--text-muted)]"}`}
            >
              <PlantStageIcon stage={s.stage} active={s.stage <= stage} premium={isPremium} />
              <p className="mt-1 truncate">{s.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
