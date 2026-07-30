import { useMemo, useState } from "react";
import { Search, Phone, Mail, Hash, Clock, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AVAILABILITY_META, type Member, type Team } from "./data";

export function Directory({ members, teams }: { members: Member[]; teams: Team[] }) {
  const [q, setQ] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const qu = q.trim().toLowerCase();
    return members.filter((m) => {
      if (teamFilter !== "all" && m.teamId !== teamFilter) return false;
      if (!qu) return true;
      return [m.displayName, m.email, m.title, m.department].some((v) => v.toLowerCase().includes(qu));
    });
  }, [members, q, teamFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[13px] font-bold tracking-tight text-foreground">Team Directory</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Search and browse member profiles across teams.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members…" className="w-52 pl-8" />
          </div>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((m) => {
          const av = AVAILABILITY_META[m.availability];
          const team = teams.find((t) => t.id === m.teamId);
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="flex flex-col items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex w-full items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-lg">{m.avatarEmoji}</div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${av.dot} ring-2 ring-card`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-bold text-foreground">{m.displayName}</div>
                  <div className="truncate text-[10.5px] text-muted-foreground">{m.title}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant="outline" className="text-[9.5px]">{m.role}</Badge>
                {team && <Badge variant="outline" className="text-[9.5px]">{team.logoEmoji} {team.name}</Badge>}
              </div>
              {m.status !== "active" && (
                <Badge variant="destructive" className="text-[9.5px] capitalize">{m.status}</Badge>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-[12px] text-muted-foreground">No members match your search.</div>
        )}
      </div>

      <Sheet open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-2xl">{selected.avatarEmoji}</div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${AVAILABILITY_META[selected.availability].dot} ring-2 ring-background`} />
                  </div>
                  <div>
                    <SheetTitle>{selected.displayName}</SheetTitle>
                    <SheetDescription>{selected.title} · {selected.department}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-5 flex flex-col gap-4">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="gap-1 text-[10px]"><ShieldCheck className="h-3 w-3" /> {selected.role}</Badge>
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <span className={`h-1.5 w-1.5 rounded-full ${AVAILABILITY_META[selected.availability].dot}`} />
                    {AVAILABILITY_META[selected.availability].label}
                  </Badge>
                  {selected.status !== "active" && <Badge variant="destructive" className="text-[10px] capitalize">{selected.status}</Badge>}
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-secondary/40 p-3.5 text-[12px]">
                  <Row icon={Mail} label="Email" value={selected.email} />
                  <Row icon={Phone} label="Phone" value={selected.phone} />
                  <Row icon={Hash} label="Extension" value={selected.extension} />
                  <Row icon={Clock} label="Last seen" value={selected.lastSeen} />
                </div>

                <div>
                  <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Legal name</div>
                  <p className="text-[12.5px] text-foreground">{selected.legalName}</p>
                </div>

                {selected.customFields.length > 0 && (
                  <div>
                    <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Custom fields</div>
                    <div className="flex flex-col gap-1.5">
                      {selected.customFields.map((f) => (
                        <div key={f.label} className="flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-[11.5px]">
                          <span className="text-muted-foreground">{f.label}</span>
                          <span className="font-medium text-foreground">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  );
}
