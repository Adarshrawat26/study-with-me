import { prisma } from "@/lib/prisma";

const DEFAULT_LABELS = [
  { name: "Math", color: "#F472B6" },
  { name: "Physics", color: "#EC4899" },
  { name: "Chemistry", color: "#F9A8D4" },
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
