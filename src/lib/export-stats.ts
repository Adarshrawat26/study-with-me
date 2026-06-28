interface ExportStats {
  todayHours: number;
  currentStreak: number;
  longestStreak: number;
  totalHours: number;
  weekHours?: number;
  userName?: string;
}

export function exportStatsCsv(data: ExportStats) {
  const rows = [
    ["Metric", "Value"],
    ["Today (hours)", String(data.todayHours)],
    ["Current streak (days)", String(data.currentStreak)],
    ["Best streak (days)", String(data.longestStreak)],
    ["Total hours", String(data.totalHours)],
  ];
  if (data.weekHours != null) rows.push(["This week (hours)", String(data.weekHours)]);

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "study-with-me-stats.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function exportStatsImage(data: ExportStats) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 720, 480);
  gradient.addColorStop(0, "#FFF5F8");
  gradient.addColorStop(1, "#FCE7F3");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 720, 480);

  ctx.fillStyle = "#831843";
  ctx.font = "bold 36px system-ui, sans-serif";
  ctx.fillText("Study with me", 48, 64);

  ctx.fillStyle = "#9D174D";
  ctx.font = "16px system-ui, sans-serif";
  ctx.fillText(data.userName ? `${data.userName}'s study stats` : "My study stats", 48, 96);

  const stats = [
    { label: "Today", value: `${data.todayHours}h` },
    { label: "Streak", value: `${data.currentStreak} days` },
    { label: "Best streak", value: `${data.longestStreak} days` },
    { label: "Total", value: `${data.totalHours}h` },
  ];

  stats.forEach((stat, i) => {
    const x = 48 + (i % 2) * 320;
    const y = 160 + Math.floor(i / 2) * 120;
    ctx.fillStyle = "#9D174D";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(stat.label.toUpperCase(), x, y);
    ctx.fillStyle = "#831843";
    ctx.font = "bold 40px system-ui, sans-serif";
    ctx.fillText(stat.value, x, y + 44);
  });

  ctx.fillStyle = "#EC4899";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText("Study with me", 48, 440);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-with-me-stats.png";
    a.click();
    URL.revokeObjectURL(url);
  });
}
