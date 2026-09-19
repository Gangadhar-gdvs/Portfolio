/**
 * The Aethra case study. Facts here come from the Aethra repositories:
 * `Aethra-Docs/AETHRA_ARCHITECTURE.md`, `AETHRA_PROGRESS.md` and
 * `Aethra-backend/src/services/toolPolicy.ts`.
 */

export type NodeId = "you" | "desktop" | "os" | "brain" | "memory" | "gate" | "cloud" | "tools";

export interface ArchNode {
  id: NodeId;
  title: string;
  detail: string;
  accent?: boolean;
}

export interface ArchEdge {
  from: NodeId;
  to: NodeId;
  label?: string;
}

export const architecture: { nodes: ArchNode[]; edges: ArchEdge[] } = {
  nodes: [
    { id: "you", title: "You", detail: "voice or text" },
    { id: "desktop", title: "Desktop app", detail: "Rust · 3D avatar" },
    { id: "os", title: "Your computer", detail: "screen, keys, mouse" },
    { id: "brain", title: "Brain", detail: "plan → act → verify" },
    { id: "memory", title: "Memory", detail: "vectors in SQLite" },
    { id: "gate", title: "Permission gate", detail: "allow · ask · deny", accent: true },
    { id: "cloud", title: "Cloud", detail: "licences · rules" },
    { id: "tools", title: "Backend tools", detail: "browser, code, mail" },
  ],
  edges: [
    { from: "you", to: "desktop" },
    { from: "desktop", to: "brain", label: "WebSocket" },
    { from: "brain", to: "gate" },
    { from: "gate", to: "tools" },
    { from: "desktop", to: "os" },
    { from: "brain", to: "memory" },
    { from: "cloud", to: "gate" },
  ],
};

/** Grid slots for each layout: [column, row]. */
export const architectureLayouts = {
  wide: {
    columns: 4,
    rows: 3,
    slots: {
      you: [0, 1],
      desktop: [1, 1],
      os: [1, 2],
      brain: [2, 1],
      memory: [2, 0],
      gate: [3, 1],
      cloud: [3, 0],
      tools: [3, 2],
    },
  },
  tall: {
    columns: 2,
    rows: 5,
    slots: {
      you: [0, 0],
      desktop: [0, 1],
      os: [1, 1],
      brain: [0, 2],
      memory: [1, 2],
      gate: [0, 3],
      cloud: [1, 3],
      tools: [0, 4],
    },
  },
} satisfies Record<string, { columns: number; rows: number; slots: Record<NodeId, [number, number]> }>;

export type Risk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Decision = "ALLOW" | "ASK" | "DENY";

export interface ToolPolicy {
  name: string;
  description: string;
  executor: "backend" | "desktop";
  risk: Risk;
  defaultAction: Decision;
}

/**
 * A sample of the real registry, plus one tool a model might invent.
 * `registered: false` is how the gate fails closed.
 */
export const sampleTools: (ToolPolicy & { registered: boolean })[] = [
  {
    name: "recall_memories",
    description: "Search long-term memory",
    executor: "backend",
    risk: "LOW",
    defaultAction: "ALLOW",
    registered: true,
  },
  {
    name: "browser_navigate",
    description: "Open a URL in the agent browser",
    executor: "backend",
    risk: "MEDIUM",
    defaultAction: "ALLOW",
    registered: true,
  },
  {
    name: "browser_type",
    description: "Type into a web form (may submit data)",
    executor: "backend",
    risk: "HIGH",
    defaultAction: "ASK",
    registered: true,
  },
  {
    name: "comm_send_email",
    description: "Send an email on your behalf",
    executor: "backend",
    risk: "HIGH",
    defaultAction: "ASK",
    registered: true,
  },
  {
    name: "view_screen",
    description: "Capture your screen",
    executor: "desktop",
    risk: "MEDIUM",
    defaultAction: "ALLOW",
    registered: true,
  },
  {
    name: "wipe_disk",
    description: "Not in the registry: a tool the model made up",
    executor: "backend",
    risk: "CRITICAL",
    defaultAction: "DENY",
    registered: false,
  },
];

export interface GateInput {
  tool: { registered: boolean; defaultAction: Decision };
  cloudDisabled: boolean;
  localRule: Decision | null;
}

export interface GateStep {
  id: "registry" | "cloud" | "local" | "default";
  question: string;
}

