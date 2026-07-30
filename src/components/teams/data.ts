export type Availability = "active" | "offline" | "away" | "dnd";

export type Member = {
  id: string;
  displayName: string;
  legalName: string;
  email: string;
  phone: string;
  extension: string;
  avatarEmoji: string;
  role: "Owner" | "Admin" | "Manager" | "Member" | "Guest";
  teamId: string;
  availability: Availability;
  lastSeen: string;
  title: string;
  department: string;
  customFields: { label: string; value: string }[];
  status: "active" | "suspended" | "deactivated";
};

export type Team = {
  id: string;
  name: string;
  logoEmoji: string;
  color: string;
  description: string;
  createdAt: string;
};

export const SWATCHES = [
  "oklch(0.637 0.198 258)",
  "oklch(0.712 0.152 162)",
  "oklch(0.762 0.156 71)",
  "oklch(0.637 0.223 27)",
  "oklch(0.6 0.19 300)",
  "oklch(0.65 0.17 200)",
  "oklch(0.7 0.15 340)",
  "oklch(0.55 0.02 260)",
];

export const seedTeams: Team[] = [
  { id: "TEAM-0001", name: "Platform Engineering", logoEmoji: "⚙️", color: SWATCHES[0], description: "Core infra, APIs & reliability.", createdAt: "2024-01-12" },
  { id: "TEAM-0002", name: "Customer Success", logoEmoji: "🤝", color: SWATCHES[1], description: "Onboarding, support & retention.", createdAt: "2024-02-03" },
  { id: "TEAM-0003", name: "Growth & Marketing", logoEmoji: "📈", color: SWATCHES[4], description: "Demand gen and brand.", createdAt: "2024-03-18" },
];

export const seedMembers: Member[] = [
  { id: "USR-0001", displayName: "Aarav Shah", legalName: "Aarav K. Shah", email: "aarav.shah@softwarevala.com", phone: "+91 98200 11223", extension: "1042", avatarEmoji: "👨‍💻", role: "Owner", teamId: "TEAM-0001", availability: "active", lastSeen: "Now", title: "VP Engineering", department: "Platform", customFields: [{ label: "Slack", value: "@aarav" }, { label: "Location", value: "Mumbai, IN" }], status: "active" },
  { id: "USR-0002", displayName: "Priya Nair", legalName: "Priya S. Nair", email: "priya.nair@softwarevala.com", phone: "+91 98200 33445", extension: "1088", avatarEmoji: "👩‍💼", role: "Admin", teamId: "TEAM-0001", availability: "away", lastSeen: "12 min ago", title: "Engineering Manager", department: "Platform", customFields: [{ label: "Location", value: "Pune, IN" }], status: "active" },
  { id: "USR-0003", displayName: "Rohan Mehta", legalName: "Rohan V. Mehta", email: "rohan.mehta@softwarevala.com", phone: "+91 98200 55667", extension: "1103", avatarEmoji: "🧑‍🔧", role: "Member", teamId: "TEAM-0001", availability: "offline", lastSeen: "3 hours ago", title: "Senior SRE", department: "Platform", customFields: [], status: "active" },
  { id: "USR-0004", displayName: "Ishita Rao", legalName: "Ishita Rao", email: "ishita.rao@softwarevala.com", phone: "+91 98200 77889", extension: "2011", avatarEmoji: "👩‍💻", role: "Manager", teamId: "TEAM-0002", availability: "active", lastSeen: "Now", title: "Head of Support", department: "Customer Success", customFields: [{ label: "Timezone", value: "IST" }], status: "active" },
  { id: "USR-0005", displayName: "Karan Verma", legalName: "Karan S. Verma", email: "karan.verma@softwarevala.com", phone: "+91 98200 99001", extension: "2033", avatarEmoji: "🧑‍💼", role: "Member", teamId: "TEAM-0002", availability: "dnd", lastSeen: "1 hour ago", title: "Support Lead", department: "Customer Success", customFields: [], status: "suspended" },
  { id: "USR-0006", displayName: "Sneha Kulkarni", legalName: "Sneha A. Kulkarni", email: "sneha.kulkarni@softwarevala.com", phone: "+91 98200 22110", extension: "3021", avatarEmoji: "👩‍🎨", role: "Admin", teamId: "TEAM-0003", availability: "active", lastSeen: "Now", title: "Growth Lead", department: "Marketing", customFields: [{ label: "Location", value: "Bengaluru, IN" }], status: "active" },
  { id: "USR-0007", displayName: "Devansh Gupta", legalName: "Devansh Gupta", email: "devansh.gupta@softwarevala.com", phone: "+91 98200 44556", extension: "3044", avatarEmoji: "🧑‍🚀", role: "Guest", teamId: "TEAM-0003", availability: "offline", lastSeen: "Yesterday", title: "Contractor — Content", department: "Marketing", customFields: [], status: "deactivated" },
];

export type PendingInvite = {
  id: string;
  email: string;
  role: Member["role"];
  teamId: string;
  status: "pending" | "resent" | "revoked";
  sentAt: string;
};

export const seedInvites: PendingInvite[] = [
  { id: "INV-0001", email: "nikhil.j@softwarevala.com", role: "Member", teamId: "TEAM-0001", status: "pending", sentAt: "2024-05-01" },
  { id: "INV-0002", email: "meera.k@softwarevala.com", role: "Admin", teamId: "TEAM-0002", status: "resent", sentAt: "2024-05-04" },
];

export type MemberGroup = {
  id: string;
  name: string;
  mention: string;
  memberIds: string[];
  isSystem?: boolean;
};

export const seedGroups: MemberGroup[] = [
  { id: "GRP-ALL", name: "Everyone", mention: "@all", memberIds: seedMembers.map((m) => m.id), isSystem: true },
  { id: "GRP-ENG", name: "Engineering Leads", mention: "@eng-leads", memberIds: ["USR-0001", "USR-0002"] },
  { id: "GRP-CS", name: "Support On-call", mention: "@support-oncall", memberIds: ["USR-0004", "USR-0005"] },
];

export const PERMISSIONS = [
  "View conversations",
  "Send messages",
  "Manage channels",
  "Invite members",
  "Remove members",
  "Manage roles",
  "Manage billing",
  "Manage integrations",
  "View audit logs",
  "Manage branding",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_NAMES = ["Owner", "Admin", "Manager", "Member", "Guest"] as const;

export const defaultRolePermissions: Record<(typeof ROLE_NAMES)[number], Permission[]> = {
  Owner: [...PERMISSIONS],
  Admin: ["View conversations", "Send messages", "Manage channels", "Invite members", "Remove members", "View audit logs", "Manage integrations"],
  Manager: ["View conversations", "Send messages", "Manage channels", "Invite members", "View audit logs"],
  Member: ["View conversations", "Send messages"],
  Guest: ["View conversations"],
};

export const AVAILABILITY_META: Record<Availability, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-emerald-500" },
  away: { label: "Away", dot: "bg-amber-500" },
  dnd: { label: "Do Not Disturb", dot: "bg-rose-500" },
  offline: { label: "Offline", dot: "bg-muted-foreground/40" },
};
