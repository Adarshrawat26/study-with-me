import Link from "next/link";
import { PlantVisual } from "@/components/plant/PlantVisual";
import { cn } from "@/lib/utils";

interface DonezoPlantCardProps {
  plantStage: number;
  plantXP: number;
  plantStageName: string;
  nextStageXP: number | null;
  isWilting: boolean;
  isPremium?: boolean;
}

export function DonezoPlantCard({
  plantStage,
  plantXP,
  plantStageName,
  nextStageXP,
  isWilting,
  isPremium = false,
}: DonezoPlantCardProps) {
  const xpPercent = nextStageXP ? Math.min(100, (plantXP / nextStageXP) * 100) : 100;

  return (
    <div className="donezo-panel relative overflow-hidden rounded-2xl border border-pink-100/80 bg-gradient-to-br from-white to-pink-50/50 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-bold text-[#831843]">Study plant</h2>
            {isPremium && <span className="badge-pro text-[9px]">Pro skin</span>}
          </div>
          <p className="text-xs text-pink-400">Grows as you focus</p>
        </div>
        {isWilting && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
            Needs water
          </span>
        )}
      </div>

      <div
        className={cn(
          "mx-auto my-4 flex w-fit items-center justify-center rounded-2xl bg-white/80 px-8 py-4 shadow-inner ring-1 ring-pink-100",
          isWilting && "opacity-70 grayscale"
        )}
      >
        <PlantVisual stage={plantStage} wilting={isWilting} size="sm" premium={isPremium} />
      </div>

      <p className="text-center text-sm font-semibold text-[#831843]">{plantStageName}</p>
      {nextStageXP ? (
        <>
          <p className="mt-1 text-center text-xs text-pink-400">
            {plantXP} / {nextStageXP} XP to next stage
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-pink-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </>
      ) : (
        <p className="mt-1 text-center text-xs font-medium text-pink-500">Fully grown!</p>
      )}

      <Link
        href="/study-plant"
        className="mt-4 block text-center text-xs font-semibold text-pink-600 hover:text-pink-800"
      >
        Visit your garden →
      </Link>
    </div>
  );
}
