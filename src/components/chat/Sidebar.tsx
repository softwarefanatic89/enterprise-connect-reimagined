import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Search, Plus, Settings, Bell, Pin, VolumeX, SlidersHorizontal, ChevronDown,
  MessageCircle, Hash, Folder, Building2, Ticket, ShieldCheck, X,
  Circle, Video, Mic, Phone, Clock, AlertTriangle, Bot, Crown,
} from "lucide-react";
import { conversations, ROLE, PRIORITY, type Conversation, type Presence, type LiveState } from "./data";

const folders = [
  { id: "all",      label: "All",      icon: MessageCircle, hint: "All conversations" },
  { id: "dms",      label: "Direct",   icon: Hash,          hint: "Direct messages" },
  { id: "ams",      label: "AMS",      icon: Ticket,        hint: "Action management" },
  { id: "projects", label: "Projects", icon: Folder,        hint: "Project rooms" },
  { id: "depts",    label: "Depts",    icon: Building2,     hint: "Departments" },
] as const;

type FolderId = (typeof folders)[number]["id"];
const FOLDER_IDS = new Set<FolderId>(folders.map((f) => f.id));
const STORAGE_KEY = "sv.sidebar.prefs.v1";

const PRESENCE_META: Record<Presence, { dot: string; label: string }> = {
  online:  { dot: "bg-emerald-500",     label: "Online" },
  away:    { dot: "bg-amber-500",       label: "Away" },
  dnd:     { dot: "bg-rose-500",        label: "Busy" },
  idle:    { dot: "bg-sky-400",         label: "Idle" },
  offline: { dot: "bg-sidebar-muted/50",label: "Offline" },
};

const LIVE_META: Record<Exclude<LiveState, null>, { icon: React.ComponentType<{ className?: string }>; label: string; cls: string }> = {
  typing:    { icon: Circle, label: "typing…",    cls: "text-emerald-600" },
  recording: { icon: Mic,    label: "recording",  cls: "text-rose-600" },
  calling:   { icon: Phone,  label: "on call",    cls: "text-amber-600" },
  meeting:   { icon: Video,  label: "in meeting", cls: "text-violet-600" },
};

type Row =
  | { kind: "header"; id: string; label: string; tone?: "crit"; icon?: React.ComponentType<{ className?: string }> }
  | { kind: "conv"; id: string; conv: Conversation };

function loadPrefs(): { folder: FolderId; q: string } {
  if (typeof window === "undefined") return { folder: "all", q: "" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { folder: "all", q: "" };
    const parsed = JSON.parse(raw) as { folder?: string; q?: string };
    const folder = parsed.folder && FOLDER_IDS.has(parsed.folder as FolderId) ? (parsed.folder as FolderId) : "all";
    return { folder, q: typeof parsed.q === "string" ? parsed.q : "" };
  } catch {
    return { folder: "all", q: "" };
  }
}

