// Software Vala — Channels & Direct Messages data model (local UI state only)

export type Presence = "online" | "away" | "dnd" | "offline" | "idle";
export type ChannelKind = "public" | "private" | "dm" | "group";
export type MemberRole = "owner" | "admin" | "member";
export type NotificationLevel = "all" | "mentions" | "nothing";
export type MuteDuration = "1h" | "8h" | "24h" | "forever";

export type Member = {
  id: string; // e.g. DEV-004521
  role: MemberRole;
  presence: Presence;
};

export type PinnedMessage = {
  id: string;
  authorId: string;
  text: string;
  time: string;
};

export type Channel = {
  id: string;
  name: string;
  kind: ChannelKind;
  topic: string;
  description: string;
  memberIds: string[];
  members: Member[];
  joined: boolean;
  pinned: boolean;
  muted: boolean;
  notification: NotificationLevel;
  muteDuration: MuteDuration;
  pinnedMessages: PinnedMessage[];
  presence?: Presence; // for dm
  createdAt: string;
};

export const PRESENCE_META: Record<Presence, { dot: string; label: string }> = {
  online: { dot: "bg-emerald-500", label: "Online" },
  away: { dot: "bg-amber-500", label: "Away" },
  dnd: { dot: "bg-rose-500", label: "Busy" },
  idle: { dot: "bg-sky-400", label: "Idle" },
  offline: { dot: "bg-muted-foreground/40", label: "Offline" },
};

