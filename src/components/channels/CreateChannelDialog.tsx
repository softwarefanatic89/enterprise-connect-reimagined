import { useState } from "react";
import { Hash, Lock, MessageCircle, Users2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Channel, ChannelKind } from "./data";
import { DIRECTORY_IDS, nextChannelId } from "./data";

const KIND_OPTS: { id: ChannelKind; label: string; icon: typeof Hash; hint: string }[] = [
  { id: "public", label: "Public", icon: Hash, hint: "Anyone in the workspace can join" },
  { id: "private", label: "Private", icon: Lock, hint: "Invite-only membership" },
  { id: "dm", label: "Direct Message", icon: MessageCircle, hint: "1-to-1 conversation" },
  { id: "group", label: "Group", icon: Users2, hint: "Multi-person conversation" },
];

export function CreateChannelDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (channel: Channel) => void;
}) {
  const [kind, setKind] = useState<ChannelKind>("public");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  const isDm = kind === "dm";
  const canSubmit = isDm ? members.length === 1 : name.trim().length > 1;

  const reset = () => {
    setKind("public"); setName(""); setTopic(""); setDescription(""); setMembers([]);
  };

  const toggleMember = (id: string) => {
    setMembers((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id);
      if (isDm) return [id];
      return [...prev, id];
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const id = nextChannelId(isDm ? "CH-DM" : kind === "group" ? "CH-GRP" : "CH");
    const channel: Channel = {
      id,
      name: isDm ? members[0] : name.trim(),
      kind,
      topic: isDm ? "" : topic.trim(),
      description: isDm ? "" : description.trim(),
      memberIds: members,
      members: members.map((m, i) => ({ id: m, role: i === 0 && !isDm ? "owner" : "member", presence: "online" })),
      joined: true,
      pinned: false,
      muted: false,
      notification: "all",
      muteDuration: "1h",
      pinnedMessages: [],
      presence: isDm ? "online" : undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onCreate(channel);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg gap-5 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Create channel</DialogTitle>
          <DialogDescription className="text-[11.5px]">
            Set up a public/private channel, a direct message, or a group.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {KIND_OPTS.map((k) => {
            const Icon = k.icon;
            const active = kind === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => { setKind(k.id); setMembers([]); }}
                title={k.hint}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-[11px] font-semibold transition-all ${
                  active ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground hover:bg-surface-hover"
                }`}
              >
                <Icon className="h-4 w-4" />
                {k.label}
              </button>
            );
          })}
        </div>

        {!isDm && (
          <div className="space-y-3">
            <Field label="Channel name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. eng-platform"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Topic">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Short one-line topic"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this channel for?"
                rows={2}
                className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-[12.5px] outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
          </div>
        )}

        <Field label={isDm ? "Select a person" : "Initial members"}>
          <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-border p-2">
            {DIRECTORY_IDS.map((id) => {
              const active = members.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleMember(id)}
                  className={`rounded-md border px-2 py-1 font-mono text-[10.5px] transition-all ${
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground hover:bg-surface-hover"
                  }`}
                >
                  {id}
                </button>
              );
            })}
          </div>
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
