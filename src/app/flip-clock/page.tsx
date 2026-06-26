import { Suspense } from "react";
import { FlipClockPage } from "@/components/timer/FlipClockPage";

export default function FlipClockRoute() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <FlipClockPage />
    </Suspense>
  );
}
