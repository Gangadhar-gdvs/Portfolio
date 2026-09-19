import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The lens reticle from icon.svg, for iOS home screens. */
export default function AppleIcon() {
  const tick = { position: "absolute" as const, background: "#6fe6ff", borderRadius: 6 };
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05080d",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 999,
            border: "11px solid #6fe6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 26, height: 26, borderRadius: 999, background: "#d7e3ea" }} />
        </div>
        <div style={{ ...tick, left: 84, top: 14, width: 12, height: 26 }} />
        <div style={{ ...tick, left: 84, bottom: 14, width: 12, height: 26 }} />
        <div style={{ ...tick, top: 84, left: 14, width: 26, height: 12 }} />
        <div style={{ ...tick, top: 84, right: 14, width: 26, height: 12 }} />
      </div>
    ),
    { ...size },
  );
}
