import { useMemo, useState } from "react";
import { Search, X, Filter, Pin, Star, Paperclip, Link2, Image as ImageIcon, Calendar, User, Hash, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ROLE, type Message } from "./data";

export type SearchFilters = {
  from: string;
  channel: string;
  hasFile: boolean;
  hasLink: boolean;
  hasImage: boolean;
  pinnedOnly: boolean;
  starredOnly: boolean;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_FILTERS: SearchFilters = {
  from: "", channel: "", hasFile: false, hasLink: false, hasImage: false,
  pinnedOnly: false, starredOnly: false, dateFrom: "", dateTo: "",
};

export function MessageSearchDialog({
  open, onOpenChange, messages, starred, pinned, onJump, conversationId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  messages: Message[];
  starred: Set<string>;
  pinned: Set<string>;
  onJump: (id: string) => void;
  conversationId: string;
}) {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    return messages.filter((m) => {
      if (q && !(m.text ?? "").toLowerCase().includes(q.toLowerCase()) && !m.senderId.toLowerCase().includes(q.toLowerCase())) return false;
      if (filters.from && m.senderId !== filters.from) return false;
      if (filters.channel && m.module !== filters.channel && m.project !== filters.channel) return false;
      if (filters.hasFile && m.attachment?.kind !== "file") return false;
      if (filters.hasImage && m.attachment?.kind !== "image") return false;
      if (filters.hasLink && !(m.text ?? "").includes("http")) return false;
      if (filters.pinnedOnly && !pinned.has(m.id)) return false;
      if (filters.starredOnly && !starred.has(m.id)) return false;
      return true;
    });
  }, [q, filters, messages, pinned, starred]);

  const senders = useMemo(() => Array.from(new Set(messages.map((m) => m.senderId))), [messages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-[13px]">
            <Search className="h-4 w-4 text-primary" /> Search in {conversationId}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-border-soft px-4 py-2.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search messages, senders…"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold transition-colors ${showFilters ? "border-primary/50 bg-primary-soft text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            <Filter className="h-3 w-3" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 border-b border-border-soft bg-surface-hover/40 px-4 py-3 text-[11px]">
            <label className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-muted-foreground" />
              <select value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="min-w-0 flex-1 rounded-md border border-border bg-surface px-1.5 py-1 font-mono text-[10.5px]">
                <option value="">Any sender</option>
                {senders.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <input
                value={filters.channel}
                onChange={(e) => setFilters((f) => ({ ...f, channel: e.target.value }))}
                placeholder="Channel / module"
                className="min-w-0 flex-1 rounded-md border border-border bg-surface px-1.5 py-1 font-mono text-[10.5px] outline-none"
              />
            </label>
            <label className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} className="min-w-0 flex-1 rounded-md border border-border bg-surface px-1.5 py-1 text-[10.5px]" />
            </label>
            <label className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} className="min-w-0 flex-1 rounded-md border border-border bg-surface px-1.5 py-1 text-[10.5px]" />
            </label>
            <div className="col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
              <Chip active={filters.hasFile} onClick={() => setFilters((f) => ({ ...f, hasFile: !f.hasFile }))} icon={<Paperclip className="h-3 w-3" />}>File</Chip>
              <Chip active={filters.hasImage} onClick={() => setFilters((f) => ({ ...f, hasImage: !f.hasImage }))} icon={<ImageIcon className="h-3 w-3" />}>Image</Chip>
              <Chip active={filters.hasLink} onClick={() => setFilters((f) => ({ ...f, hasLink: !f.hasLink }))} icon={<Link2 className="h-3 w-3" />}>Link</Chip>
              <Chip active={filters.pinnedOnly} onClick={() => setFilters((f) => ({ ...f, pinnedOnly: !f.pinnedOnly }))} icon={<Pin className="h-3 w-3" />}>Pinned</Chip>
              <Chip active={filters.starredOnly} onClick={() => setFilters((f) => ({ ...f, starredOnly: !f.starredOnly }))} icon={<Star className="h-3 w-3" />}>Starred</Chip>
              <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>
        )}

        <div className="scrollbar-thin max-h-80 overflow-y-auto">
          {results.length === 0 && (
            <div className="py-10 text-center text-[12px] text-muted-foreground">No messages match your search.</div>
          )}
          {results.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { onJump(m.id); onOpenChange(false); }}
              className="flex w-full items-start gap-2.5 border-b border-border-soft px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-surface-hover"
            >
              <span className="mt-0.5 text-[14px]">{ROLE[m.role].icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10.5px]">
                  <span className="font-mono font-bold">{m.senderId}</span>
                  <span className="text-muted-foreground">{m.time}</span>
                  {pinned.has(m.id) && <Pin className="h-2.5 w-2.5 text-primary" />}
                  {starred.has(m.id) && <Star className="h-2.5 w-2.5 text-gold" />}
                </div>
                <div className="truncate text-[12.5px] text-foreground/90">{m.text || `(${m.attachment?.kind ?? "message"})`}</div>
              </div>
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Chip({ children, active, onClick, icon }: { children: React.ReactNode; active?: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${active ? "border-primary/50 bg-primary-soft text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
    >
      {icon}{children}
    </button>
  );
}
