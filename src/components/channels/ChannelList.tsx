import {
  Hash, Lock, MessageCircle, Users2, Pin, PinOff, Bell, BellOff, LogIn, LogOut,
  MoreHorizontal, Pencil, Trash2, Users,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Channel } from "./data";
import { PRESENCE_META } from "./data";

const KIND_META: Record<Channel["kind"], { icon: typeof Hash; label: string }> = {
  public: { icon: Hash, label: "Public" },
  private: { icon: Lock, label: "Private" },
  dm: { icon: MessageCircle, label: "Direct message" },
  group: { icon: Users2, label: "Group" },
};

export function ChannelRow({
  channel, active, onSelect, onJoinToggle, onPinToggle, onMuteToggle, onRename, onDelete,
}: {
  channel: Channel;
  active: boolean;
  onSelect: () => void;
  onJoinToggle: () => void;
  onPinToggle: () => void;
  onMuteToggle: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const KindIcon = KIND_META[channel.kind].icon;
  const isDmLike = channel.kind === "dm" || channel.kind === "group";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(); }}
      className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
        active ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border bg-card hover:bg-surface-hover"
      }`}
    >
      <div className="relative shrink-0">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${
          channel.kind === "group" ? "bg-violet-500/10 text-violet-600" : channel.kind === "dm" ? "bg-sky-500/10 text-sky-600" : "bg-primary/10 text-primary"
        }`}>
          <KindIcon className="h-4 w-4" />
        </div>
        {channel.kind === "dm" && channel.presence && (
          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${PRESENCE_META[channel.presence].dot}`} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-[12.5px] font-bold tracking-tight ${isDmLike ? "" : ""}`}>
            {channel.kind === "public" || channel.kind === "private" ? `#${channel.name}` : channel.name}
          </span>
          {channel.pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
          {channel.muted && <BellOff className="h-3 w-3 shrink-0 text-muted-foreground" />}
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">{channel.id}</span>
        </div>
        {channel.topic ? (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{channel.topic}</p>
        ) : (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {channel.kind === "dm" ? "Direct message" : "Group message"} · {channel.members.length} members
          </p>
        )}
      </div>

      {!isDmLike && (
        <div className="hidden shrink-0 items-center gap-1 text-[10.5px] text-muted-foreground sm:flex">
          <Users className="h-3 w-3" /> {channel.members.length}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <IconToggle
          title={channel.pinned ? "Unpin channel" : "Pin channel"}
          active={channel.pinned}
          onClick={onPinToggle}
        >
          {channel.pinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
        </IconToggle>
        <IconToggle
          title={channel.muted ? "Unmute" : "Mute"}
          active={channel.muted}
          onClick={onMuteToggle}
        >
          {channel.muted ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
        </IconToggle>

        {!isDmLike && (
          <button
            title={channel.joined ? "Leave channel" : "Join channel"}
            onClick={onJoinToggle}
            className={`hidden items-center gap-1 rounded-lg border px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide transition-all sm:flex ${
              channel.joined ? "border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive" : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {channel.joined ? <LogOut className="h-3 w-3" /> : <LogIn className="h-3 w-3" />}
            {channel.joined ? "Leave" : "Join"}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="More actions"
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {!isDmLike && (
              <DropdownMenuItem onClick={onJoinToggle} className="sm:hidden">
                {channel.joined ? <LogOut className="mr-2 h-3.5 w-3.5" /> : <LogIn className="mr-2 h-3.5 w-3.5" />}
                {channel.joined ? "Leave" : "Join"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function IconToggle({
  children, title, active, onClick,
}: { children: React.ReactNode; title: string; active: boolean; onClick: () => void }) {
  return (
    <button
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-md transition-all ${
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
