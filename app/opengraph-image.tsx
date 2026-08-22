import { ImageResponse } from "next/og";

export const alt = "ComplAI — Word AI Act-compliant zonder advieskosten";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social-share card, generated at request time.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "linear-gradient(135deg, #1257E0 0%, #0B3FAE 50%, #00C4A7 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 48 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            {/* Checkmark drawn as SVG — Satori's default font has no ✓ glyph. */}
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <path
                d="M9 16.5l4.5 4.5L23 11"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1 }}>ComplAI</div>
        </div>
        <div style={{ display: "flex", fontSize: 66, fontWeight: 800, lineHeight: 1.1, maxWidth: 960 }}>
          Word AI Act-compliant zonder advieskosten
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 34, opacity: 0.92, maxWidth: 900 }}>
          Risicoscan · AI-register · documenten · e-learning · governance — op één plek.
        </div>
      </div>
    ),
    { ...size }
  );
}