let idSeq = 900;
export function nextChannelId(prefix = "CH") {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

function m(id: string, role: MemberRole, presence: Presence): Member {
  return { id, role, presence };
}

export const initialChannels: Channel[] = [
  {
    id: "CH-101",
    name: "general",
    kind: "public",
    topic: "Company-wide announcements & everyday chatter",
    description: "Default channel for every employee. Please keep it professional.",
    memberIds: ["DEV-004521", "QA-001120", "SUP-002031", "BOSS-000001"],
    members: [
      m("BOSS-000001", "owner", "online"),
      m("DEV-004521", "admin", "online"),
      m("QA-001120", "member", "away"),
      m("SUP-002031", "member", "offline"),
    ],
    joined: true,
    pinned: true,
    muted: false,
    notification: "all",
    muteDuration: "1h",
    pinnedMessages: [
      { id: "MSG-1", authorId: "BOSS-000001", text: "Welcome to Software Vala — read the handbook in DOC-1001.", time: "09:12" },
    ],
    createdAt: "2024-01-04",
  },
  {
    id: "CH-102",
    name: "eng-platform",
    kind: "public",
    topic: "Core platform engineering, infra & releases",
    description: "Discussion for platform squad: deploys, incidents, RFCs.",
    memberIds: ["DEV-004521", "DEV-004522", "QA-001120"],
    members: [
      m("DEV-004521", "owner", "online"),
      m("DEV-004522", "admin", "dnd"),
      m("QA-001120", "member", "away"),
    ],
    joined: true,
    pinned: false,
    muted: false,
    notification: "mentions",
    muteDuration: "1h",
    pinnedMessages: [
      { id: "MSG-2", authorId: "DEV-004522", text: "Release freeze starts Friday 6pm IST.", time: "14:02" },
      { id: "MSG-3", authorId: "DEV-004521", text: "Runbook: DOC-2210", time: "10:44" },
    ],
    createdAt: "2024-02-11",
  },
  {
    id: "CH-103",
    name: "design-crit",
    kind: "private",
    topic: "Weekly design critique & feedback",
    description: "Invite-only channel for design review sessions.",
    memberIds: ["DEV-004521", "SUP-002031"],
    members: [
      m("SUP-002031", "owner", "offline"),
      m("DEV-004521", "member", "online"),
    ],
    joined: false,
    pinned: false,
    muted: false,
    notification: "all",
    muteDuration: "1h",
    pinnedMessages: [],
    createdAt: "2024-03-02",
  },
  {
    id: "CH-104",
    name: "incident-response",
    kind: "public",
    topic: "P0/P1 incident coordination",
    description: "Real-time incident bridge. Bots post alerts here automatically.",
    memberIds: ["DEV-004521", "DEV-004522", "QA-001120", "SUP-002031", "BOSS-000001"],
    members: [
      m("BOSS-000001", "admin", "online"),
      m("DEV-004521", "owner", "online"),
      m("DEV-004522", "member", "dnd"),
      m("QA-001120", "member", "idle"),
      m("SUP-002031", "member", "offline"),
    ],
    joined: true,
    pinned: true,
    muted: true,
    notification: "mentions",
    muteDuration: "8h",
    pinnedMessages: [
      { id: "MSG-4", authorId: "BOSS-000001", text: "Escalation matrix: DOC-3050", time: "08:00" },
    ],
    createdAt: "2024-01-20",
  },
  {
    id: "CH-105",
    name: "random",
    kind: "public",
    topic: "Off-topic, memes, wins",
    description: "Non-work chatter. Keep it kind.",
    memberIds: ["DEV-004521", "QA-001120", "SUP-002031"],
    members: [
      m("DEV-004521", "member", "online"),
      m("QA-001120", "owner", "away"),
      m("SUP-002031", "member", "offline"),
    ],
    joined: false,
    pinned: false,
    muted: false,
    notification: "nothing",
    muteDuration: "forever",
    pinnedMessages: [],
    createdAt: "2024-04-18",
  },
  // Direct messages (1-1)
  {
    id: "CH-DM-01",
    name: "DEV-004522",
    kind: "dm",
    topic: "",
    description: "",
    memberIds: ["DEV-004522"],
    members: [m("DEV-004522", "member", "dnd")],
    joined: true,
    pinned: false,
    muted: false,
    notification: "all",
    muteDuration: "1h",
    pinnedMessages: [],
    presence: "dnd",
    createdAt: "2024-05-01",
  },
  {
    id: "CH-DM-02",
    name: "QA-001120",
    kind: "dm",
    topic: "",
    description: "",
    memberIds: ["QA-001120"],
    members: [m("QA-001120", "member", "away")],
    joined: true,
    pinned: true,
    muted: false,
    notification: "all",
    muteDuration: "1h",
    pinnedMessages: [],
    presence: "away",
    createdAt: "2024-05-03",
  },
  {
    id: "CH-DM-03",
    name: "SUP-002031",
    kind: "dm",
    topic: "",
    description: "",
    memberIds: ["SUP-002031"],
    members: [m("SUP-002031", "member", "offline")],
    joined: true,
    pinned: false,
    muted: true,
    notification: "nothing",
    muteDuration: "forever",
    pinnedMessages: [],
    presence: "offline",
    createdAt: "2024-05-06",
  },
  // Group DM (multi-person)
  {
    id: "CH-GRP-01",
    name: "Release Squad",
    kind: "group",
    topic: "Release coordination huddle",
    description: "Ad-hoc group for the v4.2 release rollout.",
    memberIds: ["DEV-004521", "DEV-004522", "QA-001120"],
    members: [
      m("DEV-004521", "owner", "online"),
      m("DEV-004522", "member", "dnd"),
      m("QA-001120", "member", "away"),
    ],
    joined: true,
    pinned: false,
    muted: false,
    notification: "mentions",
    muteDuration: "1h",
    pinnedMessages: [
      { id: "MSG-5", authorId: "DEV-004521", text: "Rollback plan: DOC-4110", time: "16:30" },
    ],
    createdAt: "2024-05-10",
  },
  {
    id: "CH-GRP-02",
    name: "Client Onboarding — ATLAS",
    kind: "group",
    topic: "PRJ-ATLAS-23 onboarding coordination",
    description: "Cross-functional group for the Atlas client onboarding.",
    memberIds: ["DEV-004521", "SUP-002031", "BOSS-000001"],
    members: [
      m("BOSS-000001", "owner", "online"),
      m("DEV-004521", "admin", "online"),
      m("SUP-002031", "member", "offline"),
    ],
    joined: true,
    pinned: false,
    muted: false,
    notification: "all",
    muteDuration: "1h",
    pinnedMessages: [],
    createdAt: "2024-05-15",
  },
];

export const DIRECTORY_IDS = [
  "BOSS-000001", "DEV-004521", "DEV-004522", "QA-001120", "SUP-002031", "AUT-000771", "VEN-000230",
];
