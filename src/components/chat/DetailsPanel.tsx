import {
  ShieldCheck, Crown, Briefcase, Layers, FolderKanban, CircleDot,
  Flag, Clock, Target, Activity, AlertTriangle, TicketCheck,
  Code2, FlaskConical, Rocket, Headphones, Sparkles, Bot,
  Reply, Bookmark, Pin, Languages, Volume2, FilePlus2, ListPlus, Bell, ArrowUpRight,
  Hourglass, CreditCard, CheckCircle2, GitBranch, Wand2,
  MessageSquareQuote, Lightbulb, StickyNote, BookOpen, Link2,
  ChevronRight, Radio, Command, Loader2, RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import type { Conversation } from "./data";

export function DetailsPanel({ chat: _chat, mobile = false }: { chat: Conversation; mobile?: boolean }) {
  // Escape blurs any focused control inside the panel and returns focus to the panel container.
  const asideRef = useRef<HTMLElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      const active = document.activeElement as HTMLElement | null;
      if (active && asideRef.current?.contains(active)) {
        active.blur();
        asideRef.current.focus();
        e.stopPropagation();
      }
    }
  };
  return (
    <aside
      ref={asideRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      aria-label="Live Enterprise Collaboration Center"
      className={`panel-dark scrollbar-thin h-full shrink-0 flex-col overflow-y-auto border-l border-sidebar-border animate-panel-in-right outline-none ${mobile ? "flex w-full" : "hidden w-[clamp(300px,19vw,340px)] xl:flex"}`}
    >
      <StickyIdentity />
      <div className="flex flex-col">
        <Stagger delay={0}><UserContext /></Stagger>
        <Stagger delay={40}><ProjectOverview /></Stagger>
        <Stagger delay={80}><AmsPanel /></Stagger>
        <Stagger delay={120}><TaskPanel /></Stagger>
        <Stagger delay={160}><LiveTeamStatus /></Stagger>
        <Stagger delay={200}><AiAssistant /></Stagger>
        <Stagger delay={240}><QuickActions /></Stagger>
        <Stagger delay={280}><WaitingCenter /></Stagger>
        <Stagger delay={320}><ActivityTimeline /></Stagger>
        <Stagger delay={360}><PinnedItems /></Stagger>
      </div>
      <div className="h-4" />
    </aside>
  );
}

function Stagger({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ───────── hook: simulated realtime sync tick ───────── */
function useLiveSync(intervalMs: number) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(Date.now());
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSyncing(true);
      const t = setTimeout(() => {
        setSyncing(false);
        setLastSync(Date.now());
        setTick((v) => v + 1);
      }, 700);
      return () => clearTimeout(t);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  const refresh = useCallback(() => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(Date.now());
      setTick((v) => v + 1);
    }, 500);
  }, []);
  return { syncing, lastSync, tick, refresh };
}

