"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F5] px-6 text-center">
      <p className="text-4xl">📊</p>
      <h1 className="mt-4 font-heading text-xl font-bold text-[#831843]">
        Dashboard failed to load
      </h1>
      <p className="mt-2 max-w-md text-sm text-pink-500">
        {error.message || "Something went wrong while loading your stats."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
      >
        Try again
      </button>
    </div>
  );
}
