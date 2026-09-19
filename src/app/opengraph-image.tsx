import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { lensSpecks, loadOgFonts } from "@/lib/ogFonts";

export const alt = `${profile.name}, full-stack engineer for web, mobile, desktop and AI`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LENS = 128;

/** The share card is the hero in miniature: the surface, with a lens open on it. */
export default async function OpenGraphImage() {
  const fonts = await loadOgFonts();
  const specks = lensSpecks(70, LENS);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "#e6e9ec",
          color: "#0a0d12",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "JetBrains Mono", fontSize: 22 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#ff9e4a" }} />
          <span>{profile.availability}</span>
          <span style={{ color: "#545e69" }}>· {profile.locationShort}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Archivo", fontSize: 86, lineHeight: 0.9 }}>
          <span>{profile.firstName.toUpperCase()}</span>
          <span>{profile.lastName.toUpperCase()}</span>
        </div>

        <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 26, color: "#545e69" }}>
          Full-stack engineer · web · mobile · desktop · AI
        </div>

        <div
          style={{
            position: "absolute",
            right: 44,
            top: 186,
            width: LENS * 2,
            height: LENS * 2,
            borderRadius: 999,
            background: "#05080d",
            border: "2px solid #6fe6ff",
            boxShadow: "0 0 40px rgba(111, 230, 255, 0.45)",
            display: "flex",
            overflow: "hidden",
          }}
        >
          {specks.map((speck, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: speck.x,
                top: speck.y,
                width: speck.s,
                height: speck.s,
                borderRadius: 999,
                background: speck.glow ? "#6fe6ff" : "rgba(215, 227, 234, 0.75)",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: LENS,
              height: 1,
              background: "rgba(111, 230, 255, 0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: LENS,
              width: 1,
              background: "rgba(111, 230, 255, 0.35)",
            }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
