import { StatCardSkeleton } from "@/components/dashboard/DashboardCard";

export default function DashboardLoading() {
  return (
    <div className="dashboard-page min-h-screen px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mb-6 animate-pulse sm:mb-8">
          <div className="h-8 w-64 rounded bg-white/10" />
          <div className="mt-2 h-4 w-40 rounded bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="sm:col-span-1 lg:col-span-2">
              <StatCardSkeleton />
            </div>
          ))}
          <div className="col-span-full lg:col-span-6">
            <StatCardSkeleton />
          </div>
          <div className="sm:col-span-1 lg:col-span-3">
            <StatCardSkeleton />
          </div>
          <div className="sm:col-span-1 lg:col-span-3">
            <StatCardSkeleton />
          </div>
          <div className="col-span-full lg:col-span-7">
            <StatCardSkeleton />
          </div>
          <div className="col-span-full lg:col-span-5">
            <StatCardSkeleton />
          </div>
          <div className="col-span-full">
            <StatCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
