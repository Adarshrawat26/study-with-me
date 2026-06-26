"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <div className="glass-card max-w-md p-10">
        <h2 className="page-title">Something went wrong</h2>
        <p className="page-subtitle mt-3">
          {error.message || "An unexpected error occurred."}
        </p>
        <button onClick={reset} className="btn-primary mt-8">
          Try again
        </button>
      </div>
    </div>
  );
}
