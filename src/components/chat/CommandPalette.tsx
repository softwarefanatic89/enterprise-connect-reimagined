import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  Clock, Hash, Pin, Star, MessageCircle, SlidersHorizontal, Keyboard, ShieldCheck, AlertTriangle, Hourglass,
} from "lucide-react";
import { conversations, type Conversation } from "./data";

const RECENTS_KEY = "sv.cmdk.recents.v1";
const FAVS_KEY = "sv.cmdk.favorites.v1";

function read(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => setFavs(read(FAVS_KEY)), []);
  const toggle = (id: string) =>
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(FAVS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  return { favs, toggle };
}

export function pushRecent(id: string) {
  try {
    const next = [id, ...read(RECENTS_KEY).filter((x) => x !== id)].slice(0, 6);
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function CommandPalette({
  open, onOpenChange, onSelectConversation,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelectConversation: (c: Conversation) => void;
}) {
  const { favs, toggle } = useFavorites();
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecents(read(RECENTS_KEY));
  }, [open]);

  const byId = useMemo(() => new Map(conversations.map((c) => [c.id, c])), []);
  const recentConvs = recents.map((id) => byId.get(id)).filter(Boolean) as Conversation[];
  const favConvs = favs.map((id) => byId.get(id)).filter(Boolean) as Conversation[];
  const pinned = conversations.filter((c) => c.pinned);
  const critical = conversations.filter((c) => c.priority === "P0" || c.health === "crit");
  const waiting = conversations.filter((c) => c.waiting);

  const pick = (c: Conversation) => {
    pushRecent(c.id);
    onSelectConversation(c);
    onOpenChange(false);
  };

  const Row = ({ c }: { c: Conversation }) => (
    <CommandItem key={c.id} value={`${c.id} ${c.department} ${c.module} ${c.project ?? ""}`} onSelect={() => pick(c)}>
      <Hash className="h-4 w-4 text-muted-foreground" />
      <span className="font-mono text-[12px] font-semibold">{c.id}</span>
      <span className="ml-1 truncate text-[11px] text-muted-foreground">{c.department} · {c.module}</span>
      <button
        type="button"
        aria-label={favs.includes(c.id) ? `Unfavorite ${c.id}` : `Favorite ${c.id}`}
        onClick={(e) => { e.stopPropagation(); toggle(c.id); }}
        className="ml-auto grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-primary"
      >
        <Star className={`h-3.5 w-3.5 ${favs.includes(c.id) ? "fill-primary text-primary" : ""}`} />
      </button>
    </CommandItem>
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search conversations, IDs, departments, modules…" aria-label="Command palette search" />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-1 py-6 text-center">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-[12.5px] font-semibold">No matches</span>
            <span className="text-[11px] text-muted-foreground">Try a workspace ID such as AMS, PRJ, DPT or MOD.</span>
          </div>
        </CommandEmpty>

        {favConvs.length > 0 && (
          <CommandGroup heading="Favorites">{favConvs.map((c) => <Row key={c.id} c={c} />)}</CommandGroup>
        )}
        {recentConvs.length > 0 && (
          <CommandGroup heading="Recent">{recentConvs.map((c) => <Row key={c.id} c={c} />)}</CommandGroup>
        )}
        {pinned.length > 0 && (
          <CommandGroup heading="Pinned">{pinned.map((c) => <Row key={c.id} c={c} />)}</CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="All conversations">
          {conversations.map((c) => <Row key={c.id} c={c} />)}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick filters">
          <CommandItem value="critical p0" onSelect={() => critical[0] && pick(critical[0])}>
            <AlertTriangle className="h-4 w-4 text-[--color-destructive]" />
            Jump to critical (P0)
            <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">{critical.length}</span>
          </CommandItem>
          <CommandItem value="waiting response" onSelect={() => waiting[0] && pick(waiting[0])}>
            <Hourglass className="h-4 w-4 text-[--color-warning]" />
            Jump to waiting on response
            <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">{waiting.length}</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Workspace">
          <CommandItem value="chat manager admin" onSelect={() => { onOpenChange(false); window.location.assign("/chat-manager"); }}>
            <SlidersHorizontal className="h-4 w-4" /> Open Chat Manager
          </CommandItem>
          <CommandItem value="keyboard shortcuts help" onSelect={() => { onOpenChange(false); window.dispatchEvent(new CustomEvent("sv:shortcuts")); }}>
            <Keyboard className="h-4 w-4" /> Keyboard shortcuts
          </CommandItem>
          <CommandItem value="compliance immutability" disabled>
            <ShieldCheck className="h-4 w-4 text-[--color-success]" /> Messages are immutable · edit &amp; delete disabled
          </CommandItem>
          <CommandItem value="recent activity" disabled>
            <Clock className="h-4 w-4" /> Audit trail available in Chat Manager
          </CommandItem>
          <CommandItem value="pinned indicator" disabled>
            <Pin className="h-4 w-4" /> Pin from the conversation header
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
