import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureUserDefaults } from "@/lib/user-defaults";
import { syncAllGoalProgress } from "@/lib/goal-progress";

/** Backfill settings + default labels and refresh goal progress for the current user. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserDefaults(session.user.id);
  await syncAllGoalProgress(session.user.id);

  return NextResponse.json({ ok: true });
}