function relTime(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function LiveDot({ syncing }: { syncing: boolean }) {
  return (
    <span
      aria-live="polite"
      aria-label={syncing ? "Syncing" : "Live"}
      className="inline-flex items-center gap-1 rounded-full border border-sidebar-border bg-sidebar-surface px-1.5 py-0.5 text-[9.5px] font-semibold text-sidebar-muted"
    >
      {syncing ? (
        <Loader2 className="h-2.5 w-2.5 animate-spin text-gold" />
      ) : (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-[--color-success] opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[--color-success]" />
        </span>
      )}
      {syncing ? "SYNC" : "LIVE"}
    </span>
  );
}

/* ───────── roving focus helper ───────── */
function useRovingFocus(count: number, columns = 1) {
  const [idx, setIdx] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const focus = (i: number) => {
    const n = ((i % count) + count) % count;
    setIdx(n);
    refs.current[n]?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const k = e.key;
    if (k === "ArrowRight" || (columns === 1 && k === "ArrowDown")) { e.preventDefault(); focus(i + 1); }
    else if (k === "ArrowLeft" || (columns === 1 && k === "ArrowUp")) { e.preventDefault(); focus(i - 1); }
    else if (k === "ArrowDown" && columns > 1) { e.preventDefault(); focus(i + columns); }
    else if (k === "ArrowUp" && columns > 1) { e.preventDefault(); focus(i - columns); }
    else if (k === "Home") { e.preventDefault(); focus(0); }
    else if (k === "End") { e.preventDefault(); focus(count - 1); }
  };
  const setRef = (i: number) => (el: HTMLButtonElement | null) => { refs.current[i] = el; };
  return { idx, setRef, onKey };
}

/* ───────── STICKY IDENTITY ───────── */
function StickyIdentity() {
  return (
    <div className="sticky top-0 z-20 border-b border-sidebar-border bg-[color-mix(in_oklab,var(--color-sidebar)_92%,transparent)] px-4 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-gradient-gold text-[oklch(0.2_0.05_265)] shadow-[inset_0_1px_0_oklch(1_0_0/0.6)]">
          <Crown className="h-3.5 w-3.5" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[--color-success] ring-2 ring-sidebar" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-mono text-[11.5px] font-bold tracking-wide">BOSS-000001</span>
            <ShieldCheck className="h-3 w-3 text-[--color-success]" />
          </div>
          <div className="truncate font-mono text-[9.5px] text-sidebar-muted">DPT-LEAD · MOD-CHAT-CORE</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-sidebar-border bg-sidebar-surface px-1.5 py-0.5 text-[9.5px] font-semibold text-sidebar-muted">
          <Radio className="h-2.5 w-2.5 text-[--color-success]" /> LIVE
        </span>
      </div>
    </div>
  );
}

/* ───────── 1. USER CONTEXT ───────── */
function UserContext() {
  return (
    <Section label="User Context" icon={<Crown className="h-3 w-3" />} count="Boss">
      <div className="hover-lift sheen-on-hover relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[oklch(0.88_0.1_295)] to-[oklch(0.74_0.16_295)] p-4 text-[oklch(0.18_0.05_280)] shadow-[0_18px_40px_-14px_oklch(0.45_0.18_295/0.55),inset_0_1px_0_oklch(1_0_0/0.5)]">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="relative flex items-start gap-3">
          <div className="relative">
            <div className="avatar-3d grid h-12 w-12 place-items-center rounded-2xl bg-white/95 text-[22px]">
              <span className="emoji-3d emoji-xl">👑</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-[oklch(0.18_0.05_280)] text-[oklch(0.95_0.16_118)] shadow-[0_2px_6px_oklch(0.2_0.06_265/0.4)]">
              <ShieldCheck className="h-3 w-3" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-mono text-[12.5px] font-black tracking-wide tabular-nums">BOSS-000001</span>
              <span className="rounded-md bg-[oklch(0.18_0.05_280)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[oklch(0.95_0.16_118)]">Boss</span>
            </div>
            <div className="mt-0.5 font-mono text-[10.5px] opacity-75">DPT-LEAD · MOD-EXEC</div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[oklch(0.72_0.16_165)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.16_165)]" />
              </span>
              <span className="font-semibold">Online</span>
              <span className="opacity-70">· focus mode</span>
            </div>
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-white/40 p-2.5 text-[11px] backdrop-blur">
          <Meta icon={<Layers className="h-3 w-3" />} label="Module" value="MOD-CHAT-CORE" />
          <Meta icon={<FolderKanban className="h-3 w-3" />} label="Project" value="PRJ-ATLAS-23" />
        </div>
      </div>
    </Section>
  );
}

