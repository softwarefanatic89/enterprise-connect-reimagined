// Software Vala — Enterprise Chat data model
// IDENTITY RULE: only system-generated IDs. No names, emails, photos, phones.

export type RoleCode = "BOSS" | "DEV" | "QA" | "SUP" | "AUT" | "VEN" | "RES" | "AFF" | "CUS" | "AI" | "FND" | "SYS";
export type Presence = "online" | "away" | "dnd" | "offline" | "idle";
export type LiveState = "typing" | "recording" | "calling" | "meeting" | null;
export type Priority = "P0" | "P1" | "P2" | "P3";
export type WorkStatus =
  | "CODING" | "TESTING" | "DEPLOYING" | "BUG" | "REVIEW"
  | "URGENT" | "WAITING" | "PAYMENT" | "DELIVERED" | "COMPLETED";

export type ConvKind = "USER" | "AMS" | "PRJ" | "DEPT" | "MOD";

export type Conversation = {
  id: string;            // e.g. AMS-2041, DEV-004521, PRJ-ATLAS-23
  kind: ConvKind;
  role?: RoleCode;
  department: string;    // dept ID, e.g. DPT-ENG
  module: string;        // module ID, e.g. MOD-CHAT-CORE
  project?: string;      // project ID, e.g. PRJ-ATLAS-23
  ams?: string;
  presence?: Presence;
  unread?: number;
  pinned?: boolean;
  muted?: boolean;
  lastPreview: string;   // preview shows status, not personal text snippets
  lastTime: string;
  verified?: boolean;
  health?: "ok" | "warn" | "crit";
  priority?: Priority;
  live?: LiveState;
  assignee?: string;   // e.g. DEV-004521
  waiting?: boolean;
  folder: "all" | "dms" | "ams" | "projects" | "depts";
};

export type Message = {
  id: string;
  senderId: string;       // role-coded ID, e.g. DEV-004521
  role: RoleCode;
  department: string;
  module: string;
  project?: string;
  ams?: string;
  status: WorkStatus;
  priority: Priority;
  time: string;
  out?: boolean;
  text?: string;
  emotion?: WorkStatus;   // business emotion chip
  reply?: { id: string; role: RoleCode; text: string };
  attachment?: {
    kind: "file" | "image" | "voice";
    id: string;           // file ID, e.g. DOC-44120
    size?: string;
    duration?: string;
    waveform?: number[];
  };
  reactions?: { emoji: string; count: number; mine?: boolean }[];
  pinned?: boolean;
  read?: "sent" | "delivered" | "read";
};

/* ───────── role meta ───────── */

export const ROLE: Record<RoleCode, {
  label: string;
  ring: string;       // border-accent class (left/right)
  bg: string;         // soft background tint
  text: string;       // accent text
  dot: string;        // solid dot/badge bg
  icon: string;       // emoji role icon (rounded family fallback)
}> = {
  BOSS: { label: "Boss",     ring: "border-amber-400/70",     bg: "bg-amber-400/10",     text: "text-amber-600",   dot: "bg-amber-500",   icon: "👑" },
  DEV:  { label: "Dev",      ring: "border-emerald-500/70",   bg: "bg-emerald-500/10",   text: "text-emerald-600", dot: "bg-emerald-500", icon: "💻" },
  QA:   { label: "QA",       ring: "border-sky-500/70",       bg: "bg-sky-500/10",       text: "text-sky-600",     dot: "bg-sky-500",     icon: "🧪" },
  SUP:  { label: "Support",  ring: "border-violet-500/70",    bg: "bg-violet-500/10",    text: "text-violet-600",  dot: "bg-violet-500",  icon: "🎧" },
  AUT:  { label: "Auditor",  ring: "border-orange-500/70",    bg: "bg-orange-500/10",    text: "text-orange-600",  dot: "bg-orange-500",  icon: "🛡" },
  VEN:  { label: "Vendor",   ring: "border-fuchsia-500/70",   bg: "bg-fuchsia-500/10",   text: "text-fuchsia-600", dot: "bg-fuchsia-500", icon: "🏭" },
  RES:  { label: "Research", ring: "border-teal-500/70",      bg: "bg-teal-500/10",      text: "text-teal-600",    dot: "bg-teal-500",    icon: "🔬" },
  AFF:  { label: "Affiliate",ring: "border-rose-500/70",      bg: "bg-rose-500/10",      text: "text-rose-600",    dot: "bg-rose-500",    icon: "🤝" },
  CUS:  { label: "Customer", ring: "border-slate-500/70",     bg: "bg-slate-500/10",     text: "text-slate-600",   dot: "bg-slate-500",   icon: "🧾" },
  AI:   { label: "AI Agent", ring: "border-cyan-500/70",      bg: "bg-cyan-500/10",      text: "text-cyan-600",    dot: "bg-cyan-500",    icon: "✦" },
  FND:  { label: "Founder",  ring: "border-yellow-400/80",    bg: "bg-yellow-400/15",    text: "text-yellow-600",  dot: "bg-yellow-500",  icon: "★" },
  SYS:  { label: "System",   ring: "border-zinc-500/70",      bg: "bg-zinc-500/10",      text: "text-zinc-600",    dot: "bg-zinc-500",    icon: "⚙" },
};

