"use client";

import { useState } from "react";

export function EmbedInstructions({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

  const iframeCode = `<iframe src="${origin}/embed" width="320" height="140" style="border:none;border-radius:16px;overflow:hidden" allow="clipboard-write" title="Study with me timer"></iframe>`;

  const scriptCode = `<script src="${origin}/embed.js" defer></script>`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const openPopup = () => {
    window.open(
      `${origin}/embed`,
      "StudyWithMeTimer",
      "width=340,height=180,menubar=no,toolbar=no,location=no,status=no"
    );
  };

  return (
    <div
      className={
        compact
          ? "w-full max-w-md text-center"
          : "mx-auto w-full max-w-lg rounded-2xl border border-pink-100 bg-white p-6 shadow-sm"
      }
    >
      {!compact && (
        <>
          <h2 className="font-heading text-lg font-semibold text-[var(--text)]">
            Put timer on any webpage
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Float the timer while you study on other sites, or embed it with an iframe / script.
          </p>
        </>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={openPopup} className="btn-primary text-xs">
          Open floating window
        </button>
      </div>

      <div className="mt-4 space-y-3 text-left">
        <div>
          <p className="mb-1 text-xs font-medium text-[var(--text-muted)]">Iframe embed</p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-xl bg-pink-50/80 p-3 text-[10px] leading-relaxed text-pink-900">
              {iframeCode}
            </pre>
            <button
              type="button"
              onClick={() => copy(iframeCode, "iframe")}
              className="absolute right-2 top-2 rounded-lg bg-white px-2 py-1 text-[10px] text-pink-600 shadow-sm"
            >
              {copied === "iframe" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-[var(--text-muted)]">
            Script tag (auto-injects widget)
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-xl bg-pink-50/80 p-3 text-[10px] text-pink-900">
              {scriptCode}
            </pre>
            <button
              type="button"
              onClick={() => copy(scriptCode, "script")}
              className="absolute right-2 top-2 rounded-lg bg-white px-2 py-1 text-[10px] text-pink-600 shadow-sm"
            >
              {copied === "script" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
