import { useEffect, useState } from "react";
import {
  Hash, Lock, MessageCircle, Users2, Pin, PinOff, Bell, BellOff, Check, X,
  Crown, ShieldCheck, UserMinus, UserPlus, ChevronUp, ChevronDown, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Channel, MemberRole, NotificationLevel, MuteDuration } from "./data";
import { PRESENCE_META, DIRECTORY_IDS } from "./data";

const KIND_META: Record<Channel["kind"], { icon: typeof Hash; label: string }> = {
  public: { icon: Hash, label: "Public channel" },
  private: { icon: Lock, label: "Private channel" },
  dm: { icon: MessageCircle, label: "Direct message" },
  group: { icon: Users2, label: "Group message" },
};

export function ChannelDetailPanel({
  channel, onUpdate, onRemoveMember, onAddMember, onChangeRole, onUnpinMessage,
}: {
  channel: Channel;
  onUpdate: (id: string, patch: Partial<Channel>) => void;
  onRemoveMember: (channelId: string, memberId: string) => void;
  onAddMember: (channelId: string, memberId: string) => void;
  onChangeRole: (channelId: string, memberId: string, role: MemberRole) => void;
  onUnpinMessage: (channelId: string, messageId: string) => void;
}) {
  const KindIcon = KIND_META[channel.kind].icon;
  const isDmLike = channel.kind === "dm";
  const [topic, setTopic] = useState(channel.topic);
  const [description, setDescription] = useState(channel.description);
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  useEffect(() => {
    setTopic(channel.topic);
    setDescription(channel.description);
    setAddPickerOpen(false);
  }, [channel.id]);

  const dirty = topic !== channel.topic || description !== channel.description;
  const availableToAdd = DIRECTORY_IDS.filter((id) => !channel.memberIds.includes(id));

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <KindIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold tracking-tight">{isDmLike ? channel.name : `#${channel.name}`}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{channel.id} · {KIND_META[channel.kind].label}</div>
          </div>
        </div>
      </div>

      {!isDmLike && (
        <Section title="Description & topic">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Topic</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[12px] outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <Button
            size="sm"
            disabled={!dirty}
            onClick={() => onUpdate(channel.id, { topic, description })}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" /> Save changes
          </Button>
        </Section>
      )}

      <Section title="Pinned messages">
        {channel.pinnedMessages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
            No pinned messages yet.
          </div>
        ) : (
          <div className="space-y-2">
            {channel.pinnedMessages.map((pm) => (
              <div key={pm.id} className="flex items-start gap-2 rounded-lg border border-border bg-surface p-2.5">
                <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10.5px] font-semibold">{pm.authorId}</span>
                    <span className="text-[10px] text-muted-foreground">{pm.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[11.5px] text-foreground/90">{pm.text}</p>
                </div>
                <button
                  aria-label="Unpin message"
                  onClick={() => onUnpinMessage(channel.id, pm.id)}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                >
                  <PinOff className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Notification settings">
        <label className="block space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notify me for</span>
          <Select
            value={channel.notification}
            onValueChange={(v: NotificationLevel) => onUpdate(channel.id, { notification: v })}
          >
            <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All messages</SelectItem>
              <SelectItem value="mentions">Mentions only</SelectItem>
              <SelectItem value="nothing">Nothing</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="block space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mute duration</span>
          <Select
            value={channel.muteDuration}
            onValueChange={(v: MuteDuration) => onUpdate(channel.id, { muteDuration: v })}
          >
            <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="8h">8 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="forever">Until turned back on</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <button
          onClick={() => onUpdate(channel.id, { muted: !channel.muted })}
          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-[11.5px] font-semibold transition-all ${
            channel.muted ? "border-warning/40 bg-warning/10 text-warning" : "border-border bg-surface text-muted-foreground hover:bg-surface-hover"
          }`}
        >
          <span className="flex items-center gap-1.5">
            {channel.muted ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
            {channel.muted ? "Muted" : "Unmuted"}
          </span>
          <span className="text-[10px] uppercase tracking-wider">Toggle</span>
        </button>
      </Section>

      {!isDmLike && (
        <Section title={`Members · ${channel.members.length}`}>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="border-b border-border bg-surface text-[9.5px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-2.5 py-2 text-left font-bold">Member</th>
                  <th className="px-2.5 py-2 text-left font-bold">Role</th>
                  <th className="px-2.5 py-2 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {channel.members.map((mem) => {
                  const pm = PRESENCE_META[mem.presence];
                  return (
                    <tr key={mem.id} className="border-b border-border last:border-0">
                      <td className="px-2.5 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${pm.dot}`} />
                          <span className="truncate font-mono text-[11px] font-semibold">{mem.id}</span>
                        </div>
                      </td>
                      <td className="px-2.5 py-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                          mem.role === "owner" ? "bg-primary/10 text-primary" : mem.role === "admin" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                        }`}>
                          {mem.role === "owner" && <Crown className="h-2.5 w-2.5" />}
                          {mem.role === "admin" && <ShieldCheck className="h-2.5 w-2.5" />}
                          {mem.role}
                        </span>
                      </td>
                      <td className="px-2.5 py-2">
                        <div className="flex items-center justify-end gap-1">
                          {mem.role === "member" && (
                            <ActionBtn title="Promote to admin" onClick={() => onChangeRole(channel.id, mem.id, "admin")}>
                              <ChevronUp className="h-3.5 w-3.5" />
                            </ActionBtn>
                          )}
                          {mem.role === "admin" && (
                            <ActionBtn title="Demote to member" onClick={() => onChangeRole(channel.id, mem.id, "member")}>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </ActionBtn>
                          )}
                          {mem.role !== "owner" && (
                            <ActionBtn title="Remove member" tone="danger" onClick={() => onRemoveMember(channel.id, mem.id)}>
                              <UserMinus className="h-3.5 w-3.5" />
                            </ActionBtn>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {addPickerOpen ? (
            <div className="space-y-2 rounded-lg border border-border p-2">
              {availableToAdd.length === 0 ? (
                <div className="p-1 text-center text-[11px] text-muted-foreground">Everyone is already a member.</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {availableToAdd.map((id) => (
                    <button
                      key={id}
                      onClick={() => { onAddMember(channel.id, id); setAddPickerOpen(false); }}
                      className="rounded-md border border-border bg-surface px-2 py-1 font-mono text-[10.5px] hover:bg-surface-hover"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setAddPickerOpen(false)} className="text-[10.5px] font-semibold text-muted-foreground hover:text-foreground">
                <X className="mr-1 inline h-3 w-3" /> Cancel
              </button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setAddPickerOpen(true)} className="gap-1.5">
              <UserPlus className="h-3.5 w-3.5" /> Add member
            </Button>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-b border-border p-4">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function ActionBtn({
  children, title, tone, onClick,
}: { children: React.ReactNode; title: string; tone?: "danger"; onClick: () => void }) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`grid h-6 w-6 place-items-center rounded-md transition-all ${
        tone === "danger" ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
