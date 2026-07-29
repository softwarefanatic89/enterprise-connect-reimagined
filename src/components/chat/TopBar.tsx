import {
  Search, Sparkles, Bell, Hourglass, Settings, Users,
  ShieldCheck, Command, SlidersHorizontal,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LanguageMenu } from "./LanguageMenu";
import { ViewPreferencesMenu } from "./ViewPreferencesMenu";


export function TopBar({ onOpenCommandPalette }: { onOpenCommandPalette?: () => void }) {
  return (
    <header className="panel-dark relative z-20 flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="avatar-3d plate-gold grid h-9 w-9 place-items-center rounded-xl text-[oklch(0.2_0.05_265)] font-black hover-wiggle">
          SV
        </div>

        <div className="hidden flex-col leading-tight md:flex">
          <span className="text-[12.5px] font-bold tracking-tight">Software Vala</span>
          <span className="font-mono text-[10px] text-sidebar-muted">Enterprise · WS-SV-PRIME</span>
        </div>
        <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-gold">
          <ShieldCheck className="h-2.5 w-2.5" /> Verified Workspace
        </span>
      </div>

      {/* Universal Search */}
      <div className="ml-4 hidden flex-1 max-w-xl md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-muted" />
          <input
            data-shortcut="search"
            readOnly
            onFocus={() => onOpenCommandPalette?.()}
            onClick={() => onOpenCommandPalette?.()}
            aria-label="Open global search"
            placeholder="Universal Search · User · AMS · PRJ · MOD · DPT · MSG ID"
            className="h-9 w-full cursor-pointer rounded-xl border border-sidebar-border bg-sidebar-surface pl-9 pr-16 font-mono text-[11.5px] tracking-wide outline-none transition-all placeholder:text-sidebar-muted/70 hover:border-gold/40 focus:border-gold/60 focus:ring-4 focus:ring-gold/10"
          />
          <kbd className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-sidebar-border bg-sidebar px-1.5 py-0.5 text-[10px] font-medium text-sidebar-muted">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </div>
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-1">
        <TBtn label="AI" accent>
          <Sparkles className="h-4 w-4" />
        </TBtn>

        <TBtn label="Waiting" badge="7" badgeTone="warn">
          <Hourglass className="h-4 w-4" />
        </TBtn>

        <TBtn label="Notifications" badge="3" badgeTone="danger">
          <Bell className="h-4 w-4" />
        </TBtn>

        <div className="mx-1 h-6 w-px bg-sidebar-border" />

        <LanguageMenu />

        <ViewPreferencesMenu />

        <div className="hidden items-center gap-1.5 rounded-lg border border-sidebar-border bg-sidebar-surface px-2 py-1 lg:flex">
          <Users className="h-3.5 w-3.5 text-gold" />
          <span className="font-mono text-[10.5px] font-semibold tabular-nums">142</span>
          <span className="text-[10px] text-sidebar-muted">online</span>
        </div>

        <Link
          to="/chat-manager"
          title="Chat Manager"
          className="relative grid h-9 w-9 place-items-center rounded-lg text-gold transition-all hover:bg-gold/15 active:scale-95"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Link>

        <TBtn label="Settings">
          <Settings className="h-4 w-4" />
        </TBtn>

        {/* Self chip */}
        <div className="ml-2 hidden items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-surface py-1 pl-1 pr-2.5 sm:flex">
          <div className="relative">
            <div className="avatar-3d plate-gold grid h-7 w-7 place-items-center rounded-lg text-[14px] text-[oklch(0.2_0.05_265)]">
              <span className="emoji-3d">👑</span>
            </div>

            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[--color-success] ring-2 ring-sidebar" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-[11px] font-bold tracking-wide">BOSS-000001</span>
            <span className="text-[9.5px] text-sidebar-muted">DPT-LEAD · Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function TBtn({
  children, label, badge, badgeTone, accent,
}: {
  children: React.ReactNode;
  label: string;
  badge?: string;
  badgeTone?: "danger" | "warn";
  accent?: boolean;
}) {
  const badgeCls =
    badgeTone === "danger"
      ? "bg-[--color-destructive] text-white"
      : "bg-gold text-[oklch(0.2_0.05_265)]";
  return (
    <button
      title={label}
      className={`relative grid h-9 w-9 place-items-center rounded-lg transition-all active:scale-95 ${
        accent
          ? "text-gold hover:bg-gold/15"
          : "text-sidebar-muted hover:bg-sidebar-surface-hover hover:text-foreground"
      }`}
    >
      {children}
      {badge && (
        <span className={`absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[9px] font-bold ${badgeCls} ring-2 ring-sidebar`}>
          {badge}
        </span>
      )}
    </button>
  );
}
