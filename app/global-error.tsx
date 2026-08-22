"use client";

import { useEffect } from "react";

// Only renders when the root layout itself throws, so it must ship its own
// <html>/<body> and can't rely on the app's CSS. Kept deliberately minimal.
export default function GlobalError({
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
    <html lang="nl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: "#1c1a40",
          background: "#fbfbfd",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
          Er ging iets mis
        </h1>
        <p style={{ maxWidth: "28rem", color: "#4c4a66", margin: 0 }}>
          Er trad een onverwachte fout op. Probeer het opnieuw, of ga terug naar
          de homepage.
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#1257E0",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Opnieuw proberen
          </button>
          <a
            href="/"
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid #d7d5e6",
              color: "#1c1a40",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Naar de homepage
          </a>
        </div>
      </body>
    </html>
  );
}
