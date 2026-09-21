import type { ReactNode } from "react";

/**
 * A system sketch for projects with nothing public to screenshot. Drawn in the
 * same etched style as the stack, so a private repository still shows what was
 * built, without inventing a screenshot of it.
 */

const LINE = "stroke-fg-2/45";
const ACCENT = "stroke-glow/80";

function Box({ x, y, w = 96, h = 34, label, sub, accent = false }: { x: number; y: number; w?: number; h?: number; label: string; sub?: string; accent?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={7} className={`fill-night-2/80 ${accent ? ACCENT : LINE}`} strokeWidth={1} />
      <text x={x + 10} y={y + (sub ? 15 : 21)} className={`font-sans text-[10px] font-medium ${accent ? "fill-glow" : "fill-fg"}`}>
        {label}
      </text>
      {sub && (
        <text x={x + 10} y={y + 27} className="fill-fg-3 font-mono text-[7.5px]">
          {sub}
        </text>
      )}
    </g>
  );
}

function Flow({ d, accent = false, dashed = false }: { d: string; accent?: boolean; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      className={accent ? ACCENT : LINE}
      strokeWidth={1}
      strokeDasharray={dashed ? "3 4" : undefined}
      markerEnd="url(#pd-arrow)"
      data-draw
      pathLength={1}
    />
  );
}

