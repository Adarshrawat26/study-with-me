function formatHm(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

interface DonezoInsightsProps {
  weekTotalHours: number;
  dailyAvgMinutes: number;
  todayMinutes: number;
  avgSessionMinutes: number;
  totalPomodoros: number;
  activeDaysThisYear: number;
  totalHours: number;
}

const INSIGHTS = [
  { key: "week", icon: "📅", label: "This week" },
  { key: "avg", icon: "📊", label: "Daily avg (7d)" },
  { key: "session", icon: "⏱️", label: "Avg session" },
  { key: "pomo", icon: "🍅", label: "Pomodoros" },
  { key: "days", icon: "✨", label: "Active days" },
  { key: "total", icon: "💫", label: "All-time hours" },
] as const;

export function DonezoInsights({
  weekTotalHours,
  dailyAvgMinutes,
  todayMinutes,
  avgSessionMinutes,
  totalPomodoros,
  activeDaysThisYear,
  totalHours,
}: DonezoInsightsProps) {
  const values: Record<(typeof INSIGHTS)[number]["key"], string> = {
    week: `${weekTotalHours}h`,
    avg: formatHm(dailyAvgMinutes),
    session: avgSessionMinutes > 0 ? formatHm(avgSessionMinutes) : "—",
    pomo: String(totalPomodoros),
    days: String(activeDaysThisYear),
    total: `${totalHours}h`,
  };

  const hints: Record<(typeof INSIGHTS)[number]["key"], string> = {
    week: todayMinutes > 0 ? "Including today" : "Start a session",
    avg: dailyAvgMinutes > 0 ? "Last 7 days" : "No data yet",
    session: "Last 30 days",
    pomo: "Completed cycles",
    days: `${new Date().getFullYear()} so far`,
    total: "Lifetime study",
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {INSIGHTS.map((item) => (
        <div
          key={item.key}
          className="donezo-insight flex items-center gap-3 rounded-2xl border border-pink-100/60 bg-white p-3 shadow-sm sm:p-4"
        >
          <span className="text-2xl">{item.icon}</span>
          <div className="min-w-0">
            <p className="text-2xl font-bold tabular-nums leading-none text-[#831843] sm:text-3xl">
              {values[item.key]}
            </p>
            <p className="mt-1 text-sm font-semibold text-pink-700">{item.label}</p>
            <p className="mt-0.5 text-xs text-pink-400">{hints[item.key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
