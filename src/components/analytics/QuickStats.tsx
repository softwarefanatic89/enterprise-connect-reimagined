import { Star } from "lucide-react";

export type QuickStat = { label: string; total: number; avg: number; delta: number | null };

export function QuickStats({ stats }: { stats: QuickStat[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-[12.5px] font-bold">Quick stats</h3>
      <p className="mt-0.5 text-[10.5px] text-muted-foreground">Period-over-period comparison, independent of the filters above</p>
      <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border-soft bg-background p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="mt-1.5 text-[19px] font-bold leading-none tabular-nums">{s.total}</div>
            <div className="mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground">
              <Star className="h-2.5 w-2.5 fill-[oklch(0.72_0.15_75)] text-[oklch(0.72_0.15_75)]" />
              {s.avg ? s.avg.toFixed(2) : "—"}
              {s.delta !== null && (
                <span className={`ml-auto font-semibold ${s.delta >= 0 ? "text-[oklch(0.5_0.15_155)]" : "text-destructive"}`}>
                  {s.delta >= 0 ? "+" : ""}{s.delta.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}