import { useEffect, useState } from "react";
import { Keyboard, X, Search, MessageSquare, HelpCircle, Command } from "lucide-react";

type Shortcut = { keys: string[]; label: string; icon: React.ComponentType<{ className?: string }> };

const SHORTCUTS: Shortcut[] = [
  { keys: ["⌘", "K"], label: "Focus chat search", icon: Search },
  { keys: ["⌘", "⇧", "F"], label: "Focus message composer", icon: MessageSquare },
  { keys: ["⌘", "/"], label: "Toggle this help", icon: HelpCircle },
  { keys: ["Esc"], label: "Close menus / blur input", icon: X },
  { keys: ["Enter"], label: "Send message", icon: Command },
  { keys: ["⇧", "Enter"], label: "New line in message", icon: Command },
];

function focusBySelector(sel: string) {
  const el = document.querySelector<HTMLElement>(sel);
  if (!el) return;
  el.focus();
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.select?.();
}

export function ShortcutsLayer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) {
        if (e.key === "Escape") setOpen(false);
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "k" && !e.shiftKey) {
        e.preventDefault();
        focusBySelector('[data-shortcut="search"]');
      } else if (k === "f" && e.shiftKey) {
        e.preventDefault();
        focusBySelector('[data-shortcut="composer"]');
      } else if (k === "/") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (⌘/)"
        className="press fixed bottom-4 right-4 z-40 grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground shadow-[0_8px_24px_-12px_oklch(0.2_0.04_265/0.3)] transition-all hover:text-gold hover:shadow-[0_12px_32px_-12px_oklch(0.78_0.12_80/0.4)]"
      >
        <Keyboard className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[oklch(0.1_0.04_265/0.55)] backdrop-blur-sm animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] max-w-[92vw] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_80px_-30px_oklch(0.05_0.04_265/0.6)] animate-pop-in"
      >
        <div className="flex items-center justify-between border-b border-border-soft px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gold/15 text-gold">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold tracking-tight">Keyboard Shortcuts</div>
              <div className="font-mono text-[10px] text-muted-foreground">Software Vala · Quick Nav</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="press grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="divide-y divide-border-soft">
          {SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.label} className="flex items-center gap-3 px-5 py-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-background text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1 text-[12.5px] text-foreground">{s.label}</span>
                <span className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="inline-grid min-w-[22px] place-items-center rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-foreground shadow-[0_1px_0_0_oklch(1_0_0/0.5)_inset,0_1px_2px_0_oklch(0.2_0.04_265/0.15)]"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-border-soft px-5 py-2.5 text-center font-mono text-[10px] text-muted-foreground">
          Press <kbd className="rounded border border-border bg-background px-1 text-foreground">⌘/</kbd> anytime to toggle
        </div>
      </div>
    </div>
  );
}
