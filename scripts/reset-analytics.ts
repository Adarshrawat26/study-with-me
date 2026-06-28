/**
 * Reset all study analytics for every user.
 * Usage: npx tsx scripts/reset-analytics.ts
 */
import "dotenv/config";
import { resetAllAnalytics } from "../src/lib/reset-analytics";
import { prisma } from "../src/lib/prisma";

async function main() {
  const before = await prisma.studySession.count();
  await resetAllAnalytics();
  console.log(`Reset complete. Removed ${before} study session(s). Analytics start from zero.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
