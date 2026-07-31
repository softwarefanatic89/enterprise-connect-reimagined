import { MessageSquare, Star, Timer, Percent, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, value, sub, icon: Icon, delta,
}: { label: string; value: string; sub?: string; icon: LucideIcon; delta?: number }) {
  const Trend = delta === undefined ? null : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendCls = delta === undefined ? "" : delta > 0 ? "text-[oklch(0.5_0.15_155)]" : delta < 0 ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-muted-foreground"><Icon className="h-3.5 w-3.5" /></span>
      </div>
      <div className="mt-2 text-[24px] font-bold leading-none tracking-tight tabular-nums">{value}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
        {Trend && (
          <span className={`inline-flex items-center gap-0.5 font-semibold ${trendCls}`}>
            <Trend className="h-3 w-3" />{Math.abs(delta ?? 0).toFixed(1)}%
          </span>
        )}
        {sub}
      </div>
    </div>
  );
}

export function CsatOverview({
  total, avg, responsePct, avgFirstResponse, ratedPct, deltas,
}: {
  total: number; avg: number; responsePct: number; avgFirstResponse: number; ratedPct: number;
  deltas: { total: number; avg: number; response: number };
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Conversations" value={String(total)} sub="vs previous period" icon={MessageSquare} delta={deltas.total} />
      <StatCard label="Average rating" value={avg ? avg.toFixed(2) : "—"} sub={`${ratedPct.toFixed(0)}% rated`} icon={Star} delta={deltas.avg} />
      <StatCard label="Response rate" value={`${responsePct.toFixed(1)}%`} sub="replied under 5 min" icon={Percent} delta={deltas.response} />
      <StatCard label="Avg first response" value={`${Math.round(avgFirstResponse)}s`} sub="across all conversations" icon={Timer} />
    </div>
  );
}