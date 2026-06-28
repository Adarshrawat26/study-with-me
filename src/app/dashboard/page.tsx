import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardShell } from "@/components/dashboard/donezo/DashboardShell";
import { DonezoDashboard } from "@/components/dashboard/donezo/DonezoDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const data = await getDashboardData(session.user.id, session.user.name);

  return (
    <DashboardShell>
      <DonezoDashboard data={data} />
    </DashboardShell>
  );
}
