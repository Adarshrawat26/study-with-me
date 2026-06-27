"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#FFFBFC", color: "#831843", fontFamily: "system-ui" }}>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Something went wrong</h2>
            <p style={{ color: "#9D174D", marginTop: "0.5rem" }}>{error.message}</p>
            <button
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem 1.5rem",
                background: "#EC4899",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                cursor: "pointer",
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
