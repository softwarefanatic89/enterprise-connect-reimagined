import { useState } from "react";
import { Plus, Users, Trash2, CheckCircle2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SWATCHES, type Team, type Member } from "./data";

export function TeamsGrid({
  teams, members, activeTeamId, onSwitchTeam, onCreateTeam, onDeleteTeam,
}: {
  teams: Team[];
  members: Member[];
  activeTeamId: string;
  onSwitchTeam: (id: string) => void;
  onCreateTeam: (team: Omit<Team, "id" | "createdAt">) => void;
  onDeleteTeam: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [emoji, setEmoji] = useState("🚀");
  const [color, setColor] = useState(SWATCHES[0]);

  const countFor = (id: string) => members.filter((m) => m.teamId === id).length;

  const submit = () => {
    if (!name.trim()) return;
    onCreateTeam({ name: name.trim(), description: desc.trim() || "No description yet.", logoEmoji: emoji, color });
    setName(""); setDesc(""); setEmoji("🚀"); setColor(SWATCHES[0]);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-bold tracking-tight text-foreground">Teams</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Create, switch and manage your workspace teams.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-[12px]"><Plus className="h-3.5 w-3.5" /> New team</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create a new team</DialogTitle>
              <DialogDescription>Teams group members, channels and permissions.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl"
                  style={{ backgroundColor: `color-mix(in oklch, ${color} 18%, white)` }}
                >
                  {emoji}
                </div>
                <Input value={emoji} onChange={(e) => setEmoji(e.target.value.slice(0, 2))} className="w-16 text-center" aria-label="Team emoji" />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" aria-label="Team name" />
              </div>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Short description (optional)"
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-[13px] shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                {SWATCHES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-label={`Pick color ${s}`}
                    onClick={() => setColor(s)}
                    className="h-6 w-6 rounded-full ring-offset-2 ring-offset-background transition-all"
                    style={{ backgroundColor: s, boxShadow: color === s ? `0 0 0 2px ${s}` : undefined }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={submit} disabled={!name.trim()}>Create team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {teams.map((t) => {
          const active = t.id === activeTeamId;
          return (
            <div
              key={t.id}
              className={`group relative flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-all ${
                active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
              } bg-card`}
            >
              {active && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-accent-foreground">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              )}
              <div className="flex items-center gap-3">
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
                  style={{ backgroundColor: `color-mix(in oklch, ${t.color} 16%, white)` }}
                >
                  {t.logoEmoji}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold text-foreground">{t.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{t.id}</div>
                </div>
              </div>
              <p className="line-clamp-2 text-[11.5px] text-muted-foreground">{t.description}</p>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {countFor(t.id)} members
                </span>
                <div className="flex items-center gap-1.5">
                  {!active && (
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => onSwitchTeam(t.id)}>
                      Switch
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${t.name}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete “{t.name}”?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This removes the team and unassigns its {countFor(t.id)} members. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onDeleteTeam(t.id)}>
                          Delete team
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
