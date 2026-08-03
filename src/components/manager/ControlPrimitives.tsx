import { useEffect, useRef, useState } from "react";
import {
  Boxes, ShieldCheck, Activity, CircleDot, Clock, GitBranch, Link2,
} from "lucide-react";

/* ─────────── Animated counter ─────────── */

export function AnimatedNumber({ value, duration = 900 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value, duration]);
  return <>{n}</>;
}

/* ─────────── Progress ring ─────────── */

export function ProgressRing({
  value, size = 34, stroke = 4, tone = "indigo",
}: {
  value: number; size?: number; stroke?: number;
  tone?: "indigo" | "emerald" | "amber" | "slate";
}) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setP(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color =
    tone === "emerald" ? "oklch(0.62 0.16 155)"
    : tone === "amber" ? "oklch(0.72 0.16 75)"
    : tone === "slate" ? "oklch(0.62 0.02 260)"
    : "oklch(0.55 0.16 265)";
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.93 0.01 255)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c}
        strokeDashoffset={c - (c * Math.min(100, Math.max(0, p))) / 100}
        style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}

/* ─────────── Activity timeline ─────────── */

type TimelineTone = "indigo" | "emerald" | "amber" | "slate";

const TIMELINE: { title: string; meta: string; time: string; tone: TimelineTone }[] = [
  { title: "Security policy revision published", meta: "Governance · Security Policy", time: "2m ago", tone: "emerald" },
  { title: "Retention window changed to 7 years", meta: "Governance · Retention Policy", time: "18m ago", tone: "indigo" },
  { title: "Escalation rule awaiting approval", meta: "Workflow · Escalation Rules", time: "1h ago", tone: "amber" },
  { title: "Module registry synchronised", meta: "Workspace · Module Mapping", time: "3h ago", tone: "slate" },
  { title: "Role access matrix reviewed", meta: "Governance · Role Access Matrix", time: "Yesterday", tone: "indigo" },
];

const dotCls: Record<TimelineTone, string> = {
  indigo: "bg-[oklch(0.55_0.16_265)] ring-[oklch(0.9_0.06_265)]",
  emerald: "bg-[oklch(0.62_0.16_155)] ring-[oklch(0.9_0.08_155)]",
  amber: "bg-[oklch(0.72_0.16_75)] ring-[oklch(0.93_0.08_85)]",
  slate: "bg-[oklch(0.62_0.02_260)] ring-[oklch(0.93_0.01_255)]",
};

