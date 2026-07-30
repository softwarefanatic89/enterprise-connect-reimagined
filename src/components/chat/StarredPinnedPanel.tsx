import { Pin, Star, ArrowRight, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ROLE, type Message } from "./data";

function PanelList({
  items, emptyLabel, onJump, icon,
}: {
  items: Message[];
  emptyLabel: string;
  onJump: (id: string) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="max-h-72 overflow-y-auto scrollbar-thin">
      {items.length === 0 && (
        <div className="flex flex-col items-center gap-1.5 py-8 text-center text-[11.5px] text-muted-foreground">
          {icon}
          {emptyLabel}
        </div>
      )}
      {items.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onJump(m.id)}
          className="flex w-full items-start gap-2 border-b border-border-soft px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-surface-hover"
        >
          <span className="mt-0.5 text-[13px]">{ROLE[m.role].icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="font-mono font-bold">{m.senderId}</span>
              <span className="text-muted-foreground">{m.time}</span>
            </div>
            <div className="truncate text-[11.5px]">{m.text || `(${m.attachment?.kind ?? "message"})`}</div>
          </div>
          <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}

export function PinnedPanel({ messages, onJump }: { messages: Message[]; onJump: (id: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Pinned messages"
          aria-label="Pinned messages"
          className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground"
        >
          <Pin className="h-4 w-4" />
          {messages.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
              {messages.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Pin className="h-3.5 w-3.5 text-primary" /> Pinned messages
        </div>
        <PanelList items={messages} onJump={onJump} emptyLabel="No pinned messages yet" icon={<Pin className="h-5 w-5 text-muted-foreground/50" />} />
      </PopoverContent>
    </Popover>
  );
}

export function StarredPanel({ messages, onJump }: { messages: Message[]; onJump: (id: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Starred messages"
          aria-label="Starred messages"
          className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground"
        >
          <Star className="h-4 w-4" />
          {messages.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-gold text-[8px] font-bold text-foreground">
              {messages.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Star className="h-3.5 w-3.5 text-gold" /> Starred messages
        </div>
        <PanelList items={messages} onJump={onJump} emptyLabel="No starred messages yet" icon={<Star className="h-5 w-5 text-muted-foreground/50" />} />
      </PopoverContent>
    </Popover>
  );
}
