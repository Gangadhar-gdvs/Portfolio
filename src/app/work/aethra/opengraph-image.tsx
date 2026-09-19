import { ImageResponse } from "next/og";
import { caseStudy } from "@/content/aethra";
import { profile } from "@/content/profile";
import { loadOgFonts } from "@/lib/ogFonts";

export const alt = "Aethra case study: an AI agent that uses your computer behind a permission gate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const fonts = await loadOgFonts();
  const decisions = [
    { label: "ALLOW", color: "#6fe6ff" },
    { label: "ASK", color: "#ff9e4a" },
    { label: "DENY", color: "#ff7a85" },
  ];

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
          background: "#05080d",
          color: "#d7e3ea",
        }}
      >
        <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 22, color: "#6fe6ff" }}>
          CASE STUDY · {profile.name.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 170, lineHeight: 0.86 }}>
            {caseStudy.title.toUpperCase()}
          </div>
          <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 27, lineHeight: 1.4, maxWidth: 1000 }}>
            An AI agent that uses your computer, behind a permission gate on every action.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontFamily: "JetBrains Mono", fontSize: 22 }}>
          {decisions.map((decision) => (
            <div
              key={decision.label}
              style={{
                display: "flex",
                padding: "8px 22px",
                borderRadius: 999,
                border: `2px solid ${decision.color}`,
                color: decision.color,
              }}
            >
              {decision.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
