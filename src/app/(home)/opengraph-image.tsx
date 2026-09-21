import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { loadOgAsset, loadOgFonts, ogColors as c } from "@/lib/ogFonts";

export const alt = `${profile.name}, full-stack engineer for web, mobile, desktop and AI`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card: the name and statement beside a render of the stack from the site. */
export default async function OpenGraphImage() {
  const [fonts, stack] = await Promise.all([loadOgFonts(), loadOgAsset("stack.png")]);
  const words = [
    ...profile.statement.lead.split(" ").map((text) => ({ text, accent: false })),
    ...profile.statement.accent.split(" ").map((text) => ({ text, accent: true })),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: `radial-gradient(60% 80% at 78% 50%, #0b1626, ${c.night} 70%)`,
          color: c.fg,
          fontFamily: "Geist",
        }}
      >
        { }
        <img src={stack} alt="" width={522} height={630} style={{ position: "absolute", right: 36, top: 0 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 700,
            padding: "60px 0 56px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Geist Mono", fontSize: 18, color: c.fg2 }}>
            <div style={{ width: 28, height: 1, background: c.fg3 }} />
            FULL-STACK ENGINEER — WEB · MOBILE · DESKTOP · AI
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 500, lineHeight: 0.94, letterSpacing: -5 }}>
              <span>{profile.firstName}</span>
              <span>{profile.lastName}</span>
            </div>
            {/* Word by word, so the serif phrase can share a line with the rest. */}
            <div style={{ display: "flex", flexWrap: "wrap", columnGap: 8, marginTop: 30, maxWidth: 600, fontSize: 30, lineHeight: 1.35, color: c.fg2 }}>
              {words.map((word, index) => (
                <span
                  key={index}
                  style={word.accent ? { fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 34, color: c.fg } : {}}
                >
                  {word.text}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Geist Mono", fontSize: 18, color: c.fg2 }}>
            <div style={{ width: 11, height: 11, borderRadius: 999, background: c.warm }} />
            {profile.availability.toUpperCase()}
            <span style={{ color: c.fg3 }}>· {profile.locationShort.toUpperCase()}</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