export function ActivityTimeline() {
  return (
    <section className="rounded-2xl border border-[oklch(0.92_0.01_255)] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6">
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <Activity className="h-4 w-4 text-[oklch(0.55_0.16_265)]" />
        <h3 className="text-[13.5px] font-bold tracking-tight text-[oklch(0.18_0.03_260)]">Recent Activity</h3>
        <span className="rounded-full border border-[oklch(0.92_0.01_255)] bg-[oklch(0.98_0.005_255)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.5_0.02_260)]">
          Control-plane changes
        </span>
        <button className="ml-auto text-[11px] font-semibold text-[oklch(0.5_0.16_265)] transition-colors hover:text-[oklch(0.4_0.16_268)]">
          View full audit trail
        </button>
      </header>
      <ol className="relative space-y-3 pl-5 before:absolute before:left-[5px] before:top-1.5 before:bottom-2 before:w-px before:bg-[oklch(0.93_0.01_255)]">
        {TIMELINE.map((t) => (
          <li key={t.title} className="group relative">
            <span className={`absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full ring-4 transition-transform group-hover:scale-125 ${dotCls[t.tone]}`} />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg px-2 py-1 transition-colors hover:bg-[oklch(0.98_0.005_255)]">
              <span className="text-[12.5px] font-semibold text-[oklch(0.22_0.03_260)]">{t.title}</span>
              <span className="text-[11px] text-[oklch(0.55_0.02_260)]">{t.meta}</span>
              <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10.5px] text-[oklch(0.58_0.02_260)]">
                <Clock className="h-2.5 w-2.5" /> {t.time}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ─────────── Module control grid ─────────── */

const MODULES: {
  name: string; code: string; desc: string; status: "Enabled" | "Restricted" | "Disabled";
  visibility: string; roles: number; linked: string[]; health: number; updated: string;
}[] = [
  { name: "Asset Management", code: "AMS", desc: "Conversations spawned from asset tickets and inspections.", status: "Enabled", visibility: "All departments", roles: 6, linked: ["Projects", "Support"], health: 98, updated: "2h ago" },
  { name: "Projects", code: "PRJ", desc: "Project rooms, milestone threads and delivery escalations.", status: "Enabled", visibility: "Delivery + Leads", roles: 5, linked: ["AMS", "Accounts"], health: 96, updated: "5h ago" },
  { name: "Support Desk", code: "SUP", desc: "Customer support conversations with SLA routing.", status: "Enabled", visibility: "Support only", roles: 4, linked: ["AMS"], health: 92, updated: "1d ago" },
  { name: "Sales", code: "SLS", desc: "Pre-sales threads, quotations and client handover.", status: "Restricted", visibility: "Sales leads", roles: 3, linked: ["Accounts"], health: 88, updated: "2d ago" },
  { name: "Accounts", code: "ACC", desc: "Billing clarifications and finance approvals.", status: "Restricted", visibility: "Finance only", roles: 2, linked: ["Projects", "Sales"], health: 90, updated: "3d ago" },
  { name: "Development", code: "DEV", desc: "Engineering rooms, incident bridges and code reviews.", status: "Enabled", visibility: "Engineering", roles: 5, linked: ["Projects"], health: 94, updated: "6h ago" },
];

const statusCls: Record<string, string> = {
  Enabled: "border-[oklch(0.85_0.1_155)] bg-[oklch(0.97_0.04_155)] text-[oklch(0.42_0.15_155)]",
  Restricted: "border-[oklch(0.9_0.08_85)] bg-[oklch(0.98_0.04_85)] text-[oklch(0.5_0.14_75)]",
  Disabled: "border-[oklch(0.92_0.01_255)] bg-[oklch(0.97_0.01_255)] text-[oklch(0.5_0.02_260)]",
};

export function ModuleControlGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {MODULES.map((m) => (
        <article
          key={m.code}
          className="group rounded-2xl border border-[oklch(0.92_0.01_255)] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[oklch(0.86_0.05_265)] hover:shadow-[0_14px_30px_-18px_rgba(15,23,42,0.28)]"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[oklch(0.9_0.03_265)] bg-[oklch(0.97_0.02_265)] text-[oklch(0.45_0.16_265)]">
              <Boxes className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h4 className="truncate text-[13px] font-bold text-[oklch(0.18_0.03_260)]">{m.name}</h4>
                <span className="shrink-0 rounded-md bg-[oklch(0.97_0.01_255)] px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-[oklch(0.5_0.02_260)]">{m.code}</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-[oklch(0.5_0.02_260)]">{m.desc}</p>
            </div>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusCls[m.status]}`}>{m.status}</span>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[oklch(0.95_0.01_255)] pt-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-[oklch(0.5_0.02_260)]">
              <ShieldCheck className="h-3 w-3" /> <dt className="sr-only">Visibility</dt>
              <dd className="truncate text-[oklch(0.3_0.03_260)]">{m.visibility}</dd>
            </div>
            <div className="flex items-center gap-1.5 text-[oklch(0.5_0.02_260)]">
              <CircleDot className="h-3 w-3" /> <dt className="sr-only">Assigned roles</dt>
              <dd className="text-[oklch(0.3_0.03_260)]">{m.roles} roles assigned</dd>
            </div>
            <div className="flex items-center gap-1.5 text-[oklch(0.5_0.02_260)]">
              <GitBranch className="h-3 w-3" /> <dt className="sr-only">Dependencies</dt>
              <dd className="truncate text-[oklch(0.3_0.03_260)]">{m.linked.join(" · ")}</dd>
            </div>
            <div className="flex items-center gap-1.5 text-[oklch(0.5_0.02_260)]">
              <Clock className="h-3 w-3" /> <dt className="sr-only">Last updated</dt>
              <dd className="text-[oklch(0.3_0.03_260)]">Updated {m.updated}</dd>
            </div>
          </dl>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[oklch(0.95_0.01_255)]">
              <span
                className="block h-full rounded-full bg-[oklch(0.62_0.16_155)] transition-[width] duration-700"
                style={{ width: `${m.health}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-[10.5px] font-bold text-[oklch(0.42_0.15_155)]">{m.health}% health</span>
            <button className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[oklch(0.92_0.01_255)] px-2 py-1 text-[10.5px] font-semibold text-[oklch(0.35_0.03_260)] opacity-0 transition-all hover:bg-[oklch(0.97_0.01_255)] focus-visible:opacity-100 group-hover:opacity-100">
              <Link2 className="h-3 w-3" /> Configure
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