export const gateSteps: GateStep[] = [
  { id: "registry", question: "Is the tool in the registry?" },
  { id: "cloud", question: "Has a cloud admin disabled it?" },
  { id: "local", question: "Does a local rule match?" },
  { id: "default", question: "Use the tool's default action" },
];

/**
 * Mirrors `permissionService.evaluateTool` in Aethra: four checks in a fixed
 * order, first match wins, and anything unknown is denied.
 */
export function evaluateGate(input: GateInput): { decision: Decision; decidedAt: GateStep["id"] } {
  if (!input.tool.registered) return { decision: "DENY", decidedAt: "registry" };
  if (input.cloudDisabled) return { decision: "DENY", decidedAt: "cloud" };
  if (input.localRule) return { decision: input.localRule, decidedAt: "local" };
  return { decision: input.tool.defaultAction, decidedAt: "default" };
}

export const decisionOutcome: Record<Decision, string> = {
  ALLOW: "Runs immediately. The result goes back to the model, which decides the next step.",
  ASK: "Pauses the loop. Backend tools ask for approval over the WebSocket; OS tools prompt on the desktop.",
  DENY: "Never runs. The model receives “permission denied” and has to find another way.",
};

export const caseStudy = {
  title: "Aethra",
  tagline: "An AI that sees your screen, plans the steps and does the work, and has to pass a permission gate before every action.",
  meta: [
    { label: "Role", value: "Architecture and engineering" },
    { label: "Status", value: "In active development, 2026" },
    { label: "Platforms", value: "Desktop, backend, cloud, admin, Android (planned)" },
  ],
  idea: [
    "Most assistants can only talk. Aethra can act: it reads what is on screen, breaks a goal into steps, then clicks, types, browses, edits files and drives Blender, while a 3D avatar talks you through what it is doing.",
    "Acting on someone's computer is only acceptable if it is safe by construction. So the interesting engineering is less about the model and more about the system around it.",
  ],
  brainAndHands: [
    { title: "The backend is the brain", body: "A Bun and Elysia service runs the plan → act → verify loop, owns the conversation history and assembles context. The UI only renders state." },
    { title: "The desktop is the hands and eyes", body: "A Tauri app with a Rust core executes OS actions. It connects to the brain over a WebSocket and runs nothing on its own initiative." },
    { title: "Six separate packages", body: "Desktop, backend, cloud, admin portal, a shared library and an Android shell, kept as a polyrepo so each builds and ships independently." },
  ],
  gateIntro:
    "Every tool call, from the backend or the OS, passes through one gate before it runs. There is no second path. The registry gives each of the 44 tools a risk tier and a default action, and a tool that isn't registered is denied, so a model cannot invent its way around the rules.",
  deviceLayer: {
    intro: "Operating-system work sits behind one Rust interface, with a per-platform implementation chosen at compile time. Callers never branch on the OS.",
    modules: [
      { file: "shell.rs", role: "Native shell: sh on macOS and Linux, PowerShell on Windows" },
      { file: "screen.rs", role: "Native screen capture, downscaled and JPEG-encoded" },
      { file: "input.rs", role: "Mouse and keyboard, with {ENTER}-style key tokens" },
      { file: "uitree.rs", role: "Accessibility tree: System Events on macOS, UIAutomation on Windows" },
      { file: "mod.rs", role: "Capability discovery, reported to the brain on connect so it never plans around a missing ability" },
    ],
  },
  memory: [
    "Facts and documents are embedded and stored as vectors in local SQLite, then retrieved by cosine similarity.",
    "Each vector is tagged with the model that produced it, because similarity across embedding spaces is meaningless. Retrieval only scores vectors from the active model.",
    "If embeddings fail entirely, memory falls back to keyword search instead of breaking the conversation.",
  ],
  cost: [
    "The default setup needs no account, no API key and no network: chat runs on a local Ollama model and embeddings on nomic-embed-text.",
    "Gemini's free tier is the fallback, and telemetry stays off unless it is explicitly enabled.",
  ],
  swarm:
    "For long research or reporting, Aethra spawns a background subagent with the delegate_task tool. The conversation carries on; when the subagent finishes, its result lands in the conversation's context and Aethra picks it up.",
  next: [
    "Fully local voice, with Piper for speech and Whisper for recognition",
    "The complete tool set for offline models, derived from the registry",
    "The Android port, using the AccessibilityService API",
  ],
};
