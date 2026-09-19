import { ImageResponse } from "next/og";
import { caseStudy } from "@/content/aethra";
import { profile } from "@/content/profile";
import { featured } from "@/content/projects";
import { loadOgFonts, loadPublicImage, ogColors as c } from "@/lib/ogFonts";

export const alt = "Aethra case study: an AI agent that uses your computer behind a permission gate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [fonts, logo] = await Promise.all([loadOgFonts(), loadPublicImage("aethra-logo.png")]);
  const decisions = [
    { label: "ALLOW", color: c.glow },
    { label: "ASK", color: c.warm },
    { label: "DENY", color: c.deny },
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
          padding: "60px 64px 56px",
          background: `radial-gradient(70% 90% at 85% 20%, #0b1626, ${c.night} 70%)`,
          color: c.fg,
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "Geist Mono", fontSize: 18, color: c.fg2 }}>
          { }
          <img src={logo} alt="" width={44} height={44} style={{ borderRadius: 10 }} />
          CASE STUDY · {featured.kind.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 500, lineHeight: 0.9, letterSpacing: -8 }}>{caseStudy.title}</div>
          <div style={{ display: "flex", marginTop: 28, maxWidth: 940, fontSize: 32, lineHeight: 1.35, color: c.fg2 }}>
            {caseStudy.tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12, fontFamily: "Geist Mono", fontSize: 18 }}>
            {decisions.map((decision) => (
              <div
                key={decision.label}
                style={{ display: "flex", padding: "8px 18px", borderRadius: 999, border: `1.5px solid ${decision.color}`, color: decision.color }}
              >
                {decision.label}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 18, color: c.fg3 }}>{profile.name.toUpperCase()}</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
