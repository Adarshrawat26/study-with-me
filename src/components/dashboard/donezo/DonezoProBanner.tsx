interface DonezoProBannerProps {
  weekTotalHours: number;
  prevWeekTotalHours: number;
  weekChangePercent: number | null;
}

export function DonezoProBanner({
  weekTotalHours,
  prevWeekTotalHours,
  weekChangePercent,
}: DonezoProBannerProps) {
  const changeLabel =
    weekChangePercent == null
      ? "No study time last week yet"
      : weekChangePercent > 0
        ? `+${weekChangePercent}% vs last week`
        : weekChangePercent < 0
          ? `${weekChangePercent}% vs last week`
          : "Same as last week";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-pink-50 px-4 py-3 shadow-sm ring-1 ring-amber-100/60">
      <div className="flex items-center gap-2">
        <span className="badge-pro">Pro</span>
        <p className="text-sm font-semibold text-[#831843]">Premium insights unlocked</p>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-pink-600">
        <span>
          This week: <strong className="text-[#831843]">{weekTotalHours}h</strong>
        </span>
        <span className="text-pink-300">·</span>
        <span>
          Last week: <strong className="text-[#831843]">{prevWeekTotalHours}h</strong>
        </span>
        <span className="text-pink-300">·</span>
        <span
          className={
            weekChangePercent != null && weekChangePercent > 0
              ? "font-semibold text-emerald-600"
              : weekChangePercent != null && weekChangePercent < 0
                ? "font-semibold text-rose-600"
                : "font-medium text-pink-500"
          }
        >
          {changeLabel}
        </span>
      </div>
    </div>
  );
}
