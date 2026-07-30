import { useState } from "react";
import { Mail, Plus, X, RotateCcw, Ban, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ROLE_NAMES, type PendingInvite, type Team } from "./data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteUsers({
  invites, teams, activeTeamId, onInvite, onResend, onRevoke,
}: {
  invites: PendingInvite[];
  teams: Team[];
  activeTeamId: string;
  onInvite: (emails: string[], role: PendingInvite["role"], teamId: string) => void;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<PendingInvite["role"]>("Member");
  const [teamId, setTeamId] = useState(activeTeamId);

  const commitDraft = () => {
    const parts = draft.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    const valid = parts.filter((p) => EMAIL_RE.test(p) && !emails.includes(p));
    if (valid.length) setEmails((e) => [...e, ...valid]);
    setDraft("");
  };

  const submit = () => {
    commitDraft();
    const finalEmails = draft.trim() && EMAIL_RE.test(draft.trim()) ? [...emails, draft.trim()] : emails;
    if (!finalEmails.length) return;
    onInvite(finalEmails, role, teamId);
    setEmails([]); setDraft(""); setRole("Member"); setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-bold tracking-tight text-foreground">Invite Users</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Send email invitations and track pending responses.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-[12px]"><Mail className="h-3.5 w-3.5" /> Invite by email</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite team members</DialogTitle>
              <DialogDescription>Add multiple emails, assign a role and team, then send.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="rounded-md border border-input px-2 py-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {emails.map((em) => (
                    <span key={em} className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      {em}
                      <button type="button" aria-label={`Remove ${em}`} onClick={() => setEmails((e) => e.filter((x) => x !== em))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "," || e.key === " ") { e.preventDefault(); commitDraft(); }
                      if (e.key === "Backspace" && !draft && emails.length) setEmails((em) => em.slice(0, -1));
                    }}
                    onBlur={commitDraft}
                    placeholder="name@company.com, another@company.com"
                    className="min-w-[160px] flex-1 bg-transparent py-1 text-[12.5px] outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Role</label>
                  <Select value={role} onValueChange={(v) => setRole(v as PendingInvite["role"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLE_NAMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Team</label>
                  <Select value={teamId} onValueChange={setTeamId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" className="gap-1.5" onClick={submit} disabled={!emails.length && !EMAIL_RE.test(draft.trim())}>
                <Send className="h-3.5 w-3.5" /> Send invites
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-[12px] text-muted-foreground">No pending invites.</TableCell></TableRow>
            )}
            {invites.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-[11.5px]">{inv.email}</TableCell>
                <TableCell className="text-[11.5px]">{inv.role}</TableCell>
                <TableCell className="text-[11.5px]">{teams.find((t) => t.id === inv.teamId)?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={inv.status === "revoked" ? "destructive" : "outline"} className="text-[10px] capitalize">
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground">{inv.sentAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[11px]" disabled={inv.status === "revoked"} onClick={() => onResend(inv.id)}>
                      <RotateCcw className="h-3 w-3" /> Resend
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[11px] text-destructive hover:text-destructive" disabled={inv.status === "revoked"} onClick={() => onRevoke(inv.id)}>
                      <Ban className="h-3 w-3" /> Revoke
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
