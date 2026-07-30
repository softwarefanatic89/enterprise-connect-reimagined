import { useState } from "react";
import { AtSign, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { Member, MemberGroup } from "./data";

export function Groups({
  groups, members, onCreate, onDelete,
}: {
  groups: MemberGroup[];
  members: Member[];
  onCreate: (name: string, memberIds: string[]) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const submit = () => {
    if (!name.trim() || picked.size === 0) return;
    onCreate(name.trim(), Array.from(picked));
    setName(""); setPicked(new Set()); setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-bold tracking-tight text-foreground">User Groups &amp; Mentions</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Manage @all, per-member and custom mention groups.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New group</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create custom group</DialogTitle>
              <DialogDescription>Group members for quick @mentions.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Design Reviewers" />
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
                {members.map((m) => (
                  <label key={m.id} className="flex cursor-pointer items-center gap-2.5 border-b border-border px-3 py-2 text-[12px] last:border-0 hover:bg-secondary/50">
                    <Checkbox checked={picked.has(m.id)} onCheckedChange={() => toggle(m.id)} />
                    <span>{m.avatarEmoji}</span>
                    <span className="font-medium text-foreground">{m.displayName}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">{m.id}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={submit} disabled={!name.trim() || picked.size === 0}>Create group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <div key={g.id} className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[12.5px] font-bold text-foreground">{g.name}</div>
                <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-primary"><AtSign className="h-3 w-3" />{g.mention.replace("@", "")}</div>
              </div>
              {!g.isSystem && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(g.id)} aria-label={`Delete ${g.name}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Users className="h-3.5 w-3.5" /> {g.memberIds.length} members</div>
            <div className="flex flex-wrap gap-1">
              {g.memberIds.slice(0, 6).map((id) => {
                const m = members.find((x) => x.id === id);
                return m ? <Badge key={id} variant="secondary" className="text-[9.5px]">{m.displayName}</Badge> : null;
              })}
              {g.memberIds.length > 6 && <Badge variant="outline" className="text-[9.5px]">+{g.memberIds.length - 6} more</Badge>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