/* ───────── 2. PROJECT OVERVIEW ───────── */
function ProjectOverview() {
  const progress = 68;
  const spark = [0.35, 0.42, 0.4, 0.48, 0.55, 0.52, 0.58, 0.61, 0.6, 0.66, 0.7, 0.68];
  return (
    <Section label="Project Overview" icon={<FolderKanban className="h-3 w-3" />} count="Healthy">
      <div className="hover-lift rounded-2xl border border-sidebar-border bg-sidebar-surface p-3.5 transition-panel">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-mono text-[12.5px] font-bold tabular-nums">PRJ-ATLAS-23</div>
            <div className="truncate font-mono text-[10.5px] text-sidebar-muted">PROD-SV-WORKSPACE</div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[--color-success]/15 px-2 py-0.5 text-[10px] font-semibold text-[--color-success] ring-1 ring-[--color-success]/25">
            <CircleDot className="h-2.5 w-2.5" /> Healthy
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10.5px] text-sidebar-muted">
            <span>Stage · <span className="font-semibold text-foreground">QA Hardening</span></span>
            <span className="font-mono font-bold tabular-nums text-gold">{progress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sidebar-border">
            <div className="h-full rounded-full bg-gradient-gold shadow-[0_0_12px_oklch(0.88_0.18_118/0.5)] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <svg viewBox="0 0 120 24" className="mt-2 h-6 w-full">
            <defs>
              <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.88 0.18 118)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="oklch(0.88 0.18 118)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline points={spark.map((v, i) => `${(i / (spark.length - 1)) * 120},${24 - v * 22}`).join(" ")} fill="none" stroke="oklch(0.88 0.18 118)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points={`0,24 ${spark.map((v, i) => `${(i / (spark.length - 1)) * 120},${24 - v * 22}`).join(" ")} 120,24`} fill="url(#sparkFill)" />
          </svg>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 border-t border-sidebar-border pt-3 text-[11px]">
          <Meta icon={<Clock className="h-3 w-3" />} label="Deadline" value="28 Jun" />
          <Meta icon={<GitBranch className="h-3 w-3" />} label="Sprint" value="S-24" />
          <Meta icon={<Target className="h-3 w-3" />} label="Milestone" value="RC1" />
        </div>
      </div>
    </Section>
  );
}

/* ───────── 3. AMS PANEL ───────── */
function AmsPanel() {
  return (
    <Section label="AMS Panel" icon={<TicketCheck className="h-3 w-3" />} count="14 open">
      <div className="hover-lift rounded-2xl border border-sidebar-border bg-sidebar-surface p-3.5 transition-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold tabular-nums text-gold">AMS-002041</span>
            <span className="inline-flex items-center gap-0.5 rounded-md bg-[--color-destructive]/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[--color-destructive] ring-1 ring-[--color-destructive]/25">
              <Flag className="h-2.5 w-2.5" /> P1
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10.5px] text-sidebar-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-[--color-warning] animate-pulse" />
            In Progress
          </span>
        </div>
        <div className="mt-2 truncate text-[12.5px] font-semibold">Presence drift on long-lived sockets</div>
        <div className="mt-3 space-y-1.5 border-t border-sidebar-border pt-3 text-[11px]">
          <KV label="Developer" idCode="DEV-004521" tone="gold" icon="💻" />
          <KV label="QA" idCode="QA-001284" tone="sky" icon="🧪" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-sidebar-border pt-3 text-center">
          <Stat n="14" l="Open" />
          <Stat n="6" l="P1/P2" tone="warn" />
          <Stat n="3" l="Today" tone="gold" />
        </div>
      </div>
    </Section>
  );
}

/* ───────── 4. TASK PANEL ───────── */
function TaskPanel() {
  return (
    <Section label="Task Panel" icon={<ListPlus className="h-3 w-3" />} count="8 pending">
      <div className="hover-lift sheen-on-hover relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[oklch(0.95_0.16_118)] to-[oklch(0.82_0.2_115)] p-4 text-[oklch(0.2_0.06_265)] shadow-[0_18px_40px_-14px_oklch(0.6_0.18_118/0.55),inset_0_1px_0_oklch(1_0_0/0.5)]">
        <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <div className="relative flex items-center gap-2">
          <span className="avatar-3d grid h-8 w-8 place-items-center rounded-xl bg-[oklch(0.18_0.05_280)] text-[oklch(0.95_0.16_118)]">
            <Activity className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] opacity-75">Current Task</div>
            <div className="truncate text-[13px] font-bold">Wire reaction picker to bubble menu</div>
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-3 gap-2">
          <LimeStat n="8" l="Pending" />
          <LimeStat n="23" l="Done" />
          <LimeStat n="2" l="Due today" />
        </div>
        <button className="group relative mt-3 flex w-full items-center gap-2 rounded-2xl bg-[oklch(0.18_0.05_280)] px-3 py-2 text-[oklch(0.95_0.16_118)] transition hover:bg-[oklch(0.22_0.06_280)]">
          <Target className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold">RC1 Code Freeze · 3d</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[oklch(0.95_0.16_118)] px-2 py-0.5 text-[10px] font-bold text-[oklch(0.2_0.06_265)] transition group-hover:translate-x-0.5">
            View <ChevronRight className="h-2.5 w-2.5" />
          </span>
        </button>
      </div>
    </Section>
  );
}

