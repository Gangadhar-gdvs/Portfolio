import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The stack mark from icon.svg, for iOS home screens. */
export default function AppleIcon() {
  const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 11 54 22.5 32 34 10 22.5Z" fill="#eef2f7"/><path d="M10 31.5 32 43l22-11.5" fill="none" stroke="#7ce7ff" stroke-width="3.6" stroke-linejoin="round"/><path d="M10 40.5 32 52l22-11.5" fill="none" stroke="#7ce7ff" stroke-width="3.6" stroke-linejoin="round" opacity="0.55"/></svg>`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#030509" }}>
        { }
        <img src={`data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`} alt="" width={150} height={150} />
      </div>
    ),
    { ...size },
  );
}
