import { type Conversation, daysAgo } from "./data";

export type Range = { from: string; to: string };

export function inRange(c: Conversation, r: Range) {
  return c.date >= r.from && c.date <= r.to;
}

export function rangeOf(days: number): Range {
  return { from: daysAgo(days - 1).toISOString().slice(0, 10), to: daysAgo(0).toISOString().slice(0, 10) };
}

export function summarize(list: Conversation[]) {
  const rated = list.filter((c) => c.rating !== null);
  const avg = rated.length ? rated.reduce((s, c) => s + (c.rating ?? 0), 0) / rated.length : 0;
  const responded = list.filter((c) => c.firstResponseSec <= 300).length;
  return {
    total: list.length,
    ratedCount: rated.length,
    avg,
    responsePct: list.length ? (responded / list.length) * 100 : 0,
    ratedPct: list.length ? (rated.length / list.length) * 100 : 0,
    avgFirstResponse: list.length ? list.reduce((s, c) => s + c.firstResponseSec, 0) / list.length : 0,
  };
}

export function breakdown(list: Conversation[]) {
  const rated = list.filter((c) => c.rating !== null);
  return [5, 4, 3, 2, 1].map((star) => {
    const count = rated.filter((c) => c.rating === star).length;
    return { star, count, pct: rated.length ? (count / rated.length) * 100 : 0 };
  });
}

export function byStaff(list: Conversation[]) {
  const map = new Map<string, { staff: string; avatar: string; convs: number; ratings: number; sum: number; frt: number }>();
  for (const c of list) {
    const e = map.get(c.staff) ?? { staff: c.staff, avatar: c.staffAvatar, convs: 0, ratings: 0, sum: 0, frt: 0 };
    e.convs += 1;
    e.frt += c.firstResponseSec;
    if (c.rating !== null) {
      e.ratings += 1;
      e.sum += c.rating;
    }
    map.set(c.staff, e);
  }
  return [...map.values()]
    .map((e) => ({ ...e, avg: e.ratings ? e.sum / e.ratings : 0, avgFrt: e.convs ? e.frt / e.convs : 0 }))
    .sort((a, b) => b.avg - a.avg || b.convs - a.convs);
}

export function trend(list: Conversation[], buckets: number) {
  const days: { date: string; label: string; avg: number; conversations: number }[] = [];
  for (let i = buckets - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    const items = list.filter((c) => c.date === key);
    const rated = items.filter((c) => c.rating !== null);
    days.push({
      date: key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      avg: rated.length ? Number((rated.reduce((s, c) => s + (c.rating ?? 0), 0) / rated.length).toFixed(2)) : 0,
      conversations: items.length,
    });
  }
  return days;
}

export function toCSV(list: Conversation[]) {
  const head = ["Conversation ID", "Date", "Visitor", "Staff", "Status", "Priority", "Tags", "Rating", "Comment", "First response (s)", "Messages"];
  const rows = list.map((c) => [c.id, c.date, c.visitor, c.staff, c.status, c.priority, c.tags.join("|"), c.rating ?? "", c.comment, c.firstResponseSec, c.messages]);
  return [head, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function toHTML(list: Conversation[], title: string) {
  const rows = list
    .map(
      (c) =>
        `<tr><td>${c.id}</td><td>${c.date}</td><td>${c.visitor}</td><td>${c.staff}</td><td>${c.status}</td><td>${c.priority}</td><td>${c.tags.join(", ")}</td><td>${c.rating ?? "—"}</td><td>${c.comment}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui,sans-serif;padding:24px;color:#1a1f2e}h1{font-size:18px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #dde3ee;padding:6px 8px;text-align:left}th{background:#f6f8fc}</style></head><body><h1>${title}</h1><p>${list.length} conversations · exported ${new Date().toISOString()}</p><table><thead><tr><th>ID</th><th>Date</th><th>Visitor</th><th>Staff</th><th>Status</th><th>Priority</th><th>Tags</th><th>Rating</th><th>Comment</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}