function LimeStat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl bg-white/55 py-2 text-center shadow-[inset_0_1px_0_oklch(1_0_0/0.6)] backdrop-blur transition hover:bg-white/70">
      <div className="text-[18px] font-black leading-none tabular-nums">{n}</div>
      <div className="mt-0.5 text-[9.5px] font-bold uppercase tracking-wider opacity-75">{l}</div>
    </div>
  );
}

/* ───────── 5. LIVE TEAM STATUS (realtime) ───────── */
function LiveTeamStatus() {
  const { syncing, lastSync, tick, refresh } = useLiveSync(9000);
  const baseRows = [
    { icon: <Code2 className="h-3.5 w-3.5" />, label: "Developer", state: "Coding", tone: "gold", who: "4 active" },
    { icon: <FlaskConical className="h-3.5 w-3.5" />, label: "QA", state: "Testing", tone: "success", who: "2 active" },
    { icon: <Rocket className="h-3.5 w-3.5" />, label: "Deployment", state: "Running", tone: "warn", who: "stg-04" },
    { icon: <Headphones className="h-3.5 w-3.5" />, label: "Support", state: "Active", tone: "success", who: "3 chats" },
    { icon: <Crown className="h-3.5 w-3.5" />, label: "Boss", state: "Reviewing", tone: "gold", who: "AMS-2041" },
    { icon: <Bot className="h-3.5 w-3.5" />, label: "AI", state: "Processing", tone: "info", who: "2 jobs" },
  ];
  // subtle count drift per tick for realtime feel
  const rows = baseRows.map((r, i) => (i === (tick % baseRows.length) ? { ...r, who: `${r.who} ·` } : r));
  return (
    <Section
      label="Live Team Status"
      icon={<Activity className="h-3 w-3" />}
      right={<LiveDot syncing={syncing} />}
      onRefresh={refresh}
      lastSync={lastSync}
    >
      <div className={`overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar-surface transition-opacity ${syncing ? "opacity-70" : "opacity-100"}`}>
        {rows.map((r, i) => (
          <div key={r.label} className={`group flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-sidebar-surface-hover ${i !== rows.length - 1 ? "border-b border-sidebar-border" : ""}`}>
            <span className={`grid h-7 w-7 place-items-center rounded-lg transition-transform group-hover:scale-105 ${toneBg(r.tone)}`}>{r.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold">{r.label}</div>
              <div className="text-[10.5px] text-sidebar-muted">{r.who}</div>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold ${toneText(r.tone)}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${toneDot(r.tone)} animate-pulse`} />
              {r.state}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ───────── 6. AI ASSISTANT ───────── */
function AiAssistant() {
  return (
    <Section label="AI Assistant" icon={<Sparkles className="h-3 w-3" />} accent count="94% conf.">
      <div className="hover-lift space-y-2.5 rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] via-gold/[0.03] to-transparent p-3.5 shadow-[inset_0_1px_0_oklch(1_0_0/0.05)]">
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-gold/90">Confidence</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-sidebar-border">
            <div className="h-full rounded-full bg-gradient-gold" style={{ width: "94%" }} />
          </div>
          <span className="font-mono text-[10.5px] font-bold tabular-nums text-gold">94%</span>
        </div>
        <AiRow icon={<MessageSquareQuote className="h-3 w-3" />} title="Summary">
          Team aligned on shipping presence fix in RC1. QA flagged 2 edge cases; deploy planned for tonight.
        </AiRow>
        <AiRow icon={<Reply className="h-3 w-3" />} title="Suggested Reply">
          "Approved — please tag me once staging is green and I'll sign off."
        </AiRow>
        <AiRow icon={<Lightbulb className="h-3 w-3" />} title="Important">
          AMS-2041 blocks RC1. Customer demo on Friday.
        </AiRow>
        <div className="flex items-center justify-between border-t border-gold/15 pt-2.5">
          <span className="text-[10.5px] text-sidebar-muted">3 related tasks · 1 meeting summary</span>
          <button className="inline-flex items-center gap-1 rounded-md bg-gold/15 px-2 py-1 text-[10.5px] font-semibold text-gold ring-1 ring-gold/25 transition hover:bg-gold/25 hover:shadow-[0_0_16px_oklch(0.88_0.18_118/0.35)]">
            <Wand2 className="h-3 w-3" /> Insights
          </button>
        </div>
      </div>
    </Section>
  );
}

/* ───────── 7. QUICK ACTIONS ───────── */
type QAItem = { i: React.ReactNode; l: string; k: string; tone?: "danger"; run: () => Promise<void> | void };

function runAction(label: string, opts?: { failRate?: number; description?: string }): Promise<void> {
  const failRate = opts?.failRate ?? 0.08;
  return new Promise((resolve, reject) => {
    const id = toast.loading(`${label}…`);
    setTimeout(() => {
      if (Math.random() < failRate) {
        toast.error(`${label} failed`, { id, description: "Please retry in a moment." });
        reject(new Error("action_failed"));
      } else {
        toast.success(`${label} · done`, { id, description: opts?.description });
        resolve();
      }
    }, 550 + Math.random() * 450);
  });
}

function QuickActions() {
  const items: QAItem[] = [
    { i: <Reply className="h-3.5 w-3.5" />, l: "Reply", k: "R", run: () => {
        const el = document.querySelector<HTMLElement>('[data-shortcut="composer"]');
        el?.focus();
        toast.success("Reply · focused composer");
      } },
    { i: <Bookmark className="h-3.5 w-3.5" />, l: "Bookmark", k: "B", run: () => runAction("Bookmark saved", { description: "Added to your Pinned Items." }) },
    { i: <Pin className="h-3.5 w-3.5" />, l: "Pin", k: "P", run: () => runAction("Pinned to channel") },
    { i: <Languages className="h-3.5 w-3.5" />, l: "Translate", k: "T", run: () => runAction("Translate", { description: "EN → ES · 1 message" }) },
    { i: <Volume2 className="h-3.5 w-3.5" />, l: "Listen", k: "L", run: () => runAction("TTS playback started") },
    { i: <TicketCheck className="h-3.5 w-3.5" />, l: "Create AMS", k: "A", run: () => runAction("AMS-002042 created", { description: "Assigned · DEV-004521 · P1" }) },
    { i: <FilePlus2 className="h-3.5 w-3.5" />, l: "New Task", k: "N", run: () => runAction("Task created", { description: "Added to TaskPanel · due today" }) },
    { i: <Bell className="h-3.5 w-3.5" />, l: "Notify", k: "M", run: () => runAction("Team notified", { description: "6 members pinged" }) },
    { i: <ArrowUpRight className="h-3.5 w-3.5" />, l: "Escalate", k: "E", tone: "danger", run: () => runAction("Escalated to BOSS-000001", { failRate: 0.15 }) },
  ];
  const { setRef, onKey } = useRovingFocus(items.length, 3);

  // Global letter hotkeys (only when panel is focused/hovered)
  useEffect(() => {
    const onDown = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      const it = items.find((x) => x.k.toLowerCase() === e.key.toLowerCase());
      if (it) { e.preventDefault(); it.run(); }
    };
    // Attach only when panel contains hovered/focused element
    return undefined;
    // Note: leaving disabled to avoid conflicting with global app shortcuts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Section label="Quick Actions" icon={<Wand2 className="h-3 w-3" />} count={<Command className="h-2.5 w-2.5" />}>
      <div role="toolbar" aria-label="Quick actions" className="grid grid-cols-3 gap-1.5">
        {items.map((it, i) => (
          <button
            key={it.l}
            ref={setRef(i)}
            tabIndex={i === 0 ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => { void it.run(); }}
            aria-label={`${it.l} (${it.k})`}
            title={`${it.l} · press ${it.k}`}
            className={`group relative flex flex-col items-center justify-center gap-1 rounded-xl border border-sidebar-border bg-sidebar-surface px-2 py-2.5 transition-all outline-none focus-visible:-translate-y-0.5 focus-visible:border-gold/60 focus-visible:ring-2 focus-visible:ring-gold/40 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-sidebar-surface-hover hover:shadow-[0_8px_20px_-10px_oklch(0.88_0.18_118/0.4)] ${
              it.tone === "danger" ? "hover:border-[--color-destructive]/50 focus-visible:border-[--color-destructive]/60 focus-visible:ring-[--color-destructive]/40 hover:shadow-[0_8px_20px_-10px_oklch(0.66_0.22_22/0.4)]" : ""
            }`}
          >
            <span className={`text-sidebar-muted transition group-hover:scale-110 group-hover:text-gold ${it.tone === "danger" ? "group-hover:text-[--color-destructive]" : ""}`}>
              {it.i}
            </span>
            <span className="text-[10.5px] font-medium">{it.l}</span>
            <kbd className="absolute right-1 top-1 rounded bg-sidebar px-1 text-[8.5px] font-mono font-bold text-sidebar-muted opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              {it.k}
            </kbd>
          </button>
        ))}
      </div>
    </Section>
  );
}

/* ───────── 8. WAITING CENTER (realtime + keyboard) ───────── */
function WaitingCenter() {
  const { syncing, lastSync, tick, refresh } = useLiveSync(11000);
  const base = [
    { icon: <Code2 className="h-3 w-3" />, label: "Developer", count: 3, age: "1h" },
    { icon: <FlaskConical className="h-3 w-3" />, label: "QA", count: 2, age: "20m" },
    { icon: <Crown className="h-3 w-3" />, label: "Boss", count: 1, age: "4h", hot: true },
    { icon: <Briefcase className="h-3 w-3" />, label: "Customer", count: 2, age: "2d", hot: true },
    { icon: <CreditCard className="h-3 w-3" />, label: "Payment", count: 1, age: "6h" },
    { icon: <CheckCircle2 className="h-3 w-3" />, label: "Approval", count: 4, age: "30m" },
    { icon: <Rocket className="h-3 w-3" />, label: "Deployment", count: 1, age: "12m" },
  ];
  const rows = base.map((r, i) => (i === tick % base.length ? { ...r, count: r.count + 1 } : r));
  const total = rows.reduce((a, r) => a + r.count, 0);
  const { setRef, onKey } = useRovingFocus(rows.length, 1);
  return (
    <Section
      label="Waiting Center"
      icon={<Hourglass className="h-3 w-3" />}
      count={`${total} items`}
      right={<LiveDot syncing={syncing} />}
      onRefresh={refresh}
      lastSync={lastSync}
    >
      <div role="list" aria-label="Waiting queues" className={`space-y-1 transition-opacity ${syncing ? "opacity-70" : "opacity-100"}`}>
        {rows.map((r, i) => (
          <button
            key={r.label}
            role="listitem"
            ref={setRef(i)}
            tabIndex={i === 0 ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => runAction(`Opened waiting · ${r.label}`, { description: `${r.count} pending · oldest ${r.age}` })}
            aria-label={`Waiting on ${r.label}, ${r.count} items, oldest ${r.age}`}
            className={`group flex w-full items-center gap-2.5 rounded-lg border bg-sidebar-surface px-2.5 py-1.5 transition-all outline-none focus-visible:-translate-y-px focus-visible:ring-2 focus-visible:ring-gold/40 hover:-translate-y-px hover:bg-sidebar-surface-hover ${
              r.hot ? "border-[--color-destructive]/30 focus-visible:ring-[--color-destructive]/40" : "border-sidebar-border"
            }`}
          >
            <span className={`grid h-6 w-6 place-items-center rounded-md transition-transform group-hover:scale-110 ${r.hot ? "bg-[--color-destructive]/15 text-[--color-destructive]" : "bg-sidebar text-sidebar-muted"}`}>
              {r.icon}
            </span>
            <span className="flex-1 truncate text-left text-[11.5px] font-medium">Waiting · {r.label}</span>
            <span className={`font-mono text-[10.5px] tabular-nums ${r.hot ? "text-[--color-destructive]" : "text-sidebar-muted"}`}>{r.age}</span>
            <span className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums ${r.hot ? "bg-[--color-destructive] text-white animate-unread-pulse" : "bg-gold/20 text-gold ring-1 ring-gold/30"}`}>
              {r.count}
            </span>
          </button>
        ))}
      </div>
    </Section>
  );
}

