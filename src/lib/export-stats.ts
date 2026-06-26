interface ExportStats {
  todayHours: number;
  currentStreak: number;
  longestStreak: number;
  totalHours: number;
  userName?: string;
}

export function exportStatsImage(data: ExportStats) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 720, 480);
  gradient.addColorStop(0, "#1a1030");
  gradient.addColorStop(1, "#0a0814");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 720, 480);

  ctx.fillStyle = "#fafafa";
  ctx.font = "bold 36px system-ui, sans-serif";
  ctx.fillText("Study with me", 48, 64);

  ctx.fillStyle = "#9494a8";
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
    ctx.fillStyle = "#9494a8";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(stat.label.toUpperCase(), x, y);
    ctx.fillStyle = "#fafafa";
    ctx.font = "bold 40px system-ui, sans-serif";
    ctx.fillText(stat.value, x, y + 44);
  });

  ctx.fillStyle = "#8b5cf6";
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
