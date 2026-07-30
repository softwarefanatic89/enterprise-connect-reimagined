import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Plus, Hash, Lock, MessageCircle, Users2, Pin, BellOff, X, LayoutList,
} from "lucide-react";
import { TopBar } from "@/components/chat/TopBar";
import { ChannelRow } from "@/components/channels/ChannelList";
import { CreateChannelDialog } from "@/components/channels/CreateChannelDialog";
import { RenameChannelDialog } from "@/components/channels/RenameChannelDialog";
import { DeleteChannelDialog } from "@/components/channels/DeleteChannelDialog";
import { ChannelDetailPanel } from "@/components/channels/ChannelDetailPanel";
import { initialChannels, type Channel, type MemberRole } from "@/components/channels/data";

export const Route = createFileRoute("/channels")({
  head: () => ({
    meta: [
      { title: "Channels & Direct Messages — Software Vala" },
      {
        name: "description",
        content: "Browse, create and manage public/private channels, direct messages and group conversations for the Software Vala workspace.",
      },
      { property: "og:title", content: "Channels & Direct Messages — Software Vala" },
      {
        property: "og:description",
        content: "Manage channels, DMs and groups: membership, pins, mutes, notifications and roles.",
      },
    ],
  }),
  component: ChannelsPage,
});

type FilterId = "all" | "public" | "dms" | "groups" | "pinned" | "muted";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "public", label: "Public" },
  { id: "dms", label: "DMs" },
  { id: "groups", label: "Groups" },
  { id: "pinned", label: "Pinned" },
  { id: "muted", label: "Muted" },
];