export const EMOTION: Record<WorkStatus, { label: string; icon: string; cls: string }> = {
  CODING:    { label: "Coding",     icon: "💻", cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
  TESTING:   { label: "Testing",    icon: "🧪", cls: "text-sky-600 bg-sky-500/10 border-sky-500/30" },
  DEPLOYING: { label: "Deploying",  icon: "🚀", cls: "text-violet-600 bg-violet-500/10 border-violet-500/30" },
  BUG:       { label: "Bug",        icon: "🐞", cls: "text-rose-600 bg-rose-500/10 border-rose-500/30" },
  REVIEW:    { label: "Review",     icon: "⚠",  cls: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
  URGENT:    { label: "Urgent",     icon: "🔥", cls: "text-red-600 bg-red-500/10 border-red-500/30" },
  WAITING:   { label: "Waiting",    icon: "⏳", cls: "text-slate-600 bg-slate-500/10 border-slate-500/30" },
  PAYMENT:   { label: "Payment",    icon: "💰", cls: "text-yellow-700 bg-yellow-500/10 border-yellow-500/30" },
  DELIVERED: { label: "Delivered",  icon: "📦", cls: "text-teal-600 bg-teal-500/10 border-teal-500/30" },
  COMPLETED: { label: "Completed",  icon: "🎉", cls: "text-emerald-700 bg-emerald-500/15 border-emerald-500/40" },
};

export const PRIORITY: Record<Priority, { cls: string; label: string }> = {
  P0: { label: "P0", cls: "bg-red-500 text-white" },
  P1: { label: "P1", cls: "bg-rose-500 text-white" },
  P2: { label: "P2", cls: "bg-amber-500 text-white" },
  P3: { label: "P3", cls: "bg-slate-400 text-white" },
};

/* ───────── conversation list (IDs only) ───────── */

export const conversations: Conversation[] = [
  {
    id: "AMS-002041", kind: "AMS", role: "DEV", department: "DPT-ENG", module: "MOD-CHAT-CORE", project: "PRJ-ATLAS-23",
    presence: "online", unread: 4, pinned: true, lastPreview: "Patch pushed · heartbeat 12s", lastTime: "10:42",
    verified: true, health: "warn", priority: "P1", live: "typing", assignee: "DEV-004521", folder: "ams",
  },
  {
    id: "DEV-004521", kind: "USER", role: "DEV", department: "DPT-ENG", module: "MOD-CHAT-CORE",
    presence: "online", unread: 2, lastPreview: "Running regression RGN-441", lastTime: "10:31",
    verified: true, priority: "P2", live: "typing", folder: "dms",
  },
  {
    id: "PRJ-ATLAS-23", kind: "PRJ", department: "DPT-PROD", module: "MOD-RELEASE", project: "PRJ-ATLAS-23",
    presence: "online", pinned: true, lastPreview: "Sprint S-24 · 68% complete", lastTime: "09:58",
    verified: true, health: "ok", folder: "projects",
  },
  {
    id: "BOSS-000001", kind: "USER", role: "BOSS", department: "DPT-LEAD", module: "MOD-EXEC",
    presence: "dnd", lastPreview: "Approved · verify staging RC1", lastTime: "09:12",
    verified: true, priority: "P1", live: "meeting", folder: "dms",
  },
  {
    id: "QA-001284", kind: "USER", role: "QA", department: "DPT-QA", module: "MOD-CHAT-CORE",
    presence: "online", unread: 1, lastPreview: "2 edge cases isolated", lastTime: "Yesterday",
    verified: true, folder: "dms", health: "crit", priority: "P0", waiting: true,
  },
  {
    id: "AI-BLACKBOX-01", kind: "USER", role: "AI", department: "DPT-AI", module: "MOD-INSIGHT",
    presence: "online", lastPreview: "3 smart replies ready", lastTime: "10:40",
    verified: true, folder: "dms",
  },
  {
    id: "DPT-SUPPORT", kind: "DEPT", department: "DPT-SUPPORT", module: "MOD-HELPDESK",
    presence: "online", lastPreview: "Waiting on CUS-008742 creds", lastTime: "Yesterday",
    verified: true, priority: "P2", waiting: true, folder: "depts",
  },
  {
    id: "AMS-002039", kind: "AMS", role: "QA", department: "DPT-QA", module: "MOD-PRESENCE", project: "PRJ-ATLAS-23",
    presence: "away", lastPreview: "Signed off · closed", lastTime: "Mon",
    verified: true, health: "ok", priority: "P3", folder: "ams",
  },
  {
    id: "CUS-008742", kind: "USER", role: "CUS", department: "DPT-CSM", module: "MOD-ONBOARD",
    presence: "offline", lastPreview: "Awaiting staging credentials", lastTime: "Mon",
    verified: true, priority: "P2", waiting: true, folder: "dms",
  },
];

/* ───────── conversation transcript (IDs only) ───────── */

export const messages: Message[] = [
  {
    id: "MSG-100001", senderId: "DEV-004521", role: "DEV",
    department: "DPT-ENG", module: "MOD-CHAT-CORE", project: "PRJ-ATLAS-23", ams: "AMS-002041",
    status: "CODING", priority: "P1", time: "10:24", emotion: "CODING",
    text: "Pushed the patch for presence drift on long-lived sockets. Heartbeat interval reduced to 12s, exponential back-off retained.",
  },
  {
    id: "MSG-100002", senderId: "DEV-004521", role: "DEV",
    department: "DPT-ENG", module: "MOD-CHAT-CORE", project: "PRJ-ATLAS-23", ams: "AMS-002041",
    status: "CODING", priority: "P1", time: "10:24",
    attachment: { kind: "file", id: "DOC-044120", size: "12.4 KB" },
    reactions: [{ emoji: "🚀", count: 4, mine: true }, { emoji: "👏", count: 2 }],
  },
  {
    id: "MSG-100003", senderId: "BOSS-000001", role: "BOSS",
    department: "DPT-LEAD", module: "MOD-EXEC", project: "PRJ-ATLAS-23", ams: "AMS-002041",
    status: "REVIEW", priority: "P1", time: "10:26", out: true, read: "read", emotion: "REVIEW",
    text: "Approved. Please verify staging green before tagging RC1. Tag me on the final QA sign-off.",
  },
  {
    id: "MSG-100004", senderId: "QA-001284", role: "QA",
    department: "DPT-QA", module: "MOD-CHAT-CORE", project: "PRJ-ATLAS-23", ams: "AMS-002041",
    status: "TESTING", priority: "P1", time: "10:29",
    reply: { id: "DEV-004521", role: "DEV", text: "Pushed the patch for presence drift…" },
    text: "Running regression suite RGN-441. Two edge cases isolated — will attach trace IDs once reproduced.",
    emotion: "TESTING",
  },
  {
    id: "MSG-100005", senderId: "QA-001284", role: "QA",
    department: "DPT-QA", module: "MOD-CHAT-CORE", project: "PRJ-ATLAS-23", ams: "AMS-002041",
    status: "BUG", priority: "P0", time: "10:30", emotion: "BUG",
    attachment: { kind: "image", id: "IMG-019021", size: "0.9 MB" },
  },
  {
    id: "MSG-100006", senderId: "BOSS-000001", role: "BOSS",
    department: "DPT-LEAD", module: "MOD-EXEC", project: "PRJ-ATLAS-23", ams: "AMS-002041",
    status: "REVIEW", priority: "P1", time: "10:33", out: true, read: "delivered",
    attachment: {
      kind: "voice", id: "VOX-007781", duration: "0:34",
      waveform: [4, 8, 14, 20, 28, 22, 16, 26, 30, 18, 10, 22, 28, 16, 8, 14, 20, 26, 18, 10, 6, 12, 18, 24, 16, 8],
    },
  },
  {
    id: "MSG-100007", senderId: "DEV-004521", role: "DEV",
    department: "DPT-ENG", module: "MOD-CHAT-CORE", project: "PRJ-ATLAS-23", ams: "AMS-002041",
    status: "DEPLOYING", priority: "P1", time: "10:38", emotion: "DEPLOYING",
    text: "Deployment scheduled for 18:00 IST on stg-04. Rollback window held for 30 min post-cutover.",
    reactions: [{ emoji: "🚀", count: 6, mine: true }, { emoji: "💯", count: 3 }, { emoji: "🔥", count: 5 }],
    pinned: true,
  },
  {
    id: "MSG-100008", senderId: "SUP-005812", role: "SUP",
    department: "DPT-SUPPORT", module: "MOD-HELPDESK", project: "PRJ-ATLAS-23",
    status: "WAITING", priority: "P2", time: "10:41", emotion: "WAITING",
    text: "Waiting on customer CUS-008742 to confirm staging credentials before mirroring the bug locally.",
  },
];

/* ───────── AI smart replies (generated, not stored personal data) ───────── */

export const SMART_REPLIES: string[] = [
  "✅ Approved. Please continue.",
  "🚀 Deployment scheduled.",
  "🔍 Please verify the issue.",
  "🧪 Escalated to QA.",
  "⏳ Waiting for approval.",
];

/* ───────── Reactions ───────── */
export const REACTIONS = ["👍","❤️","👏","🔥","🚀","🎉","🏆","⭐","💯","🤝","💡"];
