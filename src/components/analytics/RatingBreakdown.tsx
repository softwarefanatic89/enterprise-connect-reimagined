import { Star } from "lucide-react";

export function RatingBreakdown({ rows, avg, ratedCount }: { rows: { star: number; count: number; pct: number }[]; avg: number; ratedCount: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-[12.5px] font-bold">Rating breakdown</h3>
      <p className="mt-0.5 text-[10.5px] text-muted-foreground">{ratedCount} CSAT responses in the selected range</p>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-[30px] font-bold leading-none tabular-nums">{avg ? avg.toFixed(2) : "—"}</span>
        <span className="mb-1 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(avg) ? "fill-[oklch(0.72_0.15_75)] text-[oklch(0.72_0.15_75)]" : "text-muted-foreground/40"}`} />
          ))}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.star} className="flex items-center gap-2.5">
            <span className="flex w-8 shrink-0 items-center gap-0.5 text-[11px] font-semibold tabular-nums">
              {r.star}<Star className="h-2.5 w-2.5 fill-current text-[oklch(0.72_0.15_75)]" />
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${r.pct}%` }} />
            </div>
            <span className="w-9 shrink-0 text-right text-[10.5px] tabular-nums text-muted-foreground">{r.pct.toFixed(0)}%</span>
            <span className="w-8 shrink-0 text-right text-[10.5px] tabular-nums font-semibold">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}