import { useMemo, useState } from "react";
import { UserPlus, Trash2, PauseCircle, PowerOff, PlayCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import { AVAILABILITY_META, type Member, type Team } from "./data";

export function MembersTable({
  members, teams, onAdd, onRemove, onSuspend, onDeactivate, onReactivate,
}: {
  members: Member[];
  teams: Team[];
  onAdd: () => void;
  onRemove: (ids: string[]) => void;
  onSuspend: (ids: string[]) => void;
  onDeactivate: (ids: string[]) => void;
  onReactivate: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const qu = q.trim().toLowerCase();
    return members.filter((m) => {
      if (teamFilter !== "all" && m.teamId !== teamFilter) return false;
      if (!qu) return true;
      return [m.displayName, m.email, m.role].some((v) => v.toLowerCase().includes(qu));
    });
  }, [members, q, teamFilter]);

  const allChecked = filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(filtered.map((m) => m.id)));
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selIds = Array.from(selected);
  const clear = () => setSelected(new Set());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[13px] font-bold tracking-tight text-foreground">Member Management</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Add, remove, suspend or deactivate members in bulk.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members…" className="w-44 pl-8" />
          </div>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" onClick={onAdd}><UserPlus className="h-3.5 w-3.5" /> Add member</Button>
        </div>
      </div>

      {selIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary-soft px-3 py-2">
          <span className="text-[11.5px] font-semibold text-accent-foreground">{selIds.length} selected</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px]" onClick={() => { onSuspend(selIds); clear(); }}>
              <PauseCircle className="h-3 w-3" /> Suspend
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px]" onClick={() => { onDeactivate(selIds); clear(); }}>
              <PowerOff className="h-3 w-3" /> Deactivate
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px] text-destructive hover:text-destructive" onClick={() => { onRemove(selIds); clear(); }}>
              <Trash2 className="h-3 w-3" /> Remove
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Select all" /></TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => {
              const team = teams.find((t) => t.id === m.teamId);
              const av = AVAILABILITY_META[m.availability];
              return (
                <TableRow key={m.id} data-state={selected.has(m.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggleOne(m.id)} aria-label={`Select ${m.displayName}`} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-[15px]">{m.avatarEmoji}</div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ${av.dot} ring-2 ring-card`} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-semibold text-foreground">{m.displayName}</div>
                        <div className="truncate font-mono text-[10px] text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{m.role}</Badge></TableCell>
                  <TableCell className="text-[11.5px]">{team ? `${team.logoEmoji} ${team.name}` : "—"}</TableCell>
                  <TableCell className="text-[11.5px] text-muted-foreground">{av.label}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === "active" ? "outline" : "destructive"} className="text-[10px] capitalize">{m.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Actions for ${m.displayName}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {m.status !== "suspended" ? (
                          <DropdownMenuItem onClick={() => onSuspend([m.id])}><PauseCircle className="h-3.5 w-3.5" /> Suspend</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onReactivate([m.id])}><PlayCircle className="h-3.5 w-3.5" /> Reactivate</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onDeactivate([m.id])}><PowerOff className="h-3.5 w-3.5" /> Deactivate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onRemove([m.id])}>
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-[12px] text-muted-foreground">No members found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
