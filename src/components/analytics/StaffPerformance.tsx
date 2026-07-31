import { Star } from "lucide-react";

type Row = { staff: string; avatar: string; convs: number; ratings: number; avg: number; avgFrt: number };

export function StaffPerformance({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.convs));
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-[12.5px] font-bold">Staff performance</h3>
        <p className="mt-0.5 text-[10.5px] text-muted-foreground">Conversations handled, CSAT responses and average rating per agent</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[11.5px]">
          <thead>
            <tr className="border-b border-border-soft text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 text-left font-semibold">Agent</th>
              <th className="px-3 py-2 text-left font-semibold">Conversations</th>
              <th className="px-3 py-2 text-right font-semibold">Ratings</th>
              <th className="px-3 py-2 text-right font-semibold">Avg first response</th>
              <th className="px-4 py-2 text-right font-semibold">Avg rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.staff} className={i % 2 ? "bg-secondary/30" : undefined}>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[13px]">{r.avatar}</span>
                    {r.staff}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.convs / max) * 100}%` }} />
                    </span>
                    <span className="tabular-nums">{r.convs}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{r.ratings}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{Math.round(r.avgFrt)}s</td>
                <td className="px-4 py-2.5 text-right">
                  <span className="inline-flex items-center gap-1 font-bold tabular-nums">
                    <Star className="h-3 w-3 fill-[oklch(0.72_0.15_75)] text-[oklch(0.72_0.15_75)]" />
                    {r.avg ? r.avg.toFixed(2) : "—"}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No conversations match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}