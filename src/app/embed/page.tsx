import type { Metadata } from "next";
import { MiniTimerWidget } from "@/components/timer/MiniTimerWidget";

export const metadata: Metadata = {
  title: "Mini Timer — Study with me",
  description: "Floating study timer widget. Embed on any webpage.",
};

export default function EmbedPage() {
  return (
    <div className="flex min-h-[120px] items-center justify-center bg-white p-3">
      <MiniTimerWidget embed />
    </div>
  );
}