function Frame({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <svg data-draw-root viewBox="0 0 480 270" className="h-auto w-full" role="img" aria-label={caption}>
      <title>{caption}</title>
      <defs>
        <marker id="pd-arrow" viewBox="0 0 7 7" refX="6" refY="3.5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L7 3.5 L0 7z" className="fill-fg-2/60" />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

function SuperCabs() {
  return (
    <Frame caption="SuperCabs: sign-up sends an OTP, documents are verified, then the rider is approved. Firebase Cloud Messaging pushes updates to the app.">
      <Box x={24} y={118} label="Sign up" sub="phone number" />
      <Flow d="M120 135H154" />
      <Box x={158} y={118} label="OTP" sub="verify" accent />
      <Flow d="M254 135H288" />
      <Box x={292} y={118} label="Documents" sub="licence · ID" />
      <Flow d="M388 135H422" />
      <Box x={404} y={60} w={56} h={30} label="Ready" accent />
      <Flow d="M340 118V96H404" />
      <rect x={158} y={200} width={230} height={38} rx={7} className={`fill-night-2/80 ${LINE}`} strokeWidth={1} />
      <text x={170} y={216} className="fill-fg font-sans text-[10px] font-medium">
        Firebase Cloud Messaging
      </text>
      <text x={170} y={229} className="fill-fg-3 font-mono text-[7.5px]">
        ride and document status, pushed live
      </text>
      <Flow d="M206 200V166" dashed accent />
      <Flow d="M340 200V166" dashed accent />
    </Frame>
  );
}

function GMart() {
  return (
    <Frame caption="G-Mart: catalogue to cart to payment to delivery tracking, with an admin panel over orders, products and deliveries, behind role-based access.">
      <Box x={20} y={60} label="Catalogue" sub="products" />
      <Flow d="M116 77H150" />
      <Box x={154} y={60} label="Cart" sub="per customer" />
      <Flow d="M250 77H284" />
      <Box x={288} y={60} label="Payment" sub="checkout" accent />
      <Flow d="M384 77V150" />
      <Box x={288} y={152} label="Delivery" sub="tracked" />
      <rect x={20} y={186} width={364} height={52} rx={8} className={`fill-night-2/80 ${LINE}`} strokeWidth={1} />
      <text x={34} y={206} className="fill-fg font-sans text-[10px] font-medium">
        Admin panel
      </text>
      <text x={34} y={220} className="fill-fg-3 font-mono text-[7.5px]">
        orders · products · payments · delivery updates
      </text>
      <Flow d="M68 186V94" dashed />
      <Flow d="M202 186V94" dashed />
      <Flow d="M336 186V186" dashed />
      <g>
        <rect x={396} y={186} width={64} height={52} rx={8} className={`fill-night-2/80 ${ACCENT}`} strokeWidth={1} />
        <text x={408} y={206} className="fill-glow font-sans text-[10px] font-medium">
          JWT
        </text>
        <text x={408} y={220} className="fill-fg-3 font-mono text-[7.5px]">
          roles
        </text>
      </g>
    </Frame>
  );
}

function Medical() {
  return (
    <Frame caption="Medical recommendation: symptoms go into a support-vector classifier, which returns a likely condition with its description, precautions, medication, diet and workout advice.">
      <Box x={24} y={116} w={104} label="Symptoms" sub="what you enter" />
      <Flow d="M128 133H166" />
      <Box x={170} y={110} w={116} h={46} label="Support-vector" sub="classifier · scikit-learn" accent />
      <Flow d="M286 133H324" />
      {["Condition", "Precautions", "Medication", "Diet · workout"].map((label, index) => (
        <g key={label}>
          <rect x={328} y={62 + index * 38} width={128} height={28} rx={6} className={`fill-night-2/80 ${LINE}`} strokeWidth={1} />
          <text x={340} y={80 + index * 38} className="fill-fg font-sans text-[10px]">
            {label}
          </text>
        </g>
      ))}
      <Flow d="M324 133V76H328" />
      <Flow d="M324 133H328" />
      <Flow d="M324 133V190H328" />
      <Flow d="M324 133V228H328" />
    </Frame>
  );
}

function WebMedical() {
  return (
    <Frame caption="Web medical management: doctor, patient and admin modules over one MySQL database.">
      {["Doctor", "Patient", "Admin"].map((label, index) => (
        <g key={label}>
          <Box x={24} y={56 + index * 62} label={label} sub={index === 2 ? "records · staff" : index === 0 ? "appointments" : "visits · bills"} />
        </g>
      ))}
      <Flow d="M120 73H188V133" />
      <Flow d="M120 135H188" />
      <Flow d="M120 197H188V137" />
      <Box x={192} y={116} w={104} h={38} label="PHP modules" sub="one codebase" accent />
      <Flow d="M296 135H340" />
      <g>
        <ellipse cx={392} cy={106} rx={48} ry={13} className={`fill-night-2/80 ${LINE}`} strokeWidth={1} />
        <path d="M344 106v58a48 13 0 0 0 96 0v-58" className={`fill-night-2/80 ${LINE}`} strokeWidth={1} />
        <path d="M344 132a48 13 0 0 0 96 0M344 150a48 13 0 0 0 96 0" fill="none" className={LINE} strokeWidth={1} />
        <text x={368} y={196} className="fill-fg font-sans text-[10px] font-medium">
          MySQL
        </text>
      </g>
    </Frame>
  );
}

function Medcare() {
  return (
    <Frame caption="Medcare: the clinic is handed a licensed Windows build, which installs an Electron shell running the React billing screen, with records kept locally in SQLite and an Express service over MongoDB behind it.">
      {/* How it arrives: an installer, not a URL. */}
      <Box x={22} y={56} w={126} h={34} label="Licensed .exe" sub="handed to the clinic" accent />
      <Flow d="M85 90V110" accent />

      {/* What it installs. */}
      <Box x={22} y={112} w={126} h={34} label="Electron shell" sub="desktop app" />
      <Flow d="M85 146V166" />
      <Box x={22} y={168} w={126} h={34} label="React UI" sub="billing · invoices" />
      <Flow d="M85 202V222" />
      <Box x={22} y={224} w={126} h={30} label="SQLite" sub="records kept locally" />

      {/* The service behind it. */}
      <Flow d="M148 185H206" />
      <Box x={210} y={166} w={128} h={38} label="Express service" sub="Node.js" accent />
      <Flow d="M338 185H366" />
      <g>
        <ellipse cx={414} cy={148} rx={42} ry={12} className={`fill-night-2/80 ${LINE}`} strokeWidth={1} />
        <path d="M372 148v50a42 12 0 0 0 84 0v-50" className={`fill-night-2/80 ${LINE}`} strokeWidth={1} />
        <path d="M372 172a42 12 0 0 0 84 0" fill="none" className={LINE} strokeWidth={1} />
        <text x={388} y={226} className="fill-fg font-sans text-[10px] font-medium">
          MongoDB
        </text>
      </g>
    </Frame>
  );
}

const DIAGRAMS: Record<string, () => ReactNode> = {
  medcare: Medcare,
  supercabs: SuperCabs,
  "g-mart": GMart,
  "medical-recommendation": Medical,
  "web-medical-management": WebMedical,
};

export function ProjectDiagram({ slug }: { slug: string }) {
  const Diagram = DIAGRAMS[slug];
  return Diagram ? <Diagram /> : null;
}

export function hasDiagram(slug: string): boolean {
  return slug in DIAGRAMS;
}
