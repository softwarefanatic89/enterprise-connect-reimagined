import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Settings, MessagesSquare, ScrollText, ShieldCheck, Timer, Gavel,
  Sparkles, Wand2, BellRing, Building2, Boxes, KeyRound, CheckCircle2,
  AlertTriangle, Tag as TagIcon, Bookmark, Flag, Cog, Archive, Megaphone,
  Radio, Search, BarChart3, Database, Brain, PlugZap, HardDrive, Activity,
  ShieldAlert, Home, ChevronRight, Users, FileLock2, Lock, ChevronDown,
  Command, Bell, HelpCircle, Sun, Languages, RefreshCw, Save, Undo2,
  RotateCcw, Eye, Download, Upload, GitCompare, History, Filter, Maximize2,
  MoreHorizontal, CircleDot, BookOpen, Zap, LayoutGrid, Wifi, Server,
  CornerDownLeft, Pin, PinOff, Clock, Info, TrendingUp, TrendingDown,
  ArrowUpRight, Check, X as XIcon, ShieldQuestion, CircleAlert, Layers,
  ThumbsUp, ThumbsDown, Sparkle,
} from "lucide-react";
import { AnalyticsAccessControl } from "@/components/analytics/AccessControl";
import { useAnalyticsAccess } from "@/lib/analytics-access";
import {
  AnimatedNumber, ProgressRing, ActivityTimeline, ModuleControlGrid,
} from "@/components/manager/ControlPrimitives";

function AnalyticsAccessNotice() {
  const { role, canView, canExport } = useAnalyticsAccess();
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-[11px]">
      <KeyRound className="h-3.5 w-3.5 text-primary" />
      <span className="font-semibold text-foreground">Your role: {role}</span>
      <span className="text-muted-foreground">
        {canView ? "Can view CSAT dashboard" : "No access to CSAT dashboard"} ·{" "}
        {canExport ? "Can export reports" : "Export disabled"}
      </span>
      <Link to="/analytics" className="ml-auto font-semibold text-primary hover:underline">
        Open CSAT &amp; Analytics
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/chat-manager")({
  head: () => ({
    meta: [
      { title: "Chat Manager — Software Vala" },
      { name: "description", content: "Enterprise Communication Control Center — policies, security, roles, audit and integrations for Software Vala." },
      { property: "og:title", content: "Chat Manager — Software Vala" },
      { property: "og:description", content: "Enterprise Communication Control Center for Software Vala." },
    ],
  }),
  component: ChatManagerPage,
});

type SectionId =
  | "workspace" | "conversations" | "message-policy" | "security-policy" | "retention"
  | "compliance" | "ai" | "smart-reply" | "notifications" | "departments" | "modules"
  | "roles" | "approvals" | "escalation" | "categories" | "tags" | "labels" | "priority"
  | "automation" | "archive" | "broadcast" | "announcement" | "audit" | "activity"
  | "storage" | "usage" | "search-index" | "ai-training" | "integrations" | "backup"
  | "system" | "permissions" | "analytics-access";

type NavItem = { id: SectionId; label: string; icon: typeof Settings; hint?: string };
type NavGroup = { label: string; icon: typeof Settings; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Workspace", icon: Building2,
    items: [
      { id: "workspace", label: "Workspace Configuration", icon: Building2, hint: "Identity, timezone, hours" },
      { id: "conversations", label: "Conversation Management", icon: MessagesSquare, hint: "Freeze · transfer · rebind" },
      { id: "departments", label: "Department Mapping", icon: Building2, hint: "Routing & ownership" },
      { id: "modules", label: "Module Mapping", icon: Boxes, hint: "AMS · Projects · Sales" },
    ],
  },
  {
    label: "Governance", icon: ShieldCheck,
    items: [
      { id: "message-policy", label: "Message Policy", icon: ScrollText, hint: "Immutability rules" },
      { id: "security-policy", label: "Security Policy", icon: ShieldCheck, hint: "E2E · device · session" },
      { id: "retention", label: "Retention Policy", icon: Timer, hint: "Retain forever" },
      { id: "compliance", label: "Compliance Rules", icon: Gavel, hint: "ISO · SOC · GDPR · DPDP" },
      { id: "roles", label: "Role Access Matrix", icon: KeyRound, hint: "Per-role capabilities" },
      { id: "permissions", label: "Permission Matrix", icon: FileLock2, hint: "Per-user overrides" },
      { id: "analytics-access", label: "Analytics Access", icon: BarChart3, hint: "Who can view & export CSAT" },
    ],
  },
  {
    label: "Workflow", icon: Cog,
    items: [
      { id: "approvals", label: "Approval Rules", icon: CheckCircle2, hint: "Who must approve" },
      { id: "escalation", label: "Escalation Rules", icon: AlertTriangle, hint: "Time-based SLAs" },
      { id: "categories", label: "Conversation Categories", icon: Bookmark },
      { id: "tags", label: "Tags", icon: TagIcon },
      { id: "labels", label: "Labels", icon: TagIcon },
      { id: "priority", label: "Priority Rules", icon: Flag },
      { id: "automation", label: "Automation Rules", icon: Cog, hint: "Trigger → condition → action" },
    ],
  },
  {
    label: "Communication", icon: Radio,
    items: [
      { id: "notifications", label: "Notification Rules", icon: BellRing },
      { id: "broadcast", label: "Broadcast Management", icon: Radio },
      { id: "announcement", label: "Announcement Management", icon: Megaphone },
      { id: "archive", label: "Archive Management", icon: Archive },
    ],
  },
  {
    label: "Intelligence", icon: Sparkles,
    items: [
      { id: "ai", label: "AI Configuration", icon: Sparkles },
      { id: "smart-reply", label: "Smart Reply Configuration", icon: Wand2 },
      { id: "ai-training", label: "AI Training Control", icon: Brain },
      { id: "search-index", label: "Search Index Management", icon: Search },
    ],
  },
  {
    label: "Operations", icon: Activity,
    items: [
      { id: "audit", label: "Audit Center", icon: ShieldAlert },
      { id: "activity", label: "Activity Logs", icon: Activity },
      { id: "storage", label: "Storage Overview", icon: HardDrive },
      { id: "usage", label: "Usage Analytics", icon: BarChart3 },
      { id: "integrations", label: "Integration Settings", icon: PlugZap },
      { id: "backup", label: "Backup Status", icon: Database },
      { id: "system", label: "System Health", icon: Activity },
    ],
  },
];

const ALL_ITEMS = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));

function ChatManagerPage() {
  const [active, setActive] = useState<SectionId>("workspace");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [recent, setRecent] = useLocalList("cm.recent", ["security-policy", "roles"]);
  const [pinned, setPinned] = useLocalList("cm.pinned", ["message-policy", "audit"]);
  const activeItem = ALL_ITEMS.find((i) => i.id === active)!;
  const activeGroup = NAV.find((g) => g.items.some((i) => i.id === active))!;

  const selectSection = (id: SectionId) => {
    setActive(id);
    setRecent([id, ...recent.filter((r) => r !== id)].slice(0, 5));
  };
  const togglePin = (id: string) => {
    setPinned(pinned.includes(id) ? pinned.filter((p) => p !== id) : [id, ...pinned].slice(0, 6));
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[oklch(0.985_0.005_255)] text-[oklch(0.22_0.03_260)]">
      <GlobalHeader onOpenPalette={() => setPaletteOpen(true)} />
      <MegaNav
        active={active}
        activeGroup={activeGroup.label}
        onSelect={selectSection}
        recent={recent}
        pinned={pinned}
        onTogglePin={togglePin}
      />
      <Breadcrumb group={activeGroup.label} label={activeItem.label} />

      <div className="scrollbar-thin flex min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-4 py-5 md:px-6 md:py-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-5">
            <PageHeader item={activeItem} group={activeGroup.label} />
            <KpiRow id={active} />
            <QuickActions />
            <div key={active} className="min-w-0 animate-fade-in rounded-2xl border border-[oklch(0.92_0.01_255)] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] md:p-6">
              <SectionRenderer id={active} />
            </div>
            <ActivityTimeline />
          </div>
          <ContextPanel item={activeItem} />
        </div>
      </div>

      <BottomStatusBar item={activeItem} group={activeGroup.label} onOpenPalette={() => setPaletteOpen(true)} />
      {paletteOpen && (
        <CommandPalette
          active={active}
          recent={recent}
          pinned={pinned}
          onTogglePin={togglePin}
          onClose={() => setPaletteOpen(false)}
          onSelect={(id: SectionId) => { selectSection(id); setPaletteOpen(false); }}
        />
      )}
    </div>
  );
}

/* ─────────── Global Header ─────────── */

function GlobalHeader({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-[oklch(0.92_0.01_255)] bg-white/95 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.32_0.12_265)] to-[oklch(0.24_0.14_275)] font-black text-white shadow-[0_4px_12px_-2px_oklch(0.32_0.12_265/0.4)]">
          SV
        </div>
        <div className="hidden flex-col leading-tight md:flex">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold tracking-tight">Software Vala</span>
            <ChevronRight className="h-3 w-3 text-[oklch(0.6_0.02_260)]" />
            <span className="text-[13px] font-semibold text-[oklch(0.42_0.14_265)]">Chat Manager</span>
          </div>
          <span className="font-mono text-[10px] text-[oklch(0.55_0.02_260)]">Enterprise Control Center · WS-SV-PRIME</span>
        </div>
        <span className="ml-2 hidden items-center gap-1 rounded-full border border-[oklch(0.85_0.14_155)] bg-[oklch(0.96_0.05_155)] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[oklch(0.42_0.15_155)] lg:inline-flex">
          <CircleDot className="h-2.5 w-2.5" /> Production
        </span>
        <PermissionBadge role="Workspace Owner" compact />

      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Open command palette"
          className="relative hidden h-9 w-[280px] items-center rounded-xl border border-[oklch(0.92_0.01_255)] bg-[oklch(0.985_0.005_255)] pl-9 pr-16 text-left text-[12px] text-[oklch(0.55_0.02_260)] outline-none transition-all hover:border-[oklch(0.85_0.05_265)] hover:bg-white focus-visible:border-[oklch(0.55_0.16_265)] focus-visible:ring-4 focus-visible:ring-[oklch(0.55_0.16_265)]/15 md:flex xl:w-[340px]"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[oklch(0.55_0.02_260)]" />
          Search policies, rules, users, modules…
          <kbd className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-[oklch(0.9_0.01_255)] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[oklch(0.55_0.02_260)]">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>

        <GhostIcon label="AI Assistant" tone="accent"><Sparkles className="h-4 w-4" /></GhostIcon>
        <GhostIcon label="Sync status"><RefreshCw className="h-4 w-4" /></GhostIcon>
        <GhostIcon label="Notifications" badge="3"><Bell className="h-4 w-4" /></GhostIcon>
        <GhostIcon label="Help"><HelpCircle className="h-4 w-4" /></GhostIcon>
        <GhostIcon label="Language"><Languages className="h-4 w-4" /></GhostIcon>
        <GhostIcon label="Theme"><Sun className="h-4 w-4" /></GhostIcon>

        <div className="mx-1 hidden h-6 w-px bg-[oklch(0.92_0.01_255)] sm:block" />

        <div className="hidden items-center gap-2 rounded-xl border border-[oklch(0.92_0.01_255)] bg-white py-1 pl-1 pr-2.5 sm:flex">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[oklch(0.85_0.12_85)] to-[oklch(0.75_0.16_75)] text-[13px]">
            👑
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-[11px] font-bold">BOSS-000001</span>
            <span className="text-[9.5px] text-[oklch(0.55_0.02_260)]">Workspace Owner</span>
          </div>
        </div>

        <Link
          to="/"
          title="Return to Communication Hub"
          className="ml-1 hidden items-center gap-1.5 rounded-lg border border-[oklch(0.92_0.01_255)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[oklch(0.35_0.03_260)] transition-all hover:bg-[oklch(0.97_0.01_255)] md:inline-flex"
        >
          <Home className="h-3.5 w-3.5" /> Hub
        </Link>
      </div>
    </header>
  );
}

