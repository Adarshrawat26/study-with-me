"use client";

import { MiniTimerWidget } from "@/components/timer/MiniTimerWidget";
import { EmbedInstructions } from "@/components/timer/EmbedInstructions";

/** Full-page mini timer + embed setup instructions */
export default function MiniSetupPage() {
  return (
    <div className="page-shell-narrow flex flex-col items-center gap-8 py-12">
      <div className="text-center">
        <h1 className="page-title">Mini timer</h1>
        <p className="page-subtitle mt-2">
          Float while you browse, or embed on any website.
        </p>
      </div>
      <MiniTimerWidget embed className="w-full max-w-sm" />
      <EmbedInstructions />
    </div>
  );
}
