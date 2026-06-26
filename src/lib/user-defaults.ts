import { prisma } from "@/lib/prisma";

const DEFAULT_LABELS = [
  { name: "Math", color: "#7C3AED" },
  { name: "Physics", color: "#06B6D4" },
  { name: "Chemistry", color: "#F59E0B" },
];

export async function ensureUserDefaults(userId: string) {
  await prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const labelCount = await prisma.label.count({ where: { userId } });
  if (labelCount === 0) {
    await prisma.label.createMany({
      data: DEFAULT_LABELS.map((l) => ({ userId, ...l })),
    });
  }
}