function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [filter, setFilter] = useState<FilterId>("all");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string>(initialChannels[0].id);

  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Channel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null);

  const active = channels.find((c) => c.id === activeId) ?? null;

  const updateChannel = (id: string, patch: Partial<Channel>) => {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const filtered = useMemo(() => {
    const qu = q.trim().toLowerCase();
    return channels.filter((c) => {
      if (qu) {
        const hit = [c.id, c.name, c.topic, c.description].filter(Boolean).some((v) => v!.toLowerCase().includes(qu));
        if (!hit) return false;
      }
      switch (filter) {
        case "public": return c.kind === "public" || c.kind === "private";
        case "dms": return c.kind === "dm";
        case "groups": return c.kind === "group";
        case "pinned": return c.pinned;
        case "muted": return c.muted;
        default: return true;
      }
    });
  }, [channels, filter, q]);

  const channelsList = filtered.filter((c) => c.kind === "public" || c.kind === "private");
  const dmsList = filtered.filter((c) => c.kind === "dm");
  const groupsList = filtered.filter((c) => c.kind === "group");

  const counts = useMemo(() => ({
    all: channels.length,
    public: channels.filter((c) => c.kind === "public" || c.kind === "private").length,
    dms: channels.filter((c) => c.kind === "dm").length,
    groups: channels.filter((c) => c.kind === "group").length,
    pinned: channels.filter((c) => c.pinned).length,
    muted: channels.filter((c) => c.muted).length,
  }), [channels]);

  const handleCreate = (channel: Channel) => {
    setChannels((prev) => [channel, ...prev]);
    setActiveId(channel.id);
  };

  const handleRename = (id: string, name: string) => updateChannel(id, { name });

  const handleDelete = (id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
    if (activeId === id) {
      setActiveId((prevActive) => {
        const remaining = channels.filter((c) => c.id !== id);
        return remaining[0]?.id ?? "";
      });
    }
  };

  const handleRemoveMember = (channelId: string, memberId: string) => {
    setChannels((prev) => prev.map((c) => c.id === channelId
      ? { ...c, memberIds: c.memberIds.filter((m) => m !== memberId), members: c.members.filter((m) => m.id !== memberId) }
      : c));
  };

  const handleAddMember = (channelId: string, memberId: string) => {
    setChannels((prev) => prev.map((c) => c.id === channelId
      ? {
          ...c,
          memberIds: [...c.memberIds, memberId],
          members: [...c.members, { id: memberId, role: "member" as MemberRole, presence: "online" as const }],
        }
      : c));
  };

  const handleChangeRole = (channelId: string, memberId: string, role: MemberRole) => {
    setChannels((prev) => prev.map((c) => c.id === channelId
      ? { ...c, members: c.members.map((m) => (m.id === memberId ? { ...m, role } : m)) }
      : c));
  };

  const handleUnpinMessage = (channelId: string, messageId: string) => {
    setChannels((prev) => prev.map((c) => c.id === channelId
      ? { ...c, pinnedMessages: c.pinnedMessages.filter((pm) => pm.id !== messageId) }
      : c));
  };

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar />

      <div className="flex min-h-0 flex-1">
        {/* Left: browser */}
        <div className="flex w-full min-w-0 flex-col border-r border-border md:w-[420px] lg:w-[480px]">
          <div className="space-y-3 border-b border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight">
                  <LayoutList className="h-4 w-4 text-primary" /> Channels & Messages
                </h1>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Browse, join and manage all conversations</p>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11.5px] font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> Create
              </button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search channels, topics, IDs…"
                className="h-9 w-full rounded-xl border border-input bg-transparent pl-9 pr-8 text-[12px] outline-none transition-all focus:ring-2 focus:ring-ring"
              />
              {q && (
                <button aria-label="Clear search" onClick={() => setQ("")} className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-surface-hover">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const activeF = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide transition-all ${
                      activeF ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:bg-surface-hover"
                    }`}
                  >
                    {f.label} <span className="ml-0.5 tabular-nums opacity-80">{counts[f.id]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto p-4">
            {channelsList.length > 0 && (filter === "all" || filter === "public" || filter === "pinned" || filter === "muted") && (
              <ListGroup icon={Hash} label="Channels">
                {channelsList.map((c) => (
                  <ChannelRow
                    key={c.id}
                    channel={c}
                    active={c.id === activeId}
                    onSelect={() => setActiveId(c.id)}
                    onJoinToggle={() => updateChannel(c.id, { joined: !c.joined })}
                    onPinToggle={() => updateChannel(c.id, { pinned: !c.pinned })}
                    onMuteToggle={() => updateChannel(c.id, { muted: !c.muted })}
                    onRename={() => setRenameTarget(c)}
                    onDelete={() => setDeleteTarget(c)}
                  />
                ))}
              </ListGroup>
            )}

            {dmsList.length > 0 && (filter === "all" || filter === "dms" || filter === "pinned" || filter === "muted") && (
              <ListGroup icon={MessageCircle} label="Direct Messages">
                {dmsList.map((c) => (
                  <ChannelRow
                    key={c.id}
                    channel={c}
                    active={c.id === activeId}
                    onSelect={() => setActiveId(c.id)}
                    onJoinToggle={() => updateChannel(c.id, { joined: !c.joined })}
                    onPinToggle={() => updateChannel(c.id, { pinned: !c.pinned })}
                    onMuteToggle={() => updateChannel(c.id, { muted: !c.muted })}
                    onRename={() => setRenameTarget(c)}
                    onDelete={() => setDeleteTarget(c)}
                  />
                ))}
              </ListGroup>
            )}

            {groupsList.length > 0 && (filter === "all" || filter === "groups" || filter === "pinned" || filter === "muted") && (
              <ListGroup icon={Users2} label="Group Messages">
                {groupsList.map((c) => (
                  <ChannelRow
                    key={c.id}
                    channel={c}
                    active={c.id === activeId}
                    onSelect={() => setActiveId(c.id)}
                    onJoinToggle={() => updateChannel(c.id, { joined: !c.joined })}
                    onPinToggle={() => updateChannel(c.id, { pinned: !c.pinned })}
                    onMuteToggle={() => updateChannel(c.id, { muted: !c.muted })}
                    onRename={() => setRenameTarget(c)}
                    onDelete={() => setDeleteTarget(c)}
                  />
                ))}
              </ListGroup>
            )}

            {channelsList.length === 0 && dmsList.length === 0 && groupsList.length === 0 && (
              <div className="mt-10 text-center text-[12px] text-muted-foreground">
                No conversations match your filters.
              </div>
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="hidden min-w-0 flex-1 md:block">
          {active ? (
            <ChannelDetailPanel
              channel={active}
              onUpdate={updateChannel}
              onRemoveMember={handleRemoveMember}
              onAddMember={handleAddMember}
              onChangeRole={handleChangeRole}
              onUnpinMessage={handleUnpinMessage}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
              Select a channel or conversation to view details.
            </div>
          )}
        </div>
      </div>

      <CreateChannelDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
      <RenameChannelDialog
        channel={renameTarget}
        open={!!renameTarget}
        onOpenChange={(v) => !v && setRenameTarget(null)}
        onRename={handleRename}
      />
      <DeleteChannelDialog
        channel={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ListGroup({
  icon: Icon, label, children,
}: { icon: typeof Hash; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
