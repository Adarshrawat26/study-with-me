import type { GoalItem } from "@/types/dashboard";

export function DonezoProgressGauge({
  goals,
  weekTotalHours,
}: {
  goals: GoalItem[];
  weekTotalHours: number;
}) {
  const totalTarget = goals.reduce((s, g) => s + g.targetHrs, 0);
  const totalProgress = goals.reduce((s, g) => s + g.progress, 0);
  const completed = goals.filter((g) => g.isCompleted).length;
  const inProgress = goals.filter((g) => !g.isCompleted && !g.isOverdue).length;
  const pending = goals.filter((g) => g.isOverdue && !g.isCompleted).length;
  const total = goals.length || 1;

  const completedPct = (completed / total) * 100;
  const progressPct = (inProgress / total) * 100;
  const pendingPct = (pending / total) * 100;

  const overallPct =
    totalTarget > 0
      ? Math.min(100, Math.round((totalProgress / totalTarget) * 100))
      : Math.min(100, Math.round(weekTotalHours * 2.5));

  const r = 70;
  const cx = 100;
  const cy = 100;
  const startAngle = Math.PI;
  const endAngle = 0;

  function arcPath(fromPct: number, toPct: number) {
    const a1 = startAngle + (endAngle - startAngle) * (fromPct / 100);
    const a2 = startAngle + (endAngle - startAngle) * (toPct / 100);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const large = toPct - fromPct > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <div className="donezo-panel rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-heading text-base font-bold text-[#831843]">Study progress</h2>

      <div className="relative mx-auto mt-2 max-w-[220px]">
        <svg viewBox="0 0 200 120" className="w-full">
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#FCE7F3"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {completedPct > 0 && (
            <path
              d={arcPath(0, completedPct)}
              fill="none"
              stroke="#F472B6"
              strokeWidth="14"
              strokeLinecap="round"
            />
          )}
          {progressPct > 0 && (
            <path
              d={arcPath(completedPct, completedPct + progressPct)}
              fill="none"
              stroke="#DB2777"
              strokeWidth="14"
              strokeLinecap="round"
            />
          )}
          {pendingPct > 0 && (
            <path
              d={arcPath(completedPct + progressPct, 100)}
              fill="none"
              stroke="#FDA4AF"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="6 4"
            />
          )}
        </svg>
        <div className="absolute inset-x-0 bottom-2 text-center">
          <p className="text-3xl font-bold tabular-nums text-[#831843]">{overallPct}%</p>
          <p className="text-xs text-pink-400">Goals on track</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-medium">
        <span className="flex items-center gap-1.5 text-pink-600">
          <span className="h-2 w-2 rounded-full bg-pink-400" />
          Completed
        </span>
        <span className="flex items-center gap-1.5 text-pink-700">
          <span className="h-2 w-2 rounded-full bg-pink-600" />
          In progress
        </span>
        <span className="flex items-center gap-1.5 text-rose-400">
          <span className="h-2 w-2 rounded-full bg-rose-300" />
          Pending
        </span>
      </div>
    </div>
  );
}