export function Sidebar({
  activeId, onSelect, mobile = false, onNavigate,
}: { activeId: string; onSelect: (c: Conversation) => void; mobile?: boolean; onNavigate?: () => void }) {
  const [folder, setFolder] = useState<FolderId>("all");
  const [q, setQ] = useState("");
  const [hydrated, setHydrated] = useState(false);
  // Real unread state — starts from data, decremented as user opens conversations.
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(conversations.map((c) => [c.id, c.unread ?? 0])),
  );

  // Hydrate persisted filter + query once on mount (client-only).
  useEffect(() => {
    const p = loadPrefs();
    setFolder(p.folder);
    setQ(p.q);
    setHydrated(true);
  }, []);

  // Persist filter + query whenever they change (after hydration).
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ folder, q }));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [folder, q, hydrated]);

  // Clear unread for the active conversation (real state, not placeholder).
  useEffect(() => {
    setUnreadMap((prev) => (prev[activeId] ? { ...prev, [activeId]: 0 } : prev));
  }, [activeId]);

  // Enriched conversations with live unread values.
  const items = useMemo(
    () => conversations.map((c) => ({ ...c, unread: unreadMap[c.id] ?? 0 })),
    [unreadMap],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0, dms: 0, ams: 0, projects: 0, depts: 0 };
    for (const x of items) {
      c.all += x.unread ?? 0;
      c[x.folder] = (c[x.folder] ?? 0) + (x.unread ?? 0);
    }
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const qu = q.trim().toUpperCase();
    return items.filter((c) => {
      const inFolder = folder === "all" || c.folder === folder;
      if (!inFolder) return false;
      if (!qu) return true;
      return [c.id, c.department, c.module, c.project, c.ams, c.assignee, c.role]
        .filter(Boolean).some((v) => v!.toUpperCase().includes(qu));
    });
  }, [items, folder, q]);

  // Build a flat row list (headers + items) so we can virtualize a single list.
  const rows: Row[] = useMemo(() => {
    const critical = filtered.filter((c) => c.priority === "P0" || c.health === "crit");
    const critSet = new Set(critical.map((c) => c.id));
    const pinned = filtered.filter((c) => c.pinned && !critSet.has(c.id));
    const pinSet = new Set(pinned.map((c) => c.id));
    const waiting = filtered.filter((c) => c.waiting && !critSet.has(c.id) && !pinSet.has(c.id));
    const waitSet = new Set(waiting.map((c) => c.id));
    const rest = filtered.filter((c) => !critSet.has(c.id) && !pinSet.has(c.id) && !waitSet.has(c.id));

    const out: Row[] = [];
    const push = (label: string, list: Conversation[], icon?: Row extends { icon?: infer I } ? I : never, tone?: "crit") => {
      if (!list.length) return;
      out.push({ kind: "header", id: `h:${label}`, label, tone, icon: icon as any });
      for (const c of list) out.push({ kind: "conv", id: c.id, conv: c });
    };
    push("Critical · Needs attention", critical, AlertTriangle as any, "crit");
    push("Pinned", pinned, Pin as any);
    push("Waiting", waiting, Clock as any);
    push("Conversations", rest);
    return out;
  }, [filtered]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const folderRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => (rows[i]?.kind === "header" ? 34 : 92),
    overscan: 8,
    getItemKey: (i) => rows[i].id,
  });
  const virtualItems = virtualizer.getVirtualItems();

  // ── Keyboard nav across list ─────────────────────────────────────────────
  const convRowIndices = useMemo(
    () => rows.reduce<number[]>((acc, r, i) => (r.kind === "conv" ? (acc.push(i), acc) : acc), []),
    [rows],
  );
  const [focusedConvId, setFocusedConvId] = useState<string | null>(null);

  // Clamp / clear focused id if it's no longer in the filtered list.
  useEffect(() => {
    if (focusedConvId && !convRowIndices.some((i) => (rows[i] as { conv: Conversation }).conv.id === focusedConvId)) {
      setFocusedConvId(null);
    }
  }, [rows, convRowIndices, focusedConvId]);

  const focusConvAtPos = useCallback(
    (pos: number) => {
      if (convRowIndices.length === 0) return;
      const clamped = Math.max(0, Math.min(convRowIndices.length - 1, pos));
      const rowIdx = convRowIndices[clamped];
      const conv = (rows[rowIdx] as { conv: Conversation }).conv;
      setFocusedConvId(conv.id);
      virtualizer.scrollToIndex(rowIdx, { align: "auto" });
    },
    [convRowIndices, rows, virtualizer],
  );

  // After render, move real DOM focus to the target conv row (post-virtualization mount).
  useEffect(() => {
    if (!focusedConvId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLButtonElement>(
      `[data-conv-id="${(window as unknown as { CSS?: { escape?: (s: string) => string } }).CSS?.escape?.(focusedConvId) ?? focusedConvId}"]`,
    );
    if (el && document.activeElement !== el) el.focus();
  }, [focusedConvId, virtualItems]);

  const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (q) setQ("");
      else searchRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusConvAtPos(0);
    }
  };

  const handleFolderKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + folders.length) % folders.length;
      folderRefs.current[next]?.focus();
      setFolder(folders[next].id);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusConvAtPos(0);
    } else if (e.key === "Escape") {
      e.preventDefault();
      searchRef.current?.focus();
    }
  };

  const handleConvKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, convId: string) => {
    const currentPos = convRowIndices.findIndex(
      (i) => (rows[i] as { conv: Conversation }).conv.id === convId,
    );
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusConvAtPos(currentPos + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentPos <= 0) {
        setFocusedConvId(null);
        searchRef.current?.focus();
      } else {
        focusConvAtPos(currentPos - 1);
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      focusConvAtPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusConvAtPos(convRowIndices.length - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setFocusedConvId(null);
      if (q) setQ("");
      searchRef.current?.focus();
    }
    // Enter / Space: native <button> click handler opens the conversation.
  };


  return (
    <aside className={`panel-dark h-full shrink-0 flex-col border-r border-sidebar-border animate-panel-in ${mobile ? "flex w-full" : "hidden w-[clamp(272px,19vw,312px)] md:flex"}`}>
      {/* Workspace */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="avatar-3d plate-gold grid h-10 w-10 place-items-center rounded-xl text-[oklch(0.2_0.05_265)] font-black">
          SV
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight leading-none">
            Software Vala <ChevronDown className="h-3.5 w-3.5 text-sidebar-muted" />
          </div>
          <div className="mt-1 truncate font-mono text-[10.5px] uppercase tracking-wider text-sidebar-muted">
            WS-SV-PRIME · ENT
          </div>
        </div>
        <IconBtn ariaLabel="Notifications"><Bell className="h-4 w-4" /></IconBtn>
        <IconBtn ariaLabel="Settings"><Settings className="h-4 w-4" /></IconBtn>
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-muted" />
          <input
            ref={searchRef}
            data-shortcut="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="User · AMS · PRJ · DPT · MOD · TAG"
            aria-label="Search by ID. Arrow down to enter list, Escape to clear."
            className="h-10 w-full rounded-xl border border-sidebar-border bg-sidebar-surface pl-9 pr-16 font-mono text-[12px] tracking-wide outline-none transition-all placeholder:text-sidebar-muted/70 focus:border-gold/60 focus:ring-4 focus:ring-gold/10"
          />
          {q ? (
            <button aria-label="Clear search" onClick={() => setQ("")} className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-sidebar-muted hover:bg-sidebar-surface-hover">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-sidebar-border bg-sidebar px-1.5 py-0.5 text-[10px] font-medium text-sidebar-muted md:flex">⌘K</kbd>
          )}
        </div>
        <div className="mt-1 px-1 text-[9.5px] uppercase tracking-wider text-sidebar-muted">
          ID-only index · zero PII
        </div>
      </div>

      {/* Folders */}
      <div className="flex items-center gap-1 px-4 pb-2">
        {folders.map((f, idx) => {
          const Icon = f.icon;
          const active = folder === f.id;
          const n = counts[f.id] ?? 0;
          return (
            <button
              key={f.id}
              ref={(el) => { folderRefs.current[idx] = el; }}
              onClick={() => setFolder(f.id)}
              onKeyDown={(e) => handleFolderKeyDown(e, idx)}
              title={f.hint}
              aria-pressed={active}
              className={`relative flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-panel ${
                active
                  ? "bg-gold text-[oklch(0.2_0.05_265)] shadow-[var(--shadow-glow)]"
                  : "text-sidebar-muted hover:bg-sidebar-surface-hover hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {f.label}
              {n > 0 && (
                <span className={`ml-0.5 rounded-full px-1 text-[9px] font-black tabular-nums ${
                  active ? "bg-[oklch(0.2_0.05_265)] text-gold" : "bg-sidebar-surface text-foreground/80"
                }`}>{n}</span>
              )}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1">
          <IconBtn size="sm" ariaLabel="Filter"><SlidersHorizontal className="h-3.5 w-3.5" /></IconBtn>
          <button aria-label="New conversation" className="grid h-7 w-7 place-items-center rounded-md bg-gold/20 text-gold transition-all hover:bg-gold/30">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Virtualized list */}
      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-3">
        {rows.length === 0 ? (
          <div className="mt-6 px-3 text-center text-[11px] text-sidebar-muted">
            No matches. Try a User ID, AMS ID, or Project ID.
          </div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
            {virtualItems.map((vi) => {
              const row = rows[vi.index];
              return (
                <div
                  key={vi.key}
                  ref={virtualizer.measureElement}
                  data-index={vi.index}
                  style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${vi.start}px)` }}
                >
                  {row.kind === "header" ? (
                    <SectionLabel tone={row.tone} Icon={row.icon}>{row.label}</SectionLabel>
                  ) : (
                    <ConvRow
                      c={row.conv}
                      active={row.conv.id === activeId}
                      onClick={() => { setFocusedConvId(row.conv.id); onSelect(row.conv); onNavigate?.(); }}
                      onKeyDown={(e) => handleConvKeyDown(e, row.conv.id)}
                      tabIndex={focusedConvId === row.conv.id || (focusedConvId === null && row.conv.id === activeId) ? 0 : -1}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Self identity */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-surface p-2.5">
          <div className="relative shrink-0">
            <div className="avatar-3d plate-gold grid h-9 w-9 place-items-center rounded-xl text-[14px] font-black text-[oklch(0.2_0.05_265)]">
              <Crown className="h-4 w-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate font-mono text-[12px] font-bold tracking-wide">BOSS-000001</span>
              <ShieldCheck className="h-3 w-3 shrink-0 text-gold" />
            </div>
            <div className="mt-0.5 truncate text-[10.5px] text-sidebar-muted">DPT-LEAD · MOD-EXEC · Active</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({
  children, tone, Icon,
}: { children: React.ReactNode; tone?: "crit"; Icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] ${
      tone === "crit" ? "text-rose-400" : "text-sidebar-muted"
    }`}>
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </div>
  );
}

function IconBtn({ children, size = "md", ariaLabel }: { children: React.ReactNode; size?: "md" | "sm"; ariaLabel?: string }) {
  const d = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <button aria-label={ariaLabel} className={`grid ${d} place-items-center rounded-lg text-sidebar-muted transition-all hover:bg-sidebar-surface-hover hover:text-foreground active:scale-95`}>
      {children}
    </button>
  );
}

/* ─── Avatar system: distinct shape per entity kind ─── */
function EntityAvatar({ c, active }: { c: Conversation; active: boolean }) {
  const r = c.role ? ROLE[c.role] : null;

  const shape =
    c.kind === "PRJ"  ? "rounded-lg" :
    c.kind === "DEPT" ? "rounded-md rotate-3" :
    c.kind === "MOD"  ? "rounded-md" :
    c.role === "AI"   ? "rounded-[10px] rotate-45" :
    "rounded-2xl";

  const contentRotate = c.role === "AI" ? "-rotate-45" : c.kind === "DEPT" ? "-rotate-3" : "";

  const bg =
    active                    ? "bg-white/95 text-[oklch(0.3_0.12_295)]" :
    c.role === "FND"          ? "bg-yellow-400/20 text-yellow-700 border-2 border-yellow-400/70" :
    c.role === "BOSS"         ? "bg-amber-400/15 text-amber-700 border-2 border-amber-400/70" :
    c.role === "AI"           ? "bg-cyan-500/15 text-cyan-700 border-2 border-cyan-500/70" :
    c.kind === "PRJ"          ? "bg-violet-500/15 text-violet-700 border-2 border-violet-500/60" :
    c.kind === "DEPT"         ? "bg-teal-500/15 text-teal-700 border-2 border-teal-500/60" :
    c.kind === "MOD"          ? "bg-slate-500/15 text-slate-700 border-2 border-slate-500/60" :
    r                         ? `${r.bg} ${r.ring} ${r.text} border-2` :
    "bg-[oklch(0.95_0.05_295)] text-[oklch(0.3_0.12_295)]";

  const Glyph: React.ReactNode =
    c.role === "AI"   ? <Bot className="h-[18px] w-[18px]" /> :
    c.role === "FND"  ? <Crown className="h-[18px] w-[18px]" /> :
    c.role === "BOSS" ? <Crown className="h-[18px] w-[18px]" /> :
    c.kind === "PRJ"  ? <Folder className="h-[18px] w-[18px]" /> :
    c.kind === "DEPT" ? <Building2 className="h-[18px] w-[18px]" /> :
    c.kind === "MOD"  ? <Hash className="h-[18px] w-[18px]" /> :
    c.kind === "AMS"  ? <Ticket className="h-[18px] w-[18px]" /> :
    r                 ? <span className="text-[15px] leading-none">{r.icon}</span> :
    <span className="text-[15px]">#</span>;

  return (
    <div className="relative shrink-0">
      <div className={`avatar-3d grid h-11 w-11 place-items-center ${shape} ${bg}`}>
        <span className={contentRotate}>{Glyph}</span>
      </div>
      {c.presence && c.kind === "USER" && (
        <span
          aria-label={PRESENCE_META[c.presence].label}
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ${active ? "ring-[oklch(0.76_0.12_258)]" : "ring-white"} ${PRESENCE_META[c.presence].dot}`}
        />
      )}
    </div>
  );
}

function ConvRow({ c, active, onClick, onKeyDown, tabIndex }: { c: Conversation; active: boolean; onClick: () => void; onKeyDown?: (e: ReactKeyboardEvent<HTMLButtonElement>) => void; tabIndex?: number }) {
  const Live = c.live ? LIVE_META[c.live] : null;
  const LiveIcon = Live?.icon;

  const kindTag =
    c.kind === "AMS"  ? "AMS" :
    c.kind === "PRJ"  ? "PRJ" :
    c.kind === "DEPT" ? "DPT" :
    c.kind === "MOD"  ? "MOD" :
    c.role ?? "USR";

  const priCls = c.priority ? PRIORITY[c.priority].cls : "";

  return (
    <button
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      data-conv-id={c.id}
      aria-current={active ? "true" : undefined}
      aria-label={`${c.id} — ${c.department}${c.priority ? `, priority ${c.priority}` : ""}${c.unread ? `, ${c.unread} unread` : ""}. Enter to open.`}
      className={`group relative mx-1 my-1 grid w-[calc(100%-0.5rem)] grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 ${
        active
          ? "bg-gradient-to-br from-[oklch(0.86_0.09_258)] to-[oklch(0.74_0.13_262)] text-[oklch(0.2_0.06_265)] shadow-[0_14px_36px_-12px_oklch(0.55_0.16_262/0.55),inset_0_1px_0_oklch(1_0_0/0.5)]"
          : "bg-white text-[oklch(0.2_0.04_280)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_30px_-14px_oklch(0.2_0.04_280/0.45)]"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[oklch(0.2_0.06_265)] transition-all duration-200 ${
          active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
        }`}
      />

      <EntityAvatar c={c} active={active} />

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-mono text-[12.5px] font-bold tracking-wide">{c.id}</span>
          {c.verified && <ShieldCheck className={`h-3 w-3 shrink-0 ${active ? "text-[oklch(0.3_0.06_265)]" : "text-[oklch(0.55_0.2_295)]"}`} />}
          {c.muted && <VolumeX className="h-3 w-3 shrink-0 opacity-60" />}
          {c.priority && (
            <span className={`ml-1 inline-flex h-[15px] shrink-0 items-center rounded-[4px] px-1 text-[9px] font-black tracking-wider ${
              active ? "bg-[oklch(0.2_0.06_265)] text-[oklch(0.86_0.09_258)]" : priCls
            }`}>{c.priority}</span>
          )}
          <span className={`ml-auto shrink-0 font-mono text-[10px] font-semibold tabular-nums ${
            active ? "text-[oklch(0.3_0.06_265)]/80" : "text-muted-foreground"
          }`}>{c.lastTime}</span>
        </div>

        <div className={`mt-0.5 flex items-center gap-1 truncate text-[11px] leading-tight ${
          active ? "text-[oklch(0.3_0.06_265)]/85" : "text-muted-foreground"
        }`}>
          {Live && LiveIcon ? (
            <span className={`inline-flex items-center gap-1 font-semibold ${active ? "" : Live.cls}`}>
              {c.live === "typing" ? (
                <span className="inline-flex gap-[2px]">
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce" />
                </span>
              ) : <LiveIcon className="h-3 w-3" />}
              {Live.label}
            </span>
          ) : (
            <span className="truncate">{c.lastPreview}</span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-1 overflow-hidden">
          <MetaChip active={active} tone="kind">{kindTag}</MetaChip>
          <MetaChip active={active} tone="dept" className="truncate">{c.department}</MetaChip>
          {c.assignee && <MetaChip active={active} tone="mute" className="truncate">↳ {c.assignee}</MetaChip>}
          {c.unread ? (
            <span className={`ml-auto inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-black tabular-nums ${
              active
                ? "bg-[oklch(0.2_0.06_265)] text-[oklch(0.86_0.09_258)]"
                : (c.priority === "P0" || c.health === "crit")
                  ? "bg-rose-500 text-white shadow-[0_4px_10px_-2px_oklch(0.6_0.16_30/0.6)]"
                  : "bg-[oklch(0.2_0.06_265)] text-white"
            }`}>
              {c.unread}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function MetaChip({
  children, active, tone, className = "",
}: { children: React.ReactNode; active: boolean; tone: "kind" | "dept" | "mute"; className?: string }) {
  const cls = active
    ? "bg-white/70 text-[oklch(0.3_0.06_265)]"
    : tone === "kind"
      ? "bg-[oklch(0.2_0.06_265)]/8 text-[oklch(0.28_0.08_280)] border border-[oklch(0.2_0.06_265)]/12"
      : tone === "dept"
        ? "bg-[oklch(0.95_0.05_295)] text-[oklch(0.35_0.1_295)]"
        : "bg-transparent text-muted-foreground";
  return (
    <span className={`inline-flex max-w-full items-center rounded-[5px] px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider ${cls} ${className}`}>
      {children}
    </span>
  );
}
