import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Smile, ChevronDown, Star, X } from "lucide-react";
import {
  EXPRESSIONS, EXPRESSION_ROLE_LIST, getStoredRole, setStoredRole,
  type Expression, type ExpressionRole,
} from "./expressions";

const RECENT_KEY = "sv-expression-recent";

function loadRecent(): Expression[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as Expression[]).slice(0, 16) : [];
  } catch { return []; }
}
function saveRecent(list: Expression[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 16)));
  }
}

export function ExpressionPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<ExpressionRole>(() => getStoredRole());
  const [tab, setTab] = useState<string>("");
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<Expression[]>(() => loadRecent());
  const [roleMenu, setRoleMenu] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const pack = EXPRESSIONS[role];
  const cats = pack.categories;
  const activeTab = tab || cats[0].name;

  useEffect(() => { setTab(cats[0].name); }, [role]); // eslint-disable-line

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const filtered = useMemo<Expression[] | null>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    const seen = new Set<string>();
    const out: Expression[] = [];
    for (const c of cats) for (const it of c.items) {
      if (it.label.toLowerCase().includes(term) && !seen.has(it.label)) {
        seen.add(it.label); out.push(it);
      }
    }
    return out;
  }, [q, cats]);

  const pick = (it: Expression) => {
    onPick(it.emoji);
    const next = [it, ...recent.filter((r) => r.label !== it.label)].slice(0, 16);
    setRecent(next); saveRecent(next);
  };

  const chooseRole = (r: ExpressionRole) => {
    setRole(r); setStoredRole(r); setRoleMenu(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={`Expressions · ${pack.title}`}
        aria-label={`Expressions for ${pack.title}`}
        aria-expanded={open}
        className={`press grid h-9 w-9 place-items-center rounded-lg transition-all active:scale-95 ${
          open ? "bg-gold/15 text-gold" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        }`}
      >
        <Smile className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div className="popover-spring-in absolute bottom-12 left-0 z-30 w-[380px] overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_20px_60px_-12px_oklch(0.2_0.04_265/0.35),0_8px_24px_-8px_oklch(0.2_0.04_265/0.2)]">
          {/* Header — role badge + switcher */}
          <div className="relative flex items-center justify-between gap-2 border-b border-border/60 bg-gradient-to-r from-gold/[0.06] via-transparent to-transparent px-3 py-2.5">
            <button
              type="button"
              onClick={() => setRoleMenu((v) => !v)}
              className="group flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1 text-left transition-all hover:border-gold/40"
              title="Switch role expression pack"
            >
              <span className="grid h-6 w-6 place-items-center rounded-md bg-gold/15 text-[14px]">
                <span className="emoji-3d">{pack.icon}</span>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role</span>
                <span className={`text-[11.5px] font-bold ${pack.accent}`}>{pack.title}</span>
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-hover:text-foreground" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {roleMenu && (
              <div className="scrollbar-thin absolute left-3 top-[calc(100%+4px)] z-40 max-h-[240px] w-[220px] overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-[0_16px_40px_-12px_oklch(0.2_0.04_265/0.3)]">
                {EXPRESSION_ROLE_LIST.map((r) => {
                  const p = EXPRESSIONS[r];
                  const active = r === role;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => chooseRole(r)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] transition-all ${
                        active ? "bg-gold/12 text-foreground" : "hover:bg-surface-hover"
                      }`}
                    >
                      <span className="emoji-3d text-[14px]">{p.icon}</span>
                      <span className={`font-semibold ${active ? p.accent : "text-foreground"}`}>{p.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="border-b border-border/60 px-3 py-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 focus-within:border-gold/50">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${pack.title.toLowerCase()} expressions…`}
                className="w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
                aria-label="Search expressions"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground" aria-label="Clear search">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs — hidden when searching */}
          {!filtered && (
            <div className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-border/60 px-2 py-1.5">
              {recent.length > 0 && (
                <TabBtn active={activeTab === "__recent"} onClick={() => setTab("__recent")}>
                  <Star className="h-3 w-3" /> Recent
                </TabBtn>
              )}
              {cats.map((c) => (
                <TabBtn key={c.name} active={activeTab === c.name} onClick={() => setTab(c.name)}>
                  {c.name}
                </TabBtn>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="scrollbar-thin max-h-[280px] overflow-y-auto p-2.5">
            {filtered ? (
              filtered.length > 0 ? (
                <Grid items={filtered} onPick={pick} />
              ) : (
                <Empty term={q} />
              )
            ) : activeTab === "__recent" ? (
              <Grid items={recent} onPick={pick} />
            ) : (
              <Grid items={cats.find((c) => c.name === activeTab)!.items} onPick={pick} />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/60 bg-surface/40 px-3 py-1.5 text-[9.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className={`emoji-3d ${pack.accent}`}>{pack.icon}</span>
              Role-aware · {pack.title}
            </span>
            <span className="font-semibold">Software Vala™</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-all ${
        active
          ? "border-gold/50 bg-gold/12 text-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Grid({ items, onPick }: { items: Expression[]; onPick: (e: Expression) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          onClick={() => onPick(it)}
          title={it.label}
          aria-label={it.label}
          className="group flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-center transition-all hover:-translate-y-0.5 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface text-[20px] shadow-[inset_0_1px_0_oklch(1_0_0/0.6),0_2px_6px_-2px_oklch(0.2_0.04_265/0.15)] transition-all group-hover:scale-110">
            <span className="emoji-3d">{it.emoji}</span>
          </span>
          <span className="line-clamp-1 text-[9.5px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function Empty({ term }: { term: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
      <span className="text-[24px]">🔎</span>
      <div className="text-[11.5px] font-semibold">No expression for "{term}"</div>
      <div className="text-[10px] text-muted-foreground">Try another keyword or switch role pack.</div>
    </div>
  );
}
