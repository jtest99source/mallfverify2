import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mallorca Verified";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          position: "relative",
        }}
      >
        {/* top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "5px", background: "#00C37A", display: "flex" }} />

        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "112px",
              fontWeight: "500",
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            Mallorca
          </span>
          <span
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "46px",
              fontWeight: "700",
              color: "#00C37A",
              letterSpacing: "14px",
              lineHeight: 1,
            }}
          >
            VERIFIED
          </span>
        </div>

        {/* tagline */}
        <div
          style={{
            marginTop: "32px",
            fontFamily: "Arial, sans-serif",
            fontSize: "24px",
            color: "#888888",
            letterSpacing: "1px",
            textAlign: "center",
          }}
        >
          The directory where no one buys their ranking
        </div>

        {/* bottom accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "5px", background: "#00C37A", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
