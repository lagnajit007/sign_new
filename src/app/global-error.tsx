"use client";

/** Last-resort boundary for errors in the root layout itself. Must render <html>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>Sanjog hit an unexpected error</h1>
          <p style={{ color: "#52525b", margin: "0 0 16px" }}>Please try again. If it keeps happening, reload the page.</p>
          <button
            onClick={reset}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e4e4e7", background: "#6d4aff", color: "#fff", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