/* ───────── 9. ACTIVITY TIMELINE (realtime) ───────── */
function ActivityTimeline() {
  const { syncing, lastSync, tick, refresh } = useLiveSync(13000);
  const base = [
    { t: "2m", k: "Status", text: "AMS-002041 moved to QA Review", icon: <TicketCheck className="h-3 w-3" />, tone: "gold" },
    { t: "14m", k: "Deploy", text: "stg-04 deployment succeeded", icon: <Rocket className="h-3 w-3" />, tone: "success" },
    { t: "38m", k: "Project", text: "Sprint S-24 burn-down on track", icon: <Activity className="h-3 w-3" />, tone: "info" },
    { t: "1h", k: "AMS", text: "AMS-002039 closed by DEV-004521", icon: <CheckCircle2 className="h-3 w-3" />, tone: "success" },
    { t: "2h", k: "Alert", text: "Latency spike on edge node EDG-002", icon: <AlertTriangle className="h-3 w-3" />, tone: "warn" },
  ];
  // rotate a "just now" event in for real-time feel
  const injected = [
    { t: "now", k: "Live", text: "Heartbeat received · MOD-CHAT-CORE", icon: <Radio className="h-3 w-3" />, tone: "info" },
    { t: "now", k: "Live", text: "QA-001284 pushed trace RGN-441-b", icon: <FlaskConical className="h-3 w-3" />, tone: "success" },
    { t: "now", k: "Live", text: "BOSS-000001 opened AMS-002041", icon: <Crown className="h-3 w-3" />, tone: "gold" },
  ];
  const events = [injected[tick % injected.length], ...base];
  return (
    <Section
      label="Activity Timeline"
      icon={<Activity className="h-3 w-3" />}
      count={`${events.length} events`}
      right={<LiveDot syncing={syncing} />}
      onRefresh={refresh}
      lastSync={lastSync}
    >
      <div className={`relative space-y-2 pl-4 transition-opacity ${syncing ? "opacity-70" : "opacity-100"}`}>
        <span className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-transparent via-sidebar-border to-transparent" />
        {events.map((e, i) => (
          <div key={i} className="group relative animate-fade-in-up">
            <span className={`absolute -left-[13px] top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full ring-2 ring-sidebar transition-transform group-hover:scale-125 ${toneBg(e.tone)} ${toneText(e.tone)}`}>
              <span className="h-1 w-1 rounded-full bg-current" />
            </span>
            <div className="flex items-start gap-2 rounded-lg border border-sidebar-border bg-sidebar-surface px-2.5 py-1.5 transition-all hover:border-gold/30 hover:bg-sidebar-surface-hover">
              <span className={`mt-0.5 ${toneText(e.tone)}`}>{e.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] leading-snug">{e.text}</div>
                <div className="text-[10px] text-sidebar-muted">
                  <span className="font-semibold">{e.k}</span> · <span className="tabular-nums">{e.t}</span>{e.t !== "now" ? " ago" : ""}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ───────── 10. PINNED ITEMS ───────── */
function PinnedItems() {
  return (
    <Section label="Pinned Items" icon={<Pin className="h-3 w-3" />} count="5">
      <div className="space-y-1.5">
        <Pinned icon={<MessageSquareQuote className="h-3.5 w-3.5" />} title="Release checklist · RC1" meta="MSG-100007 · BOSS-000001" />
        <Pinned icon={<Bookmark className="h-3.5 w-3.5" />} title="Customer call notes" meta="bookmark · CUS-008742" />
        <Pinned icon={<StickyNote className="h-3.5 w-3.5" />} title="Hotfix protocol" meta="note · SOP-0014" />
        <Pinned icon={<BookOpen className="h-3.5 w-3.5" />} title="SOP — AMS escalation" meta="sop · v1.4" />
        <Pinned icon={<Link2 className="h-3.5 w-3.5" />} title="Atlas v2 — Roadmap" meta="ref · PRJ-ATLAS-23" />
      </div>
    </Section>
  );
}

/* ───────── primitives ───────── */

function Section({
  label, icon, accent, count, right, onRefresh, lastSync, children,
}: {
  label: string; icon?: React.ReactNode; accent?: boolean; count?: React.ReactNode;
  right?: React.ReactNode; onRefresh?: () => void; lastSync?: number;
  children: React.ReactNode;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!lastSync) return;
    const id = setInterval(() => force((v) => v + 1), 15000);
    return () => clearInterval(id);
  }, [lastSync]);
  return (
    <div className={`border-t border-sidebar-border px-4 py-3.5 ${accent ? "bg-[oklch(0.24_0.06_265)]/40" : ""}`}>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-muted">
          {icon && <span className="text-gold/80">{icon}</span>}
          {label}
        </span>
        {lastSync && (
          <span className="text-[9.5px] font-mono tabular-nums text-sidebar-muted/70" title={`Last sync ${new Date(lastSync).toLocaleTimeString()}`}>
            · {relTime(lastSync)}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          {count !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full border border-sidebar-border bg-sidebar-surface px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums text-sidebar-muted">
              {count}
            </span>
          )}
          {right}
          {onRefresh && (
            <button
              onClick={onRefresh}
              aria-label={`Refresh ${label}`}
              className="grid h-5 w-5 place-items-center rounded-md border border-sidebar-border bg-sidebar-surface text-sidebar-muted outline-none transition hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              <RefreshCw className="h-2.5 w-2.5" />
            </button>
          )}
        </span>
      </div>
      {children}
    </div>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gold/80">{icon}</span>
      <div className="min-w-0">
        <div className="text-[9.5px] uppercase tracking-wider text-sidebar-muted">{label}</div>
        <div className="truncate font-mono text-[11px] font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function KV({ label, idCode, tone, icon }: { label: string; idCode: string; tone: "gold" | "sky"; icon: string }) {
  const cls = tone === "sky"
    ? "bg-gradient-to-br from-sky-400 to-cyan-500 text-white"
    : "bg-gradient-gold text-[oklch(0.2_0.05_265)]";
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10.5px] uppercase tracking-wider text-sidebar-muted">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className={`avatar-3d grid h-5 w-5 place-items-center rounded-md text-[11px] ${cls}`}>{icon}</span>
        <span className="font-mono text-[11px] font-bold tabular-nums tracking-wide">{idCode}</span>
      </span>
    </div>
  );
}

function Stat({ n, l, tone }: { n: string; l: string; tone?: "success" | "warn" | "gold" }) {
  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar/40 py-1.5 text-center transition hover:border-gold/25 hover:bg-sidebar/60">
      <div className={`text-[15px] font-bold leading-none tabular-nums ${toneText(tone)}`}>{n}</div>
      <div className="mt-0.5 text-[9.5px] uppercase tracking-wider text-sidebar-muted">{l}</div>
    </div>
  );
}

function AiRow({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="group flex gap-2 rounded-lg p-1.5 -m-1.5 transition-colors hover:bg-gold/[0.04]">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-gold/15 text-gold ring-1 ring-gold/20">{icon}</span>
      <div className="min-w-0">
        <div className="text-[9.5px] font-bold uppercase tracking-wider text-gold/90">{title}</div>
        <div className="text-[11.5px] leading-snug">{children}</div>
      </div>
    </div>
  );
}

function Pinned({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
  return (
    <button className="group flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-surface px-2.5 py-2 text-left transition-all hover:-translate-y-px hover:border-gold/40 hover:bg-sidebar-surface-hover hover:shadow-[0_8px_20px_-10px_oklch(0.88_0.18_118/0.35)]">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold/15 text-gold ring-1 ring-gold/20 transition-transform group-hover:scale-110">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-semibold">{title}</div>
        <div className="truncate font-mono text-[10.5px] text-sidebar-muted">{meta}</div>
      </div>
      <ChevronRight className="h-3 w-3 text-sidebar-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
    </button>
  );
}

function toneText(t?: string) {
  switch (t) {
    case "gold": return "text-gold";
    case "success": return "text-[--color-success]";
    case "warn": return "text-[--color-warning]";
    case "info": return "text-sky-300";
    default: return "text-foreground";
  }
}
function toneBg(t?: string) {
  switch (t) {
    case "gold": return "bg-gold/15 text-gold";
    case "success": return "bg-[--color-success]/15 text-[--color-success]";
    case "warn": return "bg-[--color-warning]/15 text-[--color-warning]";
    case "info": return "bg-sky-400/15 text-sky-300";
    default: return "bg-sidebar text-sidebar-muted";
  }
}
function toneDot(t?: string) {
  switch (t) {
    case "gold": return "bg-gold";
    case "success": return "bg-[--color-success]";
    case "warn": return "bg-[--color-warning]";
    case "info": return "bg-sky-300";
    default: return "bg-sidebar-muted";
  }
}
