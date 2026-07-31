import { Star } from "lucide-react";
import { PRIORITY_META, STATUS_META, type Conversation } from "./data";

export function ConversationsTable({ rows }: { rows: Conversation[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-[12.5px] font-bold">Rated conversations</h3>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">Most recent 40 conversations in the selected range</p>
        </div>
      </div>
      <div className="scrollbar-thin max-h-[460px] overflow-auto">
        <table className="w-full min-w-[840px] border-collapse text-[11.5px]">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border-soft text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 text-left font-semibold">Conversation</th>
              <th className="px-3 py-2 text-left font-semibold">Date</th>
              <th className="px-3 py-2 text-left font-semibold">Agent</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-left font-semibold">Priority</th>
              <th className="px-3 py-2 text-left font-semibold">Tags</th>
              <th className="px-3 py-2 text-right font-semibold">FRT</th>
              <th className="px-4 py-2 text-right font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => (
              <tr key={c.id} className={i % 2 ? "bg-secondary/30" : undefined}>
                <td className="px-4 py-2.5">
                  <div className="font-semibold">{c.visitor}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{c.id}</div>
                </td>
                <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{c.date}</td>
                <td className="px-3 py-2.5">{c.staff}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_META[c.status].cls}`}>{STATUS_META[c.status].label}</span>
                </td>
                <td className={`px-3 py-2.5 font-semibold ${PRIORITY_META[c.priority].cls}`}>{PRIORITY_META[c.priority].label}</td>
                <td className="px-3 py-2.5">
                  {c.tags.map((t) => (
                    <span key={t} className="mr-1 inline-flex rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{t}</span>
                  ))}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{c.firstResponseSec}s</td>
                <td className="px-4 py-2.5 text-right">
                  {c.rating === null ? (
                    <span className="text-[10.5px] text-muted-foreground">Not rated</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold tabular-nums">
                      <Star className="h-3 w-3 fill-[oklch(0.72_0.15_75)] text-[oklch(0.72_0.15_75)]" />{c.rating}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No conversations match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}