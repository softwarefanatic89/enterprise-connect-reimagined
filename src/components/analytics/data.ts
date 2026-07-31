export type ConvStatus = "active" | "escalated" | "human" | "closed";
export type Priority = "high" | "medium" | "low";

export type Conversation = {
  id: string;
  visitor: string;
  staff: string;
  staffAvatar: string;
  status: ConvStatus;
  priority: Priority;
  tags: string[];
  rating: number | null;
  comment: string;
  firstResponseSec: number;
  messages: number;
  date: string; // ISO yyyy-mm-dd
};

export const TAGS: { name: string; color: string }[] = [
  { name: "Billing", color: "oklch(0.637 0.198 258)" },
  { name: "Onboarding", color: "oklch(0.712 0.152 162)" },
  { name: "Bug report", color: "oklch(0.637 0.223 27)" },
  { name: "Sales", color: "oklch(0.6 0.19 300)" },
  { name: "Integration", color: "oklch(0.65 0.17 200)" },
];

export const STAFF = [
  { id: "USR-0001", name: "Aarav Shah", avatar: "👨‍💻" },
  { id: "USR-0002", name: "Priya Nair", avatar: "👩‍💼" },
  { id: "USR-0004", name: "Ishita Rao", avatar: "👩‍💻" },
  { id: "USR-0005", name: "Karan Verma", avatar: "🧑‍💼" },
  { id: "USR-0006", name: "Sneha Kulkarni", avatar: "👩‍🎨" },
];

const STATUSES: ConvStatus[] = ["active", "escalated", "human", "closed"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

/** Deterministic pseudo-random so SSR and client render identically. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const TODAY = new Date("2026-07-31T00:00:00Z");

export function daysAgo(n: number) {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function build(): Conversation[] {
  const rand = rng(20260731);
  const out: Conversation[] = [];
  for (let day = 0; day < 60; day++) {
    const count = 3 + Math.floor(rand() * 6);
    for (let i = 0; i < count; i++) {
      const staff = STAFF[Math.floor(rand() * STAFF.length)];
      const rated = rand() > 0.22;
      const base = 3 + Math.floor(rand() * 3);
      out.push({
        id: `CNV-${String(out.length + 1).padStart(4, "0")}`,
        visitor: `Visitor ${String(out.length + 1).padStart(4, "0")}`,
        staff: staff.name,
        staffAvatar: staff.avatar,
        status: STATUSES[Math.floor(rand() * STATUSES.length)],
        priority: PRIORITIES[Math.floor(rand() * PRIORITIES.length)],
        tags: [TAGS[Math.floor(rand() * TAGS.length)].name],
        rating: rated ? Math.min(5, base) : null,
        comment: rated && base >= 4 ? "Fast and helpful." : rated ? "Took a while to resolve." : "",
        firstResponseSec: 20 + Math.floor(rand() * 400),
        messages: 4 + Math.floor(rand() * 30),
        date: iso(daysAgo(day)),
      });
    }
  }
  return out;
}

export const conversations: Conversation[] = build();

export const STATUS_META: Record<ConvStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-[oklch(0.95_0.04_162)] text-[oklch(0.42_0.12_162)]" },
  escalated: { label: "Escalated", cls: "bg-[oklch(0.96_0.05_27)] text-[oklch(0.48_0.18_27)]" },
  human: { label: "Human handling", cls: "bg-[oklch(0.95_0.04_258)] text-[oklch(0.42_0.14_258)]" },
  closed: { label: "Closed", cls: "bg-secondary text-muted-foreground" },
};

export const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  high: { label: "High", cls: "text-[oklch(0.5_0.19_27)]" },
  medium: { label: "Medium", cls: "text-[oklch(0.52_0.14_70)]" },
  low: { label: "Low", cls: "text-muted-foreground" },
};