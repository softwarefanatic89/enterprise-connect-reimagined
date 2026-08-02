import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Home, BarChart3, ShieldAlert, Lock } from "lucide-react";
import { useAnalyticsAccess } from "@/lib/analytics-access";
import { conversations, daysAgo } from "@/components/analytics/data";
import { Filters, type FilterState } from "@/components/analytics/Filters";
import { CsatOverview } from "@/components/analytics/Overview";
import { RatingBreakdown } from "@/components/analytics/RatingBreakdown";
import { StaffPerformance } from "@/components/analytics/StaffPerformance";
import { TrendCharts } from "@/components/analytics/TrendChart";
import { QuickStats, type QuickStat } from "@/components/analytics/QuickStats";
import { ConversationsTable } from "@/components/analytics/ConversationsTable";
import { breakdown, byStaff, download, summarize, toCSV, toHTML, trend } from "@/components/analytics/metrics";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "CSAT & Analytics — Software Vala" },
      { name: "description", content: "Customer satisfaction analytics for Software Vala: rating breakdown, response rates, staff performance, trends and exportable conversation reports." },
      { property: "og:title", content: "CSAT & Analytics — Software Vala" },
      { property: "og:description", content: "Ratings, response rates, staff performance and exportable CSAT reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

const iso = (n: number) => daysAgo(n).toISOString().slice(0, 10);

const defaultFilters: FilterState = {
  preset: "30",
  from: iso(29),
  to: iso(0),
  staff: "all",
  status: "all",
  priority: "all",
  tag: "all",
};

function AnalyticsPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const { role, canView, canExport, canViewKpis, canViewBreakdown, canViewStaff } = useAnalyticsAccess();

  const window = useMemo(() => {
    if (filters.preset === "custom") return { from: filters.from, to: filters.to };
    const days = Number(filters.preset);
    return { from: iso(days - 1), to: iso(0) };
  }, [filters]);

  const spanDays = filters.preset === "custom" ? 30 : Number(filters.preset);

  const matchesDims = (c: (typeof conversations)[number]) =>
    (filters.staff === "all" || c.staff === filters.staff) &&
    (filters.status === "all" || c.status === filters.status) &&
    (filters.priority === "all" || c.priority === filters.priority) &&
    (filters.tag === "all" || c.tags.includes(filters.tag));

  const filtered = useMemo(
    () => conversations.filter((c) => c.date >= window.from && c.date <= window.to && matchesDims(c)),
    [window, filters],
  );

  const previous = useMemo(() => {
    const from = new Date(window.from);
    const to = new Date(window.to);
    const len = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    const prevTo = new Date(from); prevTo.setUTCDate(prevTo.getUTCDate() - 1);
    const prevFrom = new Date(prevTo); prevFrom.setUTCDate(prevFrom.getUTCDate() - (len - 1));
    const a = prevFrom.toISOString().slice(0, 10), b = prevTo.toISOString().slice(0, 10);
    return conversations.filter((c) => c.date >= a && c.date <= b && matchesDims(c));
  }, [window, filters]);

  const now = summarize(filtered);
  const then = summarize(previous);
  const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);

  const quick: QuickStat[] = useMemo(() => {
    const spans = [
      { label: "Today", days: 1 },
      { label: "Last 7 days", days: 7 },
      { label: "Last 30 days", days: 30 },
      { label: "Last 60 days", days: 60 },
    ];
    return spans.map(({ label, days }) => {
      const from = iso(days - 1);
      const list = conversations.filter((c) => c.date >= from && c.date <= iso(0));
      const prev = conversations.filter((c) => c.date >= iso(days * 2 - 1) && c.date < from);
      const s = summarize(list);
      return { label, total: s.total, avg: s.avg, delta: prev.length ? pct(list.length, prev.length) : null };
    });
  }, []);

  const exportName = `software-vala-csat_${window.from}_to_${window.to}`;

  return (
    <div className="animate-page-in flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[oklch(0.32_0.12_265)] to-[oklch(0.24_0.14_275)] text-[13px] font-black text-white">SV</div>
          <div className="flex items-center gap-1.5 text-[13px] font-semibold">
            Software Vala <ChevronRight className="h-3 w-3 text-muted-foreground" /> <span className="text-primary">CSAT &amp; Analytics</span>
          </div>
        </div>
        <Link to="/" className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold hover:bg-muted">
          <Home className="h-3.5 w-3.5" /> Hub
        </Link>
      </header>

      {!canView ? (
        <div className="grid min-h-0 flex-1 place-items-center px-6">
          <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h1 className="mt-3 text-[15px] font-bold tracking-tight">Analytics access restricted</h1>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Your role (<span className="font-semibold text-foreground">{role}</span>) is not permitted to view CSAT
              &amp; analytics data. An administrator can grant access in Chat Manager → Analytics Access.
            </p>
            <Link
              to="/chat-manager"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11.5px] font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Lock className="h-3.5 w-3.5" /> Request access
            </Link>
          </div>
        </div>
      ) : (
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-5 md:px-6">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><BarChart3 className="h-4.5 w-4.5" /></span>
            <div>
              <h1 className="text-[16px] font-bold leading-none tracking-tight">Customer satisfaction &amp; analytics</h1>
              <p className="mt-1 text-[11.5px] text-muted-foreground">Ratings, response performance and conversation reporting across the workspace</p>
            </div>
            <span className="ml-auto hidden items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground sm:inline-flex">
              <Lock className="h-3.5 w-3.5 text-primary" /> {role} · {canExport ? "view + export" : "view only"}
            </span>
          </div>

          <Filters
            value={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
            resultCount={filtered.length}
            canExport={canExport}
            onExportCsv={() => canExport && download(`${exportName}.csv`, toCSV(filtered), "text/csv")}
            onExportHtml={() => canExport && download(`${exportName}.html`, toHTML(filtered, "Software Vala — CSAT report"), "text/html")}
          />

          {canViewKpis ? (
            <CsatOverview
              total={now.total}
              avg={now.avg}
              responsePct={now.responsePct}
              avgFirstResponse={now.avgFirstResponse}
              ratedPct={now.ratedPct}
              deltas={{ total: pct(now.total, then.total), avg: pct(now.avg, then.avg), response: pct(now.responsePct, then.responsePct) }}
            />
          ) : (
            <RestrictedBlock label="KPI overview" />
          )}

          <TrendCharts data={trend(filtered, Math.min(60, Math.max(7, spanDays)))} />

          <div className="grid gap-3 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
            {canViewBreakdown ? (
              <RatingBreakdown rows={breakdown(filtered)} avg={now.avg} ratedCount={now.ratedCount} />
            ) : (
              <RestrictedBlock label="Rating breakdown" />
            )}
            {canViewStaff ? <StaffPerformance rows={byStaff(filtered)} /> : <RestrictedBlock label="Staff performance" />}
          </div>

          {canViewKpis && <QuickStats stats={quick} />}

          <ConversationsTable rows={[...filtered].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 40)} />
        </div>
      </div>
      )}
    </div>
  );
}

function RestrictedBlock({ label }: { label: string }) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6 text-center">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Lock className="h-4 w-4" />
      </span>
      <p className="text-[12px] font-semibold text-foreground">{label} restricted</p>
      <p className="text-[11px] text-muted-foreground">Your role does not have permission to view this section.</p>
    </div>
  );
}