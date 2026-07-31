import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { label: string; avg: number; conversations: number };

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] shadow-lg">
      <div className="font-semibold">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-foreground tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendCharts({ data }: { data: Point[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-[12.5px] font-bold">Rating trend</h3>
        <p className="mt-0.5 text-[10.5px] text-muted-foreground">Daily average CSAT score</p>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="csatFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-soft, var(--color-border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="avg" name="Avg rating" stroke="var(--color-primary)" strokeWidth={2} fill="url(#csatFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-[12.5px] font-bold">Conversation volume</h3>
        <p className="mt-0.5 text-[10.5px] text-muted-foreground">Conversations started per day</p>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-soft, var(--color-border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-secondary)" }} />
              <Bar dataKey="conversations" name="Conversations" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}