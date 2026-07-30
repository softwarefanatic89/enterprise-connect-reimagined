export type Reminder = {
  id: string;
  title: string;
  note?: string;
  type: "message-linked" | "personal" | "assigned";
  linkedMessage?: string;
  assignee?: { name: string; avatar: string };
  dueAt: Date;
  createdBy: "You" | string;
  status: "pending" | "completed";
  bucket: "overdue" | "today" | "upcoming";
};

function d(offsetHours: number) {
  const dt = new Date();
  dt.setHours(dt.getHours() + offsetHours);
  return dt;
}

export const teamMembers = [
  { id: "u1", name: "Ananya Rao", avatar: "👩‍💻" },
  { id: "u2", name: "Rahul Mehta", avatar: "🧑‍🔧" },
  { id: "u3", name: "Sara Khan", avatar: "👩‍🎨" },
  { id: "u4", name: "David Chen", avatar: "🧑‍💻" },
  { id: "u5", name: "Priya Nair", avatar: "👩‍🚀" },
];

export const initialReminders: Reminder[] = [
  {
    id: "r1", title: "Follow up on contract redline", note: "Legal flagged clause 4.2",
    type: "message-linked", linkedMessage: "\"Sending the revised MSA shortly…\"",
    dueAt: d(-5), createdBy: "You", status: "pending", bucket: "overdue",
  },
  {
    id: "r2", title: "Reply to Priya about deployment window",
    type: "personal", dueAt: d(-1), createdBy: "You", status: "pending", bucket: "overdue",
  },
  {
    id: "r3", title: "Prepare Q3 sprint demo deck", note: "Include churn metrics slide",
    type: "personal", dueAt: d(3), createdBy: "You", status: "pending", bucket: "today",
  },
  {
    id: "r4", title: "Push staging build & verify SSO", note: "Deadline: EOD",
    type: "assigned", assignee: { name: "Rahul Mehta", avatar: "🧑‍🔧" },
    dueAt: d(6), createdBy: "You", status: "pending", bucket: "today",
  },
  {
    id: "r5", title: "Review Ananya's onboarding flow PR",
    type: "message-linked", linkedMessage: "\"PR #482 is ready for review\"",
    dueAt: d(30), createdBy: "You", status: "pending", bucket: "upcoming",
  },
  {
    id: "r6", title: "Client renewal call — Acme Corp", note: "Send agenda 1 day prior",
    type: "assigned", assignee: { name: "Sara Khan", avatar: "👩‍🎨" },
    dueAt: d(72), createdBy: "You", status: "pending", bucket: "upcoming",
  },
];