function GhostIcon({
  children, label, badge, tone,
}: { children: React.ReactNode; label: string; badge?: string; tone?: "accent" }) {
  return (
    <button
      title={label}
      aria-label={label}
      className={`relative grid h-9 w-9 place-items-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40 active:scale-95 ${
        tone === "accent"
          ? "text-[oklch(0.42_0.14_265)] hover:bg-[oklch(0.95_0.03_265)]"
          : "text-[oklch(0.4_0.02_260)] hover:bg-[oklch(0.96_0.01_255)] hover:text-[oklch(0.2_0.03_260)]"
      }`}
    >
      {children}
      {badge && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-[oklch(0.6_0.2_25)] px-1 text-[9px] font-bold text-white ring-2 ring-white">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─────────── Permission Badge (hover tooltip) ─────────── */

const ROLE_PERMISSIONS: Record<string, {
  scope: string;
  color: "emerald" | "indigo" | "amber" | "slate";
  allow: string[];
  deny: string[];
}> = {
  "Workspace Owner": {
    scope: "Full sovereign access · WS-SV-PRIME",
    color: "indigo",
    allow: [
      "Manage every Chat Manager policy & role",
      "Approve compliance & retention overrides",
      "Rotate keys, revoke devices, seal audits",
      "Publish workspace-wide broadcasts",
    ],
    deny: [
      "Cannot delete immutable message records",
      "Cannot bypass legal-hold once activated",
    ],
  },
  Admin: {
    scope: "Chat Manager · Governance · Workflow",
    color: "indigo",
    allow: [
      "Configure policies, roles, integrations",
      "Freeze / transfer / rebind conversations",
      "Post announcements & broadcasts",
    ],
    deny: [
      "Cannot alter Workspace Identity",
      "Cannot approve legal-hold releases",
    ],
  },
  Manager: {
    scope: "Department · Team routing",
    color: "emerald",
    allow: ["Route conversations", "Approve escalations", "Pin & label"],
    deny: ["Cannot manage security or audit", "Cannot alter roles"],
  },
};

function PermissionBadge({ role, compact }: { role: string; compact?: boolean }) {
  const perm = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS["Admin"];
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const toneCls = {
    amber: "border-[oklch(0.88_0.12_85)] bg-[oklch(0.98_0.06_85)] text-[oklch(0.48_0.14_75)]",
    indigo: "border-[oklch(0.85_0.08_255)] bg-[oklch(0.96_0.02_255)] text-[oklch(0.36_0.13_265)]",
    emerald: "border-[oklch(0.85_0.14_155)] bg-[oklch(0.97_0.05_155)] text-[oklch(0.4_0.15_155)]",
    slate: "border-[oklch(0.9_0.01_255)] bg-[oklch(0.97_0.01_255)] text-[oklch(0.4_0.02_260)]",
  }[perm.color];

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); wrapRef.current?.querySelector("button")?.focus(); }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className={`relative ${compact ? "hidden lg:inline-flex" : "inline-flex"}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={tooltipId}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={`${role} permissions. Press Enter or Space to view allowed and restricted actions.`}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); }
          if ((e.key === "Enter" || e.key === " ") && !open) { e.preventDefault(); setOpen(true); }
        }}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40 ${toneCls}`}
      >
        <ShieldCheck className="h-2.5 w-2.5" aria-hidden="true" /> {role}
        <Info className="h-2.5 w-2.5 opacity-70" aria-hidden="true" />
      </button>
      {open && (
        <div
          id={tooltipId}
          role="tooltip"
          tabIndex={-1}
          aria-live="polite"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] animate-fade-in rounded-xl border border-[oklch(0.9_0.01_255)] bg-white p-3 text-left shadow-[0_20px_60px_-20px_rgba(15,23,42,0.28)]"
        >
          <div className="flex items-start gap-2 border-b border-[oklch(0.95_0.005_255)] pb-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[oklch(0.96_0.03_265)] text-[oklch(0.4_0.14_265)]" aria-hidden="true">
              <ShieldQuestion className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-[oklch(0.2_0.03_260)]">{role}</div>
              <div className="mt-0.5 truncate text-[10.5px] text-[oklch(0.55_0.02_260)]">{perm.scope}</div>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <div role="group" aria-labelledby={`${tooltipId}-allow`}>
              <div id={`${tooltipId}-allow`} className="mb-1 flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-[oklch(0.42_0.15_155)]">
                <Check className="h-2.5 w-2.5" aria-hidden="true" /> Allowed
              </div>
              <ul className="space-y-0.5">
                {perm.allow.map((a) => (
                  <li key={a} className="flex items-start gap-1.5 text-[11px] text-[oklch(0.28_0.03_260)]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[oklch(0.55_0.15_155)]" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div role="group" aria-labelledby={`${tooltipId}-deny`}>
              <div id={`${tooltipId}-deny`} className="mb-1 flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-[oklch(0.55_0.18_25)]">
                <XIcon className="h-2.5 w-2.5" aria-hidden="true" /> Restricted
              </div>
              <ul className="space-y-0.5">
                {perm.deny.map((d) => (
                  <li key={d} className="flex items-start gap-1.5 text-[11px] text-[oklch(0.42_0.02_260)]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[oklch(0.65_0.16_25)]" aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[oklch(0.95_0.005_255)] pt-2 font-mono text-[10px] text-[oklch(0.55_0.02_260)]">
            <span>Policy v14.2.1 · Esc to close</span>
            <span className="inline-flex items-center gap-1"><Lock className="h-2.5 w-2.5" aria-hidden="true" /> Enforced</span>
          </div>
        </div>
      )}
    </span>
  );
}

/* ─────────── shared: fuzzy scoring + local list ─────────── */

function fuzzyScore(text: string, q: string): number {
  if (!q) return 1;
  const t = text.toLowerCase();
  const needle = q.toLowerCase();
  if (t.includes(needle)) return 100 - t.indexOf(needle);
  let ti = 0, ni = 0, score = 0, streak = 0;
  while (ti < t.length && ni < needle.length) {
    if (t[ti] === needle[ni]) { ni++; streak++; score += 2 + streak; }
    else { streak = 0; }
    ti++;
  }
  return ni === needle.length ? score : 0;
}

function useLocalList(key: string, initial: string[] = []): [string[], (v: string[]) => void] {
  const [list, setList] = useState<string[]>(() => {
    if (typeof window === "undefined") return initial;
    try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? initial; }
    catch { return initial; }
  });
  const set = (v: string[]) => {
    setList(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* noop */ }
  };
  return [list, set];
}

/* ─────────── Mega Nav ─────────── */

const SECTION_SHORTCUTS: Partial<Record<SectionId, string>> = {
  workspace: "G W",
  "message-policy": "G M",
  "security-policy": "G S",
  roles: "G R",
  audit: "G A",
  ai: "G I",
  notifications: "G N",
};

function MegaNav({
  active, activeGroup, onSelect, recent, pinned, onTogglePin,
}: {
  active: SectionId;
  activeGroup: string;
  onSelect: (id: SectionId) => void;
  recent: string[];
  pinned: string[];
  onTogglePin: (id: string) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const groupBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Reset focus and focus first item when a menu opens
  useEffect(() => {
    if (!open) return;
    setFocusIdx(0);
    const id = requestAnimationFrame(() => itemRefs.current[0]?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const recentItems = recent
    .map((id) => ALL_ITEMS.find((i) => i.id === id))
    .filter(Boolean) as typeof ALL_ITEMS;
  const pinnedItems = pinned
    .map((id) => ALL_ITEMS.find((i) => i.id === id))
    .filter(Boolean) as typeof ALL_ITEMS;

  const focusGroup = (dir: 1 | -1) => {
    const labels = NAV.map((g) => g.label);
    const cur = open ? labels.indexOf(open) : 0;
    const next = (cur + dir + labels.length) % labels.length;
    setOpen(labels[next]);
    groupBtnRefs.current[labels[next]]?.focus();
  };

  return (
    <div ref={rootRef} className="sticky top-14 z-30 border-b border-[oklch(0.92_0.01_255)] bg-white/95 backdrop-blur-xl">
      <div
        role="menubar"
        aria-label="Chat Manager sections"
        className="scrollbar-thin mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-2 md:px-4"
      >
        {NAV.map((g) => {
          const Icon = g.icon;
          const isActive = activeGroup === g.label;
          const isOpen = open === g.label;
          const menuId = `meganav-${g.label.replace(/\s+/g, "-").toLowerCase()}`;
          return (
            <div key={g.label} className="relative shrink-0">
              <button
                ref={(el) => { groupBtnRefs.current[g.label] = el; }}
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={menuId}
                onClick={() => setOpen(isOpen ? null : g.label)}
                onMouseEnter={() => open && setOpen(g.label)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") { e.preventDefault(); focusGroup(1); }
                  else if (e.key === "ArrowLeft") { e.preventDefault(); focusGroup(-1); }
                  else if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen(g.label);
                  } else if (e.key === "Escape") {
                    setOpen(null);
                  }
                }}
                className={`inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40 ${
                  isActive
                    ? "text-[oklch(0.32_0.14_265)]"
                    : "text-[oklch(0.4_0.02_260)] hover:text-[oklch(0.22_0.03_260)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {g.label}
                <ChevronDown className={`h-3 w-3 opacity-70 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                {isActive && (
                  <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-[oklch(0.5_0.18_265)] to-[oklch(0.42_0.14_275)]" aria-hidden="true" />
                )}
              </button>

              {isOpen && (
                <div
                  id={menuId}
                  role="menu"
                  aria-label={`${g.label} modules`}
                  onKeyDown={(e) => {
                    const items = g.items;
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setOpen(null);
                      groupBtnRefs.current[g.label]?.focus();
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setFocusIdx((i) => {
                        const n = Math.min(i + 1, items.length - 1);
                        itemRefs.current[n]?.focus();
                        return n;
                      });
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setFocusIdx((i) => {
                        const n = Math.max(i - 1, 0);
                        itemRefs.current[n]?.focus();
                        return n;
                      });
                    } else if (e.key === "Home") {
                      e.preventDefault();
                      setFocusIdx(0);
                      itemRefs.current[0]?.focus();
                    } else if (e.key === "End") {
                      e.preventDefault();
                      const n = items.length - 1;
                      setFocusIdx(n);
                      itemRefs.current[n]?.focus();
                    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      focusGroup(e.key === "ArrowRight" ? 1 : -1);
                    } else if (e.key.toLowerCase() === "p") {
                      const it = items[focusIdx];
                      if (it) { e.preventDefault(); onTogglePin(it.id); }
                    }
                  }}
                  className="absolute left-0 top-full z-40 mt-1 w-[min(94vw,760px)] animate-fade-in overflow-hidden rounded-2xl border border-[oklch(0.92_0.01_255)] bg-white shadow-[0_30px_80px_-24px_rgba(15,23,42,0.28)]"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 border-b border-[oklch(0.95_0.005_255)] bg-gradient-to-br from-[oklch(0.985_0.005_255)] to-white px-4 py-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[oklch(0.96_0.03_265)] to-[oklch(0.94_0.05_265)] text-[oklch(0.4_0.14_265)] ring-1 ring-[oklch(0.88_0.06_265)]" aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-[oklch(0.18_0.03_260)]">{g.label}</div>
                      <div className="text-[10.5px] text-[oklch(0.55_0.02_260)]">
                        {g.items.length} controls · Admin only · Enforced from Chat Manager
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.9_0.01_255)] bg-white px-2 py-0.5 font-mono text-[9.5px] text-[oklch(0.5_0.02_260)]">
                      <Command className="h-2.5 w-2.5" aria-hidden="true" /> K to search all
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-0 md:grid-cols-[minmax(0,1fr)_220px]">
                    {/* Modules grid */}
                    <div className="p-3">
                      <div className="mb-1.5 px-1 text-[9.5px] font-bold uppercase tracking-wider text-[oklch(0.55_0.02_260)]">Modules</div>
                      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                        {g.items.map((it, idx) => {
                          const IIcon = it.icon;
                          const isSel = active === it.id;
                          const isPinned = pinned.includes(it.id);
                          const isFocused = focusIdx === idx;
                          const sc = SECTION_SHORTCUTS[it.id];
                          return (
                            <div
                              key={it.id}
                              className={`group relative flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all ${
                                isFocused
                                  ? "bg-[oklch(0.96_0.03_265)] ring-1 ring-[oklch(0.55_0.16_265)]"
                                  : isSel
                                  ? "bg-[oklch(0.96_0.03_265)] ring-1 ring-[oklch(0.85_0.08_265)]"
                                  : "hover:bg-[oklch(0.97_0.01_255)]"
                              }`}
                            >
                              <button
                                ref={(el) => { itemRefs.current[idx] = el; }}
                                role="menuitem"
                                tabIndex={isFocused ? 0 : -1}
                                aria-current={isSel ? "page" : undefined}
                                aria-keyshortcuts={sc ? sc : undefined}
                                onFocus={() => setFocusIdx(idx)}
                                onClick={() => { onSelect(it.id); setOpen(null); }}
                                className="flex min-w-0 flex-1 items-start gap-2.5 text-left focus:outline-none"
                              >
                                <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                                  isSel ? "bg-white text-[oklch(0.4_0.14_265)] ring-1 ring-[oklch(0.85_0.08_265)]" : "bg-white text-[oklch(0.4_0.02_260)] ring-1 ring-[oklch(0.94_0.005_255)]"
                                }`} aria-hidden="true">
                                  <IIcon className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="truncate text-[12px] font-semibold text-[oklch(0.22_0.03_260)]">{it.label}</span>
                                    {isSel && <span className="rounded-full bg-[oklch(0.55_0.16_265)] px-1.5 py-0.5 text-[8.5px] font-bold uppercase text-white">Now</span>}
                                  </div>
                                  {it.hint && <div className="mt-0.5 truncate text-[10.5px] text-[oklch(0.55_0.02_260)]">{it.hint}</div>}
                                  {sc && (
                                    <div className="mt-1 flex items-center gap-1 font-mono text-[9.5px] text-[oklch(0.55_0.02_260)]" aria-hidden="true">
                                      {sc.split(" ").map((c, i) => (
                                        <kbd key={i} className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1 py-[1px] font-mono text-[9px] font-semibold text-[oklch(0.32_0.03_260)]">{c}</kbd>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onTogglePin(it.id); }}
                                tabIndex={-1}
                                title={isPinned ? "Unpin (P)" : "Pin to top (P)"}
                                aria-label={isPinned ? `Unpin ${it.label}` : `Pin ${it.label} to top`}
                                aria-pressed={isPinned}
                                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100 ${
                                  isPinned
                                    ? "!opacity-100 bg-[oklch(0.96_0.03_265)] text-[oklch(0.42_0.14_265)]"
                                    : "text-[oklch(0.55_0.02_260)] hover:bg-white hover:text-[oklch(0.32_0.14_265)]"
                                }`}
                              >
                                {isPinned ? <Pin className="h-3 w-3 fill-current" /> : <PinOff className="h-3 w-3" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent + Pinned rail */}
                    <div className="border-t border-[oklch(0.95_0.005_255)] bg-[oklch(0.985_0.005_255)] p-3 md:border-l md:border-t-0">
                      <div className="mb-1.5 flex items-center gap-1 px-1 text-[9.5px] font-bold uppercase tracking-wider text-[oklch(0.55_0.02_260)]">
                        <Pin className="h-2.5 w-2.5 fill-current text-[oklch(0.42_0.14_265)]" aria-hidden="true" /> Pinned
                      </div>
                      {pinnedItems.length === 0 ? (
                        <div className="mb-3 rounded-lg border border-dashed border-[oklch(0.9_0.01_255)] bg-white/60 px-2 py-2 text-[10.5px] text-[oklch(0.55_0.02_260)]">
                          Focus a module and press P to pin it here.
                        </div>
                      ) : (
                        <ul className="mb-3 flex flex-col gap-0.5">
                          {pinnedItems.map((it) => {
                            const IIcon = it.icon;
                            return (
                              <li key={it.id}>
                                <button
                                  onClick={() => { onSelect(it.id); setOpen(null); }}
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-[11px] text-[oklch(0.28_0.03_260)] hover:bg-white"
                                >
                                  <IIcon className="h-3 w-3 text-[oklch(0.42_0.14_265)]" aria-hidden="true" />
                                  <span className="truncate flex-1">{it.label}</span>
                                  <ArrowUpRight className="h-3 w-3 text-[oklch(0.55_0.02_260)]" aria-hidden="true" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <div className="mb-1.5 flex items-center gap-1 px-1 text-[9.5px] font-bold uppercase tracking-wider text-[oklch(0.55_0.02_260)]">
                        <Clock className="h-2.5 w-2.5" aria-hidden="true" /> Recently Used
                      </div>
                      {recentItems.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[oklch(0.9_0.01_255)] bg-white/60 px-2 py-2 text-[10.5px] text-[oklch(0.55_0.02_260)]">
                          Recent modules appear here.
                        </div>
                      ) : (
                        <ul className="flex flex-col gap-0.5">
                          {recentItems.map((it) => {
                            const IIcon = it.icon;
                            return (
                              <li key={it.id}>
                                <button
                                  onClick={() => { onSelect(it.id); setOpen(null); }}
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-[11px] text-[oklch(0.28_0.03_260)] hover:bg-white"
                                >
                                  <IIcon className="h-3 w-3 text-[oklch(0.55_0.02_260)]" aria-hidden="true" />
                                  <span className="truncate flex-1">{it.label}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Footer with shortcuts preview */}
                  <div className="flex items-center justify-between gap-3 border-t border-[oklch(0.95_0.005_255)] bg-white px-4 py-2 font-mono text-[10px] text-[oklch(0.5_0.02_260)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Lock className="h-2.5 w-2.5 text-[oklch(0.55_0.15_155)]" aria-hidden="true" /> All controls audited & versioned
                    </span>
                    <span className="hidden items-center gap-2 sm:inline-flex" aria-label="Keyboard shortcuts">
                      <span className="inline-flex items-center gap-1"><kbd className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1">↑↓</kbd> move</span>
                      <span className="inline-flex items-center gap-1"><kbd className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1">↵</kbd> open</span>
                      <span className="inline-flex items-center gap-1"><kbd className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1">P</kbd> pin</span>
                      <span className="inline-flex items-center gap-1"><kbd className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1">Esc</kbd> close</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Breadcrumb ─────────── */

function Breadcrumb({ group, label }: { group: string; label: string }) {
  return (
    <div className="border-b border-[oklch(0.94_0.005_255)] bg-white/60">
      <div className="mx-auto flex max-w-[1600px] items-center gap-1.5 px-4 py-2 font-mono text-[10.5px] text-[oklch(0.5_0.02_260)] md:px-6">
        <Link to="/" className="hover:text-[oklch(0.32_0.14_265)]">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span>Chat Manager</span>
        <ChevronRight className="h-3 w-3" />
        <span>{group}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-bold text-[oklch(0.22_0.03_260)]">{label}</span>
        <span className="ml-auto hidden items-center gap-2 sm:flex">
          <Lock className="h-3 w-3 text-[oklch(0.55_0.15_155)]" />
          Immutable Policy Store
        </span>
      </div>
    </div>
  );
}

/* ─────────── Page Header ─────────── */

function PageHeader({ item, group }: { item: (typeof ALL_ITEMS)[number]; group: string }) {
  const Icon = item.icon;
  return (
    <div className="rounded-2xl border border-[oklch(0.92_0.01_255)] bg-gradient-to-br from-white to-[oklch(0.98_0.01_255)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.96_0.03_265)] to-[oklch(0.94_0.05_265)] text-[oklch(0.36_0.14_265)] ring-1 ring-[oklch(0.88_0.05_265)]">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[20px] font-bold tracking-tight text-[oklch(0.18_0.03_260)]">{item.label}</h1>
              <Chip tone="indigo">{group}</Chip>
              <PermissionBadge role="Admin" />
              <Chip tone="slate"><CircleDot className="h-2.5 w-2.5" /> Active</Chip>
            </div>
            <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-[oklch(0.45_0.02_260)]">
              {item.hint ?? "Enterprise control managed exclusively from the Chat Manager. Changes are versioned, approved and audited."}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] text-[oklch(0.5_0.02_260)]">
              <span>Owner · <b className="text-[oklch(0.28_0.03_260)]">Compliance Office</b></span>
              <span>Updated · <b className="text-[oklch(0.28_0.03_260)]">Today · 09:42 IST</b></span>
              <span>Version · <b className="text-[oklch(0.28_0.03_260)]">v14.2.1</b></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: "indigo" | "emerald" | "slate" | "amber" }) {
  const cls = {
    indigo: "border-[oklch(0.85_0.08_265)] bg-[oklch(0.97_0.03_265)] text-[oklch(0.36_0.14_265)]",
    emerald: "border-[oklch(0.85_0.14_155)] bg-[oklch(0.97_0.05_155)] text-[oklch(0.4_0.15_155)]",
    slate: "border-[oklch(0.9_0.01_255)] bg-[oklch(0.97_0.01_255)] text-[oklch(0.4_0.02_260)]",
    amber: "border-[oklch(0.88_0.12_85)] bg-[oklch(0.98_0.06_85)] text-[oklch(0.48_0.14_75)]",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

/* ─────────── KPI Row ─────────── */

function KpiRow({ id: _id }: { id: SectionId }) {
  const kpis = [
    { label: "Configured", value: 128, ring: 84, hint: "Across all modules", tone: "indigo" as const, icon: LayoutGrid, delta: "+12", up: true, spark: [4, 6, 5, 8, 7, 10, 9, 12, 11, 14] },
    { label: "Pending Review", value: 4, ring: 22, hint: "Awaiting approval", tone: "amber" as const, icon: AlertTriangle, delta: "-2", up: true, spark: [8, 7, 9, 6, 5, 6, 4, 5, 4, 4] },
    { label: "Active Policies", value: 42, ring: 91, hint: "In production", tone: "emerald" as const, icon: ShieldCheck, delta: "+3", up: true, spark: [30, 32, 33, 34, 36, 37, 39, 40, 41, 42] },
    { label: "Warnings", value: 0, ring: 0, hint: "Nothing to address", tone: "slate" as const, icon: CircleDot, delta: "0", up: true, spark: [2, 1, 1, 2, 1, 0, 1, 0, 0, 0] },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {kpis.map((k) => {
        const Icon = k.icon;
        const deltaCls = k.delta.startsWith("-")
          ? "text-[oklch(0.55_0.18_25)] bg-[oklch(0.97_0.04_25)] border-[oklch(0.88_0.08_25)]"
          : k.delta === "0"
          ? "text-[oklch(0.5_0.02_260)] bg-[oklch(0.97_0.01_255)] border-[oklch(0.92_0.01_255)]"
          : "text-[oklch(0.42_0.15_155)] bg-[oklch(0.97_0.05_155)] border-[oklch(0.85_0.14_155)]";
        return (
          <div key={k.label} className="group rounded-2xl border border-[oklch(0.92_0.01_255)] bg-white/85 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[oklch(0.88_0.04_265)] hover:shadow-[0_14px_30px_-16px_rgba(15,23,42,0.2)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.5_0.02_260)]">{k.label}</span>
              <Chip tone={k.tone}><Icon className="h-2.5 w-2.5" /></Chip>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[24px] font-bold tabular-nums leading-none text-[oklch(0.18_0.03_260)]">
                  <AnimatedNumber value={k.value} />
                </div>
                <span className={`mt-1.5 inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-mono text-[9.5px] font-bold ${deltaCls}`}>
                  {k.delta !== "0" && (k.delta.startsWith("-") ? "▼" : "▲")} {k.delta.replace("-", "")}%
                </span>
              </div>
              <ProgressRing value={k.ring} tone={k.tone} />
            </div>
            <div className="mt-2 flex items-end gap-[3px] h-6">
              {k.spark.map((v, i) => {
                const max = Math.max(...k.spark, 1);
                const h = Math.max(8, Math.round((v / max) * 100));
                return (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-full rounded-sm ${
                      k.tone === "emerald" ? "bg-[oklch(0.85_0.14_155)] group-hover:bg-[oklch(0.65_0.16_155)]"
                      : k.tone === "amber" ? "bg-[oklch(0.88_0.12_85)] group-hover:bg-[oklch(0.72_0.16_75)]"
                      : k.tone === "indigo" ? "bg-[oklch(0.88_0.06_265)] group-hover:bg-[oklch(0.55_0.16_265)]"
                      : "bg-[oklch(0.9_0.01_255)] group-hover:bg-[oklch(0.65_0.02_260)]"
                    } transition-colors`}
                  />
                );
              })}
            </div>
            <div className="mt-1.5 text-[10.5px] text-[oklch(0.55_0.02_260)]">{k.hint}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── Quick Actions ─────────── */

function QuickActions() {
  const primary = [
    { label: "Save", icon: Save, tone: "primary" as const },
    { label: "Discard", icon: Undo2 },
    { label: "Reset", icon: RotateCcw },
    { label: "Preview", icon: Eye },
  ];
  const secondary = [
    { label: "Export", icon: Download },
    { label: "Import", icon: Upload },
    { label: "Compare", icon: GitCompare },
    { label: "History", icon: History },
    { label: "Refresh", icon: RefreshCw },
    { label: "Filter", icon: Filter },
    { label: "Fullscreen", icon: Maximize2 },
    { label: "More", icon: MoreHorizontal },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[oklch(0.92_0.01_255)] bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex flex-wrap items-center gap-1.5">
        {primary.map((b) => {
          const Icon = b.icon;
          const isPrimary = b.tone === "primary";
          return (
            <button
              key={b.label}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11.5px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40 active:scale-95 ${
                isPrimary
                  ? "bg-gradient-to-b from-[oklch(0.5_0.18_265)] to-[oklch(0.42_0.16_270)] text-white shadow-[0_2px_6px_-1px_oklch(0.42_0.16_270/0.5)] hover:brightness-110"
                  : "border border-[oklch(0.92_0.01_255)] bg-white text-[oklch(0.32_0.03_260)] hover:bg-[oklch(0.97_0.01_255)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {b.label}
            </button>
          );
        })}
      </div>
      <div className="mx-1 hidden h-6 w-px bg-[oklch(0.92_0.01_255)] sm:block" />
      <div className="flex flex-wrap items-center gap-1">
        {secondary.map((b) => {
          const Icon = b.icon;
          return (
            <button
              key={b.label}
              title={b.label}
              aria-label={b.label}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-[oklch(0.42_0.02_260)] transition-all hover:bg-[oklch(0.97_0.01_255)] hover:text-[oklch(0.2_0.03_260)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40"
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{b.label}</span>
            </button>
          );
        })}
      </div>
      <div className="ml-auto flex items-center gap-2 text-[10.5px] text-[oklch(0.55_0.02_260)]">
        <CircleDot className="h-2.5 w-2.5 text-[oklch(0.55_0.15_155)]" />
        All changes saved
      </div>
    </div>
  );
}

/* ─────────── Context Panel ─────────── */

function ContextPanel({ item }: { item: (typeof ALL_ITEMS)[number] }) {
  const ALL_SUGGESTIONS = useMemo(() => [
    { id: "sla-p0", sev: "high" as const, tags: ["sla", "escalation"], title: "Tighten P0 escalation SLA", body: "Reduce from 15m → 10m to match audit baseline.", impact: "9 policies", action: "Apply" },
    { id: "ai-redact", sev: "med" as const, tags: ["ai", "privacy"], title: "Enable AI redaction on legal-hold previews", body: "Prevents accidental PII leaks in read receipts.", impact: "2 modules", action: "Enable" },
    { id: "rotate-siem", sev: "low" as const, tags: ["security", "rotation"], title: "Rotate SIEM streaming key", body: "87 days since last rotation. Recommended cadence: 60d.", impact: "1 integration", action: "Rotate" },
    { id: "retention-support", sev: "med" as const, tags: ["retention", "policy"], title: "Set explicit retention on DPT-SUPPORT", body: "Currently defers to workspace default. Explicit policy improves audit clarity.", impact: "1 department", action: "Configure" },
    { id: "broadcast-owner", sev: "low" as const, tags: ["broadcast", "ownership"], title: "Assign Broadcast MOD owner", body: "Announcement channel lacks accountable owner for governance.", impact: "1 channel", action: "Assign" },
  ], []);

  // Persisted feedback drives re-ranking + future suggestions
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("cm.ai-feedback") ?? "{}"); } catch { return {}; }
  });
  const [dismissed, setDismissed] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("cm.ai-dismissed") ?? "[]"); } catch { return []; }
  });
  const [tagWeights, setTagWeights] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("cm.ai-tagweights") ?? "{}"); } catch { return {}; }
  });

  const persist = useCallback((fb: Record<string, "up" | "down">, dis: string[], tw: Record<string, number>) => {
    try {
      localStorage.setItem("cm.ai-feedback", JSON.stringify(fb));
      localStorage.setItem("cm.ai-dismissed", JSON.stringify(dis));
      localStorage.setItem("cm.ai-tagweights", JSON.stringify(tw));
    } catch { /* noop */ }
  }, []);

  const rate = (id: string, dir: "up" | "down") => {
    const s = ALL_SUGGESTIONS.find((x) => x.id === id);
    if (!s) return;
    const nextFb = { ...feedback, [id]: dir };
    const delta = dir === "up" ? 1 : -1;
    const nextTw = { ...tagWeights };
    s.tags.forEach((t) => { nextTw[t] = (nextTw[t] ?? 0) + delta; });
    const nextDis = dir === "down" ? Array.from(new Set([...dismissed, id])) : dismissed;
    setFeedback(nextFb); setTagWeights(nextTw); setDismissed(nextDis);
    persist(nextFb, nextDis, nextTw);
  };
  const dismiss = (id: string) => {
    const nextDis = Array.from(new Set([...dismissed, id]));
    setDismissed(nextDis);
    persist(feedback, nextDis, tagWeights);
  };
  const resetFeedback = () => {
    setFeedback({}); setDismissed([]); setTagWeights({});
    persist({}, [], {});
  };

  // Re-rank suggestions using tag weights (feedback refines future ordering)
  const suggestions = useMemo(() => {
    const scored = ALL_SUGGESTIONS
      .filter((s) => !dismissed.includes(s.id))
      .map((s) => {
        const tagBoost = s.tags.reduce((acc, t) => acc + (tagWeights[t] ?? 0), 0);
        const sevBase = s.sev === "high" ? 3 : s.sev === "med" ? 2 : 1;
        return { s, score: sevBase + tagBoost };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.s);
    return scored;
  }, [ALL_SUGGESTIONS, dismissed, tagWeights]);

  const feedbackCount = Object.keys(feedback).length;

  const warnings = {
    critical: [
      { title: "Audit ledger lag detected", body: "Realtime fabric queue behind by 42s in ap-south-1.", ts: "2m ago" },
    ],
    warning: [
      { title: "Weak retention on DPT-SUPPORT", body: "Retention policy defers to workspace default.", ts: "24m ago" },
      { title: "Unpinned announcement channel", body: "Broadcast MOD has no owner.", ts: "1h ago" },
    ],
    info: [
      { title: "New AI model available", body: "gemini-2.5-flash-lite ready to opt-in.", ts: "3h ago" },
    ],
  };
  const timeline = [
    { t: "09:41", a: "Ravi K.", role: "Admin", d: "Updated retention policy", tag: "policy" },
    { t: "09:12", a: "BOSS-000001", role: "Owner", d: "Approved staging RC1 sign-off", tag: "approval" },
    { t: "Yest", a: "Compliance Bot", role: "System", d: "Verified SOC 2 CC7 controls", tag: "audit" },
    { t: "Mon", a: "Priya M.", role: "Manager", d: "Escalation rule v14.2 approved", tag: "workflow" },
  ];

  return (
    <aside className="flex flex-col gap-3 xl:sticky xl:top-[7.5rem] xl:h-fit">
      {/* AI Recommendations */}
      <PanelCard title="AI Recommendations" icon={Sparkles} tone="indigo">
        <div className="mb-2 flex items-center justify-between text-[10.5px] text-[oklch(0.55_0.02_260)]">
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-[oklch(0.42_0.15_155)]" aria-hidden="true" />
            {suggestions.length} actions · refined by {feedbackCount} rating{feedbackCount === 1 ? "" : "s"}
          </span>
          {feedbackCount > 0 ? (
            <button onClick={resetFeedback} className="font-mono text-[10px] text-[oklch(0.42_0.14_265)] hover:underline">Reset</button>
          ) : (
            <button className="font-mono text-[10px] text-[oklch(0.42_0.14_265)] hover:underline">Re-scan</button>
          )}
        </div>
        {suggestions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[oklch(0.92_0.01_255)] bg-[oklch(0.985_0.005_255)] px-3 py-4 text-center text-[11px] text-[oklch(0.5_0.02_260)]">
            No open suggestions. <button onClick={resetFeedback} className="font-semibold text-[oklch(0.42_0.14_265)] hover:underline">Restore all</button>
          </div>
        ) : (
        <ul className="flex flex-col gap-2">
          {suggestions.map((s) => {
            const sevCls = s.sev === "high"
              ? "border-l-[oklch(0.65_0.2_25)] bg-[oklch(0.98_0.03_25)]"
              : s.sev === "med"
              ? "border-l-[oklch(0.72_0.16_75)] bg-[oklch(0.99_0.03_75)]"
              : "border-l-[oklch(0.55_0.16_265)] bg-[oklch(0.98_0.02_265)]";
            const sevLabel = s.sev === "high" ? "HIGH" : s.sev === "med" ? "MED" : "LOW";
            const sevText = s.sev === "high" ? "text-[oklch(0.55_0.18_25)]" : s.sev === "med" ? "text-[oklch(0.5_0.16_75)]" : "text-[oklch(0.42_0.14_265)]";
            const rated = feedback[s.id];
            return (
              <li key={s.id} className={`rounded-lg border border-[oklch(0.94_0.005_255)] border-l-2 p-2 ${sevCls}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[9px] font-bold ${sevText}`}>{sevLabel}</span>
                  <span className="font-mono text-[9.5px] text-[oklch(0.55_0.02_260)]">{s.impact}</span>
                </div>
                <div className="mt-0.5 text-[12px] font-semibold text-[oklch(0.22_0.03_260)]">{s.title}</div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-[oklch(0.42_0.02_260)]">{s.body}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <button className="inline-flex h-6 items-center gap-1 rounded-md bg-[oklch(0.55_0.16_265)] px-2 text-[10.5px] font-semibold text-white hover:brightness-110">
                    <Zap className="h-2.5 w-2.5" aria-hidden="true" /> {s.action}
                  </button>
                  <button
                    onClick={() => dismiss(s.id)}
                    className="inline-flex h-6 items-center rounded-md border border-[oklch(0.92_0.01_255)] bg-white px-2 text-[10.5px] font-semibold text-[oklch(0.42_0.02_260)] hover:bg-[oklch(0.97_0.01_255)]"
                  >
                    Dismiss
                  </button>
                  <div className="ml-auto inline-flex items-center gap-0.5" role="group" aria-label={`Rate suggestion: ${s.title}`}>
                    <button
                      onClick={() => rate(s.id, "up")}
                      aria-pressed={rated === "up"}
                      aria-label="Helpful — show more like this"
                      title="Helpful — show more like this"
                      className={`grid h-6 w-6 place-items-center rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40 ${
                        rated === "up"
                          ? "border-[oklch(0.55_0.15_155)] bg-[oklch(0.96_0.05_155)] text-[oklch(0.4_0.15_155)]"
                          : "border-[oklch(0.94_0.005_255)] bg-white text-[oklch(0.5_0.02_260)] hover:border-[oklch(0.85_0.14_155)] hover:text-[oklch(0.4_0.15_155)]"
                      }`}
                    >
                      <ThumbsUp className={`h-3 w-3 ${rated === "up" ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => rate(s.id, "down")}
                      aria-pressed={rated === "down"}
                      aria-label="Not helpful — show fewer like this"
                      title="Not helpful — show fewer like this"
                      className={`grid h-6 w-6 place-items-center rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40 ${
                        rated === "down"
                          ? "border-[oklch(0.72_0.16_25)] bg-[oklch(0.98_0.04_25)] text-[oklch(0.55_0.18_25)]"
                          : "border-[oklch(0.94_0.005_255)] bg-white text-[oklch(0.5_0.02_260)] hover:border-[oklch(0.85_0.14_25)] hover:text-[oklch(0.55_0.18_25)]"
                      }`}
                    >
                      <ThumbsDown className={`h-3 w-3 ${rated === "down" ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
                {rated && (
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 font-mono text-[9.5px] text-[oklch(0.5_0.02_260)]">
                    <Sparkle className="h-2.5 w-2.5 text-[oklch(0.42_0.14_265)]" aria-hidden="true" />
                    {rated === "up" ? "Boosted similar suggestions" : "Suppressed similar suggestions"}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        )}
      </PanelCard>


      {/* Warnings grouped by severity */}
      <PanelCard title="Warnings" icon={AlertTriangle}>
        <div className="flex flex-col gap-2.5">
          {([
            ["critical", "Critical", warnings.critical, "text-[oklch(0.55_0.18_25)]", "bg-[oklch(0.65_0.2_25)]"],
            ["warning", "Warning", warnings.warning, "text-[oklch(0.5_0.16_75)]", "bg-[oklch(0.72_0.16_75)]"],
            ["info", "Info", warnings.info, "text-[oklch(0.42_0.14_265)]", "bg-[oklch(0.55_0.16_265)]"],
          ] as const).map(([key, label, list, tx, bg]) => (
            <div key={key}>
              <div className={`mb-1 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider ${tx}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${bg}`} />
                {label}
                <span className="rounded-full bg-[oklch(0.97_0.01_255)] px-1.5 text-[9px] text-[oklch(0.55_0.02_260)]">{list.length}</span>
              </div>
              {list.length === 0 ? (
                <div className="rounded-md border border-dashed border-[oklch(0.92_0.01_255)] px-2 py-1.5 text-[10.5px] text-[oklch(0.55_0.02_260)]">All clear.</div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {list.map((w) => (
                    <li key={w.title} className="rounded-md bg-[oklch(0.985_0.005_255)] px-2 py-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11.5px] font-semibold text-[oklch(0.24_0.03_260)]">{w.title}</span>
                        <span className="shrink-0 font-mono text-[9.5px] text-[oklch(0.55_0.02_260)]">{w.ts}</span>
                      </div>
                      <div className="mt-0.5 text-[10.5px] text-[oklch(0.5_0.02_260)]">{w.body}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Recent Changes Timeline */}
      <PanelCard title="Recent Changes" icon={History}>
        <ol className="relative ml-1 border-l border-dashed border-[oklch(0.9_0.01_255)] pl-3">
          {timeline.map((e, i) => (
            <li key={e.t + i} className="relative pb-3 last:pb-0">
              <span className="absolute -left-[15px] top-0.5 grid h-3 w-3 place-items-center rounded-full bg-white ring-2 ring-[oklch(0.85_0.08_265)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.55_0.16_265)]" />
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[11.5px] font-semibold text-[oklch(0.24_0.03_260)]">{e.a} <span className="text-[oklch(0.55_0.02_260)]">· {e.role}</span></div>
                  <div className="truncate text-[10.5px] text-[oklch(0.5_0.02_260)]">{e.d}</div>
                </div>
                <span className="shrink-0 font-mono text-[9.5px] text-[oklch(0.55_0.02_260)]">{e.t}</span>
              </div>
              <span className="mt-1 inline-block rounded-full border border-[oklch(0.92_0.01_255)] bg-white px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[oklch(0.42_0.02_260)]">{e.tag}</span>
            </li>
          ))}
        </ol>
        <button className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-[oklch(0.92_0.01_255)] bg-white py-1.5 text-[10.5px] font-semibold text-[oklch(0.42_0.14_265)] hover:bg-[oklch(0.97_0.01_255)]">
          View full audit trail <ArrowUpRight className="h-3 w-3" />
        </button>
      </PanelCard>

      <PanelCard title="Documentation" icon={BookOpen}>
        <ul className="flex flex-col gap-1.5 text-[11.5px]">
          <DocLink>Overview · {item.label}</DocLink>
          <DocLink>Governance model of the Communication Hub</DocLink>
          <DocLink>Field reference & JSON schema</DocLink>
          <DocLink>Change-approval workflow</DocLink>
        </ul>
      </PanelCard>

      <PanelCard title="Keyboard Shortcuts" icon={Command}>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {[
            ["Save", "⌘ S"], ["Discard", "⌘ ."], ["Search", "⌘ K"],
            ["Preview", "⌘ P"], ["History", "⌘ H"], ["Help", "?"],
          ].map(([k, s]) => (
            <div key={k} className="flex items-center justify-between rounded-lg bg-[oklch(0.97_0.01_255)] px-2 py-1">
              <span className="text-[oklch(0.42_0.02_260)]">{k}</span>
              <kbd className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[oklch(0.28_0.03_260)]">{s}</kbd>
            </div>
          ))}
        </div>
      </PanelCard>
    </aside>
  );
}

function PanelCard({
  title, icon: Icon, children, tone,
}: { title: string; icon: typeof Settings; children: React.ReactNode; tone?: "indigo" }) {
  return (
    <div className="rounded-2xl border border-[oklch(0.92_0.01_255)] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="mb-2.5 flex items-center gap-2">
        <div className={`grid h-6 w-6 place-items-center rounded-md ${tone === "indigo" ? "bg-[oklch(0.96_0.03_265)] text-[oklch(0.4_0.14_265)]" : "bg-[oklch(0.97_0.01_255)] text-[oklch(0.4_0.02_260)]"}`}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.32_0.03_260)]">{title}</div>
      </div>
      {children}
    </div>
  );
}
function DocLink({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <a className="flex items-center justify-between rounded-md px-2 py-1 text-[oklch(0.35_0.03_260)] hover:bg-[oklch(0.97_0.01_255)] hover:text-[oklch(0.32_0.14_265)]" href="#">
        <span className="truncate">{children}</span>
        <ChevronRight className="h-3 w-3 opacity-60" />
      </a>
    </li>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[oklch(0.95_0.005_255)] py-1 last:border-b-0">
      <span className="text-[oklch(0.5_0.02_260)]">{k}</span>
      <span className="truncate font-semibold text-[oklch(0.24_0.03_260)]">{v}</span>
    </div>
  );
}

/* ─────────── Section renderer ─────────── */

function SectionRenderer({ id }: { id: SectionId }) {
  switch (id) {
    case "workspace": return (
      <Section title="Workspace Configuration" desc="Identity, timezone, working hours and language for the entire Enterprise Communication Hub.">
        <Grid>
          <Field label="Workspace ID" mono value="WS-SV-PRIME" locked />
          <Field label="Workspace Name" placeholder="Software Vala" />
          <Field label="Primary Timezone" placeholder="Asia/Kolkata (IST)" />
          <Field label="Working Hours" placeholder="10:00 → 19:00" />
          <Field label="Default Language" placeholder="English (EN)" />
          <Field label="Fallback Language" placeholder="हिन्दी (HI)" />
        </Grid>
        <Toggles items={[
          ["Enable secondary workspace mirror", true],
          ["Restrict access to office IP ranges", false],
          ["Require workspace verification badge on messages", true],
        ]} />
      </Section>
    );
    case "conversations": return (
      <Section title="Conversation Management" desc="Create, close, freeze, transfer and rebind conversations across departments, modules, projects and AMS.">
        <Toggles items={[
          ["Allow admin to freeze a conversation (no new messages)", true],
          ["Allow admin to transfer a conversation to another department", true],
          ["Allow admin to rebind a conversation to a different module", true],
          ["Auto-close conversations resolved for more than 30 days", false],
          ["Prevent duplicate conversations between the same participants", true],
        ]} />
      </Section>
    );
    case "message-policy": return (
      <Section title="Message Policy" desc="Enterprise message immutability — deletion, editing, copy, forward, export and recall are permanently disabled by policy.">
        <Toggles items={[
          ["Messages are permanent (never deletable)", true, true],
          ["Editing a message is disabled", true, true],
          ["Recall / Unsend is disabled", true, true],
          ["Forward is disabled", true, true],
          ["Copy is disabled", true, true],
          ["Export / Download conversation is disabled", true, true],
          ["Print conversation is disabled", true, true],
          ["Auto-delete / disappearing messages disabled", true, true],
          ["User-side archive is disabled", true, true],
        ]} />
        <Callout title="Immutability Enforced">
          Every message in this workspace is an official enterprise record. These policies are hard-locked and cannot be overridden by users or department leads. Only workspace-level compliance procedure can request an exception.
        </Callout>
      </Section>
    );
    case "security-policy": return (
      <Section title="Security Policy" desc="Encryption, session, device and message integrity controls.">
        <Toggles items={[
          ["End-to-end encryption (E2E) for every conversation", true, true],
          ["AES-256 at-rest encryption on message store", true, true],
          ["SHA-256 message integrity signature on every record", true, true],
          ["Screenshot & clipboard helpers blocked on chat surface", true],
          ["Require verified device for message send", true],
          ["Auto-sign out inactive session after 30 minutes", false],
        ]} />
      </Section>
    );
    case "retention": return (
      <Section title="Retention Policy" desc="How long messages, attachments and audit trails are retained. Retention only extends — it cannot delete an enterprise record.">
        <Grid>
          <Field label="Message Retention" placeholder="Permanent (Immutable)" locked />
          <Field label="Attachment Retention" placeholder="Permanent" locked />
          <Field label="Audit Log Retention" placeholder="10 years" />
          <Field label="Search Index Retention" placeholder="Permanent" locked />
        </Grid>
      </Section>
    );
    case "compliance": return (
      <Section title="Compliance Rules" desc="Regulatory framework applied to this workspace.">
        <Toggles items={[
          ["ISO 27001 controls", true],
          ["SOC 2 Type II reporting", true],
          ["GDPR — Right to access (export via compliance officer only)", true],
          ["DPDP Act (India) — Data principal request handling", true],
          ["Legal Hold — freeze messages under active review", true],
        ]} />
      </Section>
    );
    case "ai": return (
      <Section title="AI Configuration" desc="Which AI capabilities are available inside the Communication Hub.">
        <Toggles items={[
          ["AI summary of long conversations", true],
          ["AI translation between workspace languages", true],
          ["AI intent detection for priority routing", true],
          ["AI redaction of sensitive tokens in previews", true],
          ["AI-generated draft replies for department leads", true],
        ]} />
      </Section>
    );
    case "smart-reply": return (
      <Section title="Smart Reply Configuration" desc="Suggested replies shown above the composer.">
        <Grid>
          <Field label="Suggestions per message" placeholder="3" />
          <Field label="Suggestion tone" placeholder="Professional · Concise" />
          <Field label="Allowed languages" placeholder="EN, HI" />
          <Field label="Trigger threshold" placeholder="Confidence ≥ 0.75" />
        </Grid>
      </Section>
    );
    case "notifications": return (
      <Section title="Notification Rules" desc="How and when users are alerted for new messages, mentions and escalations.">
        <Toggles items={[
          ["Desktop notifications for direct messages", true],
          ["Desktop notifications for @mentions", true],
          ["Email digest for missed conversations", true],
          ["SMS alert for P0 (critical) escalations", true],
          ["Quiet hours between 22:00 and 07:00", false],
        ]} />
      </Section>
    );
    case "departments": return (
      <Section title="Department Mapping" desc="Which departments participate in the Communication Hub and their default routing.">
        <Table headers={["Department", "Code", "Default Priority", "Auto-route to"]} note="Departments come from the Software Vala organisation registry — read-only here." />
      </Section>
    );
    case "modules": return (
      <Section title="Module Mapping" desc="Which software modules can spawn conversations (AMS, Projects, Support, Sales, Accounts, Development).">
        <ModuleControlGrid />
        <Table headers={["Module", "Code", "Chat Enabled", "Owner Department"]} note="Modules come from the Software Vala module registry — read-only here." />
      </Section>
    );
    case "roles": return (
      <Section title="Role Access Matrix" desc="Grant or revoke every capability per role. Only the Chat Manager can change these — nothing is exposed inside the User Dashboard.">
        <RoleMatrix />
      </Section>
    );
    case "permissions": return (
      <Section title="Permission Matrix" desc="Fine-grained per-user overrides on top of the Role Access Matrix.">
        <Table headers={["User", "Role", "Overrides", "Effective Since"]} />
      </Section>
    );
    case "approvals": return (
      <Section title="Approval Rules" desc="Which conversation actions require an approver before taking effect.">
        <Toggles items={[
          ["Creating a cross-department broadcast", true],
          ["Onboarding an external client into an internal channel", true],
          ["Assigning a conversation to legal hold", true],
          ["Granting temporary AI access to a role", true],
        ]} />
      </Section>
    );
    case "escalation": return (
      <Section title="Escalation Rules" desc="Auto-escalate stale or high-priority conversations.">
        <Grid>
          <Field label="P0 (Critical) escalates after" placeholder="15 minutes without reply" />
          <Field label="P1 (High) escalates after" placeholder="2 hours without reply" />
          <Field label="P2 (Normal) escalates after" placeholder="1 business day" />
          <Field label="Escalate to" placeholder="Department Lead → Head of Department" />
        </Grid>
      </Section>
    );
    case "categories": return (
      <Section title="Conversation Categories" desc="The top-level taxonomy for every conversation.">
        <Chips items={["Client", "Employee", "Sales", "Support", "Development", "Project", "AMS", "Compliance", "Legal", "Internal"]} />
      </Section>
    );
    case "tags": return (
      <Section title="Tags" desc="Freeform tags used for search, filtering and analytics.">
        <Chips items={["urgent", "billing", "renewal", "on-hold", "reviewed", "signed-off"]} />
      </Section>
    );
    case "labels": return (
      <Section title="Labels" desc="Structured labels enforced by policy. Users may apply but not create.">
        <Chips items={["Confidential", "Internal", "Client-Facing", "Legal Sensitive", "PII", "Financial"]} />
      </Section>
    );
    case "priority": return (
      <Section title="Priority Rules" desc="How priority is assigned and displayed on messages.">
        <Grid>
          <Field label="P0 label" placeholder="Critical" />
          <Field label="P1 label" placeholder="High" />
          <Field label="P2 label" placeholder="Normal" />
          <Field label="P3 label" placeholder="Low" />
        </Grid>
      </Section>
    );
    case "automation": return (
      <Section title="Automation Rules" desc="Trigger → condition → action rules that run on conversations.">
        <Table headers={["Rule Name", "Trigger", "Condition", "Action"]} />
      </Section>
    );
    case "archive": return (
      <Section title="Archive Management" desc="Admin-side archival. User-side archive is disabled by policy.">
        <Toggles items={[
          ["Move resolved conversations to cold storage after 180 days", true],
          ["Keep archived conversations searchable", true],
          ["Show archive banner inside archived conversations", true],
        ]} />
      </Section>
    );
    case "broadcast": return (
      <Section title="Broadcast Management" desc="One-to-many enterprise broadcasts by role, department or module.">
        <Table headers={["Broadcast", "Audience", "Approver", "Status"]} />
      </Section>
    );
    case "announcement": return (
      <Section title="Announcement Management" desc="Pinned enterprise announcements shown at the top of conversations.">
        <Table headers={["Title", "Scope", "Author", "Expires"]} />
      </Section>
    );
    case "audit": return (
      <Section title="Audit Center" desc="Every admin action, policy change and message access is recorded in a tamper-evident audit ledger.">
        <Toggles items={[
          ["Real-time audit streaming to SIEM", true],
          ["Alert on unusual bulk access patterns", true],
          ["Alert on policy overrides", true],
        ]} />
        <Table headers={["Time", "Actor", "Action", "Target", "Result"]} />
      </Section>
    );
    case "activity": return (
      <Section title="Activity Logs" desc="Chronological log of admin activity in the Chat Manager module.">
        <Table headers={["Time", "Admin", "Action", "Detail"]} />
      </Section>
    );
    case "storage": return (
      <Section title="Storage Overview" desc="Storage consumption across messages, attachments, audit ledger and search index.">
        <StatGrid stats={[
          { label: "Messages", value: "—", hint: "Immutable store" },
          { label: "Attachments", value: "—", hint: "Encrypted at rest" },
          { label: "Audit Ledger", value: "—", hint: "Tamper-evident" },
          { label: "Search Index", value: "—", hint: "Permanent" },
        ]} />
      </Section>
    );
    case "usage": return (
      <Section title="Usage Analytics" desc="Volume, response time and utilisation across departments and modules.">
        <AnalyticsAccessNotice />
        <StatGrid stats={[
          { label: "Active Conversations", value: "—" },
          { label: "Median First Response", value: "—" },
          { label: "P0 Escalations (7d)", value: "—" },
          { label: "AI Assist Coverage", value: "—" },
        ]} />
      </Section>
    );
    case "analytics-access": return (
      <Section title="Analytics Access" desc="Role-based control over who can open and export the CSAT & Analytics dashboard.">
        <AnalyticsAccessControl />
      </Section>
    );
    case "search-index": return (
      <Section title="Search Index Management" desc="Full-text and semantic index for the Communication Hub.">
        <Toggles items={[
          ["Full-text index enabled", true],
          ["Semantic (vector) index enabled", true],
          ["Include attachment OCR in index", true],
        ]} />
      </Section>
    );
    case "ai-training": return (
      <Section title="AI Training Control" desc="What the workspace AI is allowed to learn from.">
        <Toggles items={[
          ["Use workspace conversations to improve smart reply", false],
          ["Use workspace conversations to improve intent routing", true],
          ["Redact PII before any training use", true, true],
          ["Legal-hold conversations excluded from training", true, true],
        ]} />
      </Section>
    );
    case "integrations": return (
      <Section title="Integration Settings" desc="External systems allowed to send events into the Communication Hub.">
        <Table headers={["Integration", "Direction", "Auth", "Status"]} />
      </Section>
    );
    case "backup": return (
      <Section title="Backup Status" desc="Enterprise backup and disaster recovery posture.">
        <StatGrid stats={[
          { label: "Last Snapshot", value: "—" },
          { label: "Snapshot Cadence", value: "Hourly" },
          { label: "Retention", value: "35 days" },
          { label: "RPO / RTO", value: "1h / 4h" },
        ]} />
      </Section>
    );
    case "system": return (
      <Section title="System Health" desc="Live status of the Communication Hub subsystems.">
        <StatGrid stats={[
          { label: "Message Gateway", value: "OK" },
          { label: "Realtime Fabric", value: "OK" },
          { label: "Audit Ledger", value: "OK" },
          { label: "AI Gateway", value: "OK" },
        ]} />
      </Section>
    );
  }
}

/* ─────────── Primitives ─────────── */

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-bold tracking-tight text-[oklch(0.18_0.03_260)]">{title}</h2>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[oklch(0.5_0.02_260)]">{desc}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}
function Field({ label, placeholder, mono, value, locked }: { label: string; placeholder?: string; mono?: boolean; value?: string; locked?: boolean }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[oklch(0.5_0.02_260)]">
        {label}
        {locked && <Lock className="h-3 w-3 text-[oklch(0.55_0.15_155)]" aria-label="Policy locked" />}
      </span>
      <input
        readOnly={locked}
        defaultValue={value}
        placeholder={placeholder}
        className={`h-9 rounded-lg border border-[oklch(0.92_0.01_255)] bg-white px-3 text-[12px] text-[oklch(0.22_0.03_260)] outline-none transition-all placeholder:text-[oklch(0.62_0.02_260)] focus:border-[oklch(0.55_0.16_265)] focus:ring-4 focus:ring-[oklch(0.55_0.16_265)]/10 ${mono ? "font-mono" : ""} ${locked ? "cursor-not-allowed bg-[oklch(0.97_0.01_255)] text-[oklch(0.45_0.02_260)]" : ""}`}
      />
    </label>
  );
}
function Toggles({ items }: { items: [string, boolean, boolean?][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[oklch(0.92_0.01_255)] bg-white">
      {items.map(([label, on, locked], i) => (
        <div key={label} className={`flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-[oklch(0.95_0.005_255)]" : ""}`}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[12px] text-[oklch(0.24_0.03_260)]">{label}</span>
            {locked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.85_0.14_155)] bg-[oklch(0.97_0.05_155)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[oklch(0.4_0.15_155)]">
                <Lock className="h-2.5 w-2.5" /> Locked
              </span>
            )}
          </div>
          <ToggleSwitch defaultOn={on} disabled={locked} />
        </div>
      ))}
    </div>
  );
}
function ToggleSwitch({ defaultOn, disabled }: { defaultOn: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => !disabled && setOn(!on)}
      aria-pressed={on}
      disabled={disabled}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40 ${
        on ? "bg-[oklch(0.6_0.16_155)]" : "bg-[oklch(0.88_0.01_255)]"
      } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}
function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[oklch(0.88_0.05_265)] bg-gradient-to-br from-[oklch(0.98_0.02_265)] to-white p-4">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[oklch(0.94_0.05_265)] text-[oklch(0.4_0.14_265)]">
        <Lock className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[12.5px] font-bold text-[oklch(0.2_0.03_260)]">{title}</div>
        <p className="mt-1 text-[11.5px] leading-relaxed text-[oklch(0.42_0.02_260)]">{children}</p>
      </div>
    </div>
  );
}
function Table({ headers, note, loading }: { headers: string[]; note?: string; loading?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[oklch(0.92_0.01_255)] bg-white">
      <table className="w-full">
        <thead className="bg-[oklch(0.97_0.01_255)]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[oklch(0.5_0.02_260)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, r) => (
              <tr key={r} className={r > 0 ? "border-t border-[oklch(0.95_0.005_255)]" : ""}>
                {headers.map((h, c) => (
                  <td key={h + c} className="px-3 py-3">
                    <div className="h-3 animate-pulse rounded-full bg-gradient-to-r from-[oklch(0.96_0.01_255)] via-[oklch(0.93_0.01_255)] to-[oklch(0.96_0.01_255)]" style={{ width: `${40 + ((r + c) % 5) * 12}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-3 py-14 text-center text-[11.5px] text-[oklch(0.55_0.02_260)]">
                <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                  <div className="relative">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[oklch(0.96_0.03_265)] to-[oklch(0.94_0.05_265)] text-[oklch(0.4_0.14_265)] ring-1 ring-[oklch(0.88_0.06_265)] shadow-[0_8px_24px_-12px_oklch(0.42_0.16_270/0.4)]">
                      <Database className="h-5 w-5" />
                    </div>
                    <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-white text-[oklch(0.55_0.15_155)] ring-1 ring-[oklch(0.85_0.14_155)]">
                      <CircleAlert className="h-2.5 w-2.5" />
                    </span>
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[oklch(0.22_0.03_260)]">No records surfaced yet</div>
                    <div className="mt-1 text-[11.5px] text-[oklch(0.5_0.02_260)]">Populate this grid by connecting your enterprise registry, importing a baseline CSV, or seeding a starter template.</div>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                    <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-b from-[oklch(0.5_0.18_265)] to-[oklch(0.42_0.16_270)] px-3 text-[11.5px] font-semibold text-white shadow-[0_2px_6px_-1px_oklch(0.42_0.16_270/0.5)] hover:brightness-110">
                      <PlugZap className="h-3.5 w-3.5" /> Connect registry
                    </button>
                    <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[oklch(0.92_0.01_255)] bg-white px-3 text-[11.5px] font-semibold text-[oklch(0.32_0.03_260)] hover:bg-[oklch(0.97_0.01_255)]">
                      <Upload className="h-3.5 w-3.5" /> Import CSV
                    </button>
                    <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[oklch(0.92_0.01_255)] bg-white px-3 text-[11.5px] font-semibold text-[oklch(0.32_0.03_260)] hover:bg-[oklch(0.97_0.01_255)]">
                      <Layers className="h-3.5 w-3.5" /> Use starter template
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-[oklch(0.92_0.01_255)] bg-[oklch(0.985_0.005_255)] px-2.5 py-1.5 text-[10.5px] text-[oklch(0.5_0.02_260)]">
                    <BookOpen className="h-3 w-3" /> Read the <a href="#" className="font-semibold text-[oklch(0.42_0.14_265)] hover:underline">setup guide</a> · 2 min
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {note && (
        <div className="border-t border-[oklch(0.95_0.005_255)] bg-[oklch(0.98_0.005_255)] px-3 py-2 text-[10.5px] text-[oklch(0.5_0.02_260)]">{note}</div>
      )}
    </div>
  );
}
function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.92_0.01_255)] bg-white px-2.5 py-1 font-mono text-[10.5px] font-semibold text-[oklch(0.28_0.03_260)] shadow-[0_1px_1px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:border-[oklch(0.85_0.08_265)] hover:text-[oklch(0.36_0.14_265)]">{t}</span>
      ))}
    </div>
  );
}
function StatGrid({ stats }: { stats: { label: string; value: string; hint?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-[oklch(0.92_0.01_255)] bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.5_0.02_260)]">{s.label}</div>
          <div className="mt-1 font-mono text-[18px] font-bold text-[oklch(0.2_0.03_260)]">{s.value}</div>
          {s.hint && <div className="mt-0.5 text-[10px] text-[oklch(0.55_0.02_260)]">{s.hint}</div>}
        </div>
      ))}
    </div>
  );
}

/* ─────────── Role Access Matrix ─────────── */

const ROLES = ["Boss", "Admin", "Manager", "Dev Lead", "Developer", "Sales", "Support", "Accounts", "Client"] as const;

const CAPABILITIES: { key: string; label: string; defaults: Partial<Record<(typeof ROLES)[number], boolean>> }[] = [
  { key: "access-chat", label: "Access the Communication Hub", defaults: { Boss: true, Admin: true, Manager: true, "Dev Lead": true, Developer: true, Sales: true, Support: true, Accounts: true, Client: true } },
  { key: "view-conv", label: "View conversations", defaults: { Boss: true, Admin: true, Manager: true, "Dev Lead": true, Developer: true, Sales: true, Support: true, Accounts: true, Client: true } },
  { key: "create-conv", label: "Create conversations", defaults: { Boss: true, Admin: true, Manager: true, "Dev Lead": true, Sales: true, Support: true } },
  { key: "reply", label: "Reply to messages", defaults: { Boss: true, Admin: true, Manager: true, "Dev Lead": true, Developer: true, Sales: true, Support: true, Accounts: true, Client: true } },
  { key: "upload", label: "Upload files", defaults: { Boss: true, Admin: true, Manager: true, "Dev Lead": true, Developer: true, Sales: true, Support: true } },
  { key: "download", label: "Download files", defaults: { Boss: true, Admin: true, Manager: true } },
  { key: "ai", label: "Use AI assist", defaults: { Boss: true, Admin: true, Manager: true, "Dev Lead": true, Sales: true, Support: true } },
  { key: "voice", label: "Use voice messages", defaults: { Boss: true, Admin: true, Manager: true, "Dev Lead": true, Sales: true, Support: true } },
  { key: "announcement", label: "Post announcements", defaults: { Boss: true, Admin: true } },
  { key: "broadcast", label: "Send broadcasts", defaults: { Boss: true, Admin: true } },
  { key: "access-departments", label: "Access departments", defaults: { Boss: true, Admin: true, Manager: true } },
  { key: "access-projects", label: "Access projects", defaults: { Boss: true, Admin: true, Manager: true, "Dev Lead": true, Developer: true } },
  { key: "access-ams", label: "Access AMS", defaults: { Boss: true, Admin: true, Manager: true, Support: true } },
  { key: "access-modules", label: "Access modules", defaults: { Boss: true, Admin: true, Manager: true } },
  { key: "pin", label: "Pin conversations", defaults: { Boss: true, Admin: true, Manager: true } },
  { key: "groups", label: "Create groups", defaults: { Boss: true, Admin: true, Manager: true } },
  { key: "channels", label: "Manage channels", defaults: { Boss: true, Admin: true } },
  { key: "policies", label: "Manage policies", defaults: { Boss: true, Admin: true } },
  { key: "security", label: "Manage security", defaults: { Boss: true, Admin: true } },
  { key: "audit", label: "Manage audit", defaults: { Boss: true, Admin: true } },
  { key: "integrations", label: "Manage integrations", defaults: { Boss: true, Admin: true } },
];

function RoleMatrix() {
  return (
    <div className="overflow-hidden rounded-xl border border-[oklch(0.92_0.01_255)] bg-white">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[880px]">
          <thead className="bg-[oklch(0.97_0.01_255)]">
            <tr>
              <th className="sticky left-0 z-10 bg-[oklch(0.97_0.01_255)] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[oklch(0.5_0.02_260)]">Capability</th>
              {ROLES.map((r) => (
                <th key={r} className="px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-[oklch(0.5_0.02_260)]">
                  <div className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {r}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((cap, i) => (
              <tr key={cap.key} className={i > 0 ? "border-t border-[oklch(0.95_0.005_255)]" : ""}>
                <td className="sticky left-0 z-10 bg-white px-3 py-2 text-[11.5px] font-semibold text-[oklch(0.24_0.03_260)]">{cap.label}</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-2 py-2 text-center">
                    <ToggleSwitch defaultOn={!!cap.defaults[r]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[oklch(0.95_0.005_255)] bg-[oklch(0.98_0.005_255)] px-3 py-2 text-[10.5px] text-[oklch(0.5_0.02_260)]">
        Nothing here is exposed inside the User Dashboard. Every capability is enforced from this Chat Manager.
      </div>
    </div>
  );
}

/* ─────────── Bottom Status Bar ─────────── */

function BottomStatusBar({
  item, group, onOpenPalette,
}: { item: (typeof ALL_ITEMS)[number]; group: string; onOpenPalette: () => void }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const time = now
    ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "--:--";
  return (
    <footer className="z-30 flex h-8 shrink-0 items-center gap-3 border-t border-[oklch(0.92_0.01_255)] bg-white/95 px-3 font-mono text-[10.5px] text-[oklch(0.5_0.02_260)] backdrop-blur-xl md:px-5">
      <span className="inline-flex items-center gap-1 text-[oklch(0.4_0.15_155)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.16_155)] shadow-[0_0_0_3px_oklch(0.85_0.14_155/0.35)]" />
        Systems Nominal
      </span>
      <Sep />
      <span className="hidden sm:inline">{group}</span>
      <span className="hidden text-[oklch(0.35_0.03_260)] sm:inline">·</span>
      <span className="hidden truncate text-[oklch(0.28_0.03_260)] sm:inline">{item.label}</span>
      <span className="ml-auto hidden items-center gap-1 md:inline-flex">
        <Wifi className="h-3 w-3" /> 42 ms
      </span>
      <Sep className="hidden md:inline-block" />
      <span className="hidden items-center gap-1 md:inline-flex" title="Realtime fabric">
        <Server className="h-3 w-3" /> ap-south-1
      </span>
      <Sep className="hidden md:inline-block" />
      <span className="hidden md:inline">v14.2.1</span>
      <Sep className="hidden md:inline-block" />
      <span className="hidden md:inline">{time} IST</span>
      <Sep className="hidden md:inline-block" />
      <button
        onClick={onOpenPalette}
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[oklch(0.4_0.14_265)] transition-colors hover:bg-[oklch(0.96_0.03_265)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40"
        aria-label="Open command palette"
      >
        <Command className="h-3 w-3" /> K
      </button>
    </footer>
  );
}

function Sep({ className = "" }: { className?: string }) {
  return <span className={`h-3 w-px bg-[oklch(0.92_0.01_255)] ${className}`} aria-hidden />;
}

/* ─────────── Command Palette ─────────── */

function CommandPalette({
  active, onClose, onSelect, recent, pinned, onTogglePin,
}: {
  active: SectionId;
  onClose: () => void;
  onSelect: (id: SectionId) => void;
  recent: string[];
  pinned: string[];
  onTogglePin: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [category, setCategory] = useState<string>("All");
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => ["All", ...NAV.map((g) => g.label)], []);

  const results = useMemo(() => {
    const needle = q.trim();
    const filtered = category === "All" ? ALL_ITEMS : ALL_ITEMS.filter((i) => i.group === category);
    if (!needle) return filtered;
    return filtered
      .map((it) => ({
        it,
        score: Math.max(
          fuzzyScore(it.label, needle) * 2,
          fuzzyScore(it.group, needle),
          fuzzyScore(it.hint ?? "", needle),
        ),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.it);
  }, [q, category]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setIdx(0); }, [q, category]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const it = results[idx];
      if (it) onSelect(it.id);
    } else if ((e.altKey || e.metaKey) && e.key.toLowerCase() === "p") {
      // Alt/Meta+P pins/unpins the highlighted result without stealing plain "p" typing
      e.preventDefault();
      const it = results[idx];
      if (it) onTogglePin(it.id);
    }
  }

  const recentItems = !q ? recent.map((id) => ALL_ITEMS.find((i) => i.id === id)).filter(Boolean).slice(0, 3) as typeof ALL_ITEMS : [];
  const pinnedItems = !q ? pinned.map((id) => ALL_ITEMS.find((i) => i.id === id)).filter(Boolean).slice(0, 4) as typeof ALL_ITEMS : [];

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-50 grid place-items-start bg-[oklch(0.18_0.04_265/0.35)] px-4 pt-[10vh] backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKey}
        className="w-full max-w-[680px] animate-fade-in overflow-hidden rounded-2xl border border-[oklch(0.9_0.01_255)] bg-white shadow-[0_40px_100px_-30px_rgba(15,23,42,0.35)]"
      >
        <div className="flex items-center gap-2 border-b border-[oklch(0.94_0.005_255)] px-3.5 py-2.5">
          <Search className="h-4 w-4 text-[oklch(0.5_0.02_260)]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Universal search · policies · roles · modules · users · fuzzy match…"
            className="h-8 w-full bg-transparent text-[13px] text-[oklch(0.2_0.03_260)] outline-none placeholder:text-[oklch(0.6_0.02_260)]"
          />
          <kbd className="hidden items-center gap-0.5 rounded-md border border-[oklch(0.9_0.01_255)] bg-[oklch(0.98_0.005_255)] px-1.5 py-0.5 font-mono text-[10px] text-[oklch(0.5_0.02_260)] sm:inline-flex">
            Esc
          </kbd>
        </div>

        {/* Category chips */}
        <div className="scrollbar-thin flex items-center gap-1 overflow-x-auto border-b border-[oklch(0.95_0.005_255)] bg-[oklch(0.985_0.005_255)] px-3 py-2">
          <Filter className="h-3 w-3 shrink-0 text-[oklch(0.55_0.02_260)]" />
          {categories.map((c) => {
            const count = c === "All" ? ALL_ITEMS.length : ALL_ITEMS.filter((i) => i.group === c).length;
            const on = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold transition-all ${
                  on
                    ? "border-[oklch(0.55_0.16_265)] bg-[oklch(0.55_0.16_265)] text-white"
                    : "border-[oklch(0.92_0.01_255)] bg-white text-[oklch(0.4_0.02_260)] hover:border-[oklch(0.85_0.08_265)] hover:text-[oklch(0.32_0.14_265)]"
                }`}
              >
                {c}
                <span className={`rounded-full px-1 font-mono text-[9px] ${on ? "bg-white/25" : "bg-[oklch(0.97_0.01_255)] text-[oklch(0.5_0.02_260)]"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="scrollbar-thin max-h-[52vh] overflow-y-auto p-1.5">
          {/* Pinned / Recent when empty query */}
          {pinnedItems.length > 0 && (
            <>
              <div className="mt-1 px-2 pb-1 text-[9.5px] font-bold uppercase tracking-wider text-[oklch(0.55_0.02_260)]">Pinned</div>
              {pinnedItems.map((it) => {
                const Icon = it.icon;
                return (
                  <button
                    key={"pin-" + it.id}
                    onClick={() => onSelect(it.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left hover:bg-[oklch(0.97_0.01_255)]"
                  >
                    <Pin className="h-3 w-3 fill-current text-[oklch(0.42_0.14_265)]" />
                    <Icon className="h-3.5 w-3.5 text-[oklch(0.42_0.02_260)]" />
                    <span className="truncate text-[12px] font-semibold text-[oklch(0.22_0.03_260)]">{it.label}</span>
                    <span className="ml-auto truncate text-[10.5px] text-[oklch(0.55_0.02_260)]">{it.group}</span>
                  </button>
                );
              })}
            </>
          )}
          {recentItems.length > 0 && (
            <>
              <div className="mt-2 px-2 pb-1 text-[9.5px] font-bold uppercase tracking-wider text-[oklch(0.55_0.02_260)]">Recent</div>
              {recentItems.map((it) => {
                const Icon = it.icon;
                return (
                  <button
                    key={"rec-" + it.id}
                    onClick={() => onSelect(it.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left hover:bg-[oklch(0.97_0.01_255)]"
                  >
                    <Clock className="h-3 w-3 text-[oklch(0.55_0.02_260)]" />
                    <Icon className="h-3.5 w-3.5 text-[oklch(0.42_0.02_260)]" />
                    <span className="truncate text-[12px] font-semibold text-[oklch(0.22_0.03_260)]">{it.label}</span>
                    <span className="ml-auto truncate text-[10.5px] text-[oklch(0.55_0.02_260)]">{it.group}</span>
                  </button>
                );
              })}
              <div className="mx-2 my-2 h-px bg-[oklch(0.95_0.005_255)]" />
            </>
          )}

          {(pinnedItems.length > 0 || recentItems.length > 0) && (
            <div className="px-2 pb-1 text-[9.5px] font-bold uppercase tracking-wider text-[oklch(0.55_0.02_260)]">
              {category === "All" ? "All Controls" : category}
            </div>
          )}

          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-[12px] text-[oklch(0.5_0.02_260)]">
              No controls match <span className="font-semibold text-[oklch(0.28_0.03_260)]">"{q}"</span>
              <div className="mt-2 text-[10.5px]">Try clearing the category filter or a shorter query.</div>
            </div>
          ) : (
            results.map((it, i) => {
              const Icon = it.icon;
              const selected = i === idx;
              const current = it.id === active;
              const isPinned = pinned.includes(it.id);
              return (
                <div
                  key={it.id}
                  className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                    selected ? "bg-[oklch(0.96_0.03_265)]" : "hover:bg-[oklch(0.97_0.01_255)]"
                  }`}
                >
                  <button
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => onSelect(it.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                      selected ? "bg-white text-[oklch(0.4_0.14_265)] ring-1 ring-[oklch(0.85_0.08_265)]" : "bg-[oklch(0.97_0.01_255)] text-[oklch(0.42_0.02_260)]"
                    }`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-semibold text-[oklch(0.22_0.03_260)]">{it.label}</div>
                      <div className="truncate text-[10.5px] text-[oklch(0.55_0.02_260)]">{it.group}{it.hint ? ` · ${it.hint}` : ""}</div>
                    </div>
                    {current && (
                      <span className="rounded-full border border-[oklch(0.85_0.08_265)] bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[oklch(0.4_0.14_265)]">
                        Current
                      </span>
                    )}
                    {selected && !current && <CornerDownLeft className="h-3.5 w-3.5 text-[oklch(0.5_0.02_260)]" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onTogglePin(it.id); }}
                    title={isPinned ? `Unpin ${it.label}` : `Pin ${it.label}`}
                    aria-label={isPinned ? `Unpin ${it.label}` : `Pin ${it.label} to top`}
                    aria-pressed={isPinned}
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.16_265)]/40 ${
                      isPinned
                        ? "border-[oklch(0.85_0.08_265)] bg-[oklch(0.96_0.03_265)] text-[oklch(0.42_0.14_265)]"
                        : "border-[oklch(0.94_0.005_255)] bg-white text-[oklch(0.55_0.02_260)] hover:border-[oklch(0.85_0.08_265)] hover:text-[oklch(0.32_0.14_265)]"
                    }`}
                  >
                    {isPinned ? <Pin className="h-3 w-3 fill-current" /> : <PinOff className="h-3 w-3" />}
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[oklch(0.94_0.005_255)] bg-[oklch(0.98_0.005_255)] px-3.5 py-2 font-mono text-[10px] text-[oklch(0.5_0.02_260)]">
          <span>{results.length} of {ALL_ITEMS.length} · {category}</span>
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><kbd className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1">↑</kbd><kbd className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1">↓</kbd> navigate</span>
            <span className="inline-flex items-center gap-1"><kbd className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1">↵</kbd> jump</span>
            <span className="inline-flex items-center gap-1"><kbd className="rounded border border-[oklch(0.9_0.01_255)] bg-white px-1">⌥ P</kbd> pin</span>
          </span>
        </div>
      </div>
    </div>
  );
}
