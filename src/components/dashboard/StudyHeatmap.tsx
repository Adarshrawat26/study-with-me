"use client";

interface StudyHeatmapProps {
  data: Record<string, number>;
}

function getIntensity(seconds: number): string {
  if (seconds === 0) return "bg-[var(--border)]";
  const hours = seconds / 3600;
  if (hours < 1) return "bg-[var(--primary)]/20";
  if (hours < 2) return "bg-[var(--primary)]/40";
  if (hours < 4) return "bg-[var(--primary)]/60";
  return "bg-[var(--primary)]";
}

export function StudyHeatmap({ data }: StudyHeatmapProps) {
  const weeks: { date: Date; seconds: number }[][] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay());

  const current = new Date(start);
  let week: { date: Date; seconds: number }[] = [];

  while (current <= today) {
    const key = current.toISOString().split("T")[0];
    week.push({ date: new Date(current), seconds: data[key] ?? 0 });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    current.setDate(current.getDate() + 1);
  }
  if (week.length > 0) weeks.push(week);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1">
        <div className="mb-2 flex justify-between text-xs text-[var(--text-muted)]">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 4].map((h) => (
              <div
                key={h}
                className={`h-3 w-3 rounded-sm ${getIntensity(h * 3600)}`}
                title={`${h}h+`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
        <div className="flex gap-1">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {w.map((cell, di) => (
                <div
                  key={di}
                  className={`h-3 w-3 rounded-sm ${getIntensity(cell.seconds)}`}
                  title={`${cell.date.toLocaleDateString()} — ${(cell.seconds / 3600).toFixed(1)}h`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-4 text-xs text-[var(--text-muted)]">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
