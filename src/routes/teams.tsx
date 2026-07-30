import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users2, Mail, Sparkles, IdCard, Palette, SlidersHorizontal, Table2, AtSign, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/chat/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamsGrid } from "@/components/teams/TeamsGrid";
import { InviteUsers } from "@/components/teams/InviteUsers";
import { Onboarding } from "@/components/teams/Onboarding";
import { Directory } from "@/components/teams/Directory";
import { Branding } from "@/components/teams/Branding";
import { SettingsPanel } from "@/components/teams/SettingsPanel";
import { MembersTable } from "@/components/teams/MembersTable";
import { Groups } from "@/components/teams/Groups";
import { RolesMatrix } from "@/components/teams/RolesMatrix";
import {
  seedTeams, seedMembers, seedInvites, seedGroups, ROLE_NAMES,
  type Team, type Member, type PendingInvite, type MemberGroup,
} from "@/components/teams/data";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Team Management — Software Vala" },
      { name: "description", content: "Create teams, invite members, manage roles, permissions and branding for the Software Vala workspace." },
      { property: "og:title", content: "Team Management — Software Vala" },
      { property: "og:description", content: "Enterprise team management: invites, onboarding, directory, branding, roles and permissions." },
    ],
  }),
  component: TeamsPage,
});

const TABS = [
  { id: "teams", label: "Teams", icon: Users2 },
  { id: "invite", label: "Invite", icon: Mail },
  { id: "onboarding", label: "Onboarding", icon: Sparkles },
  { id: "directory", label: "Directory", icon: IdCard },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
  { id: "members", label: "Members", icon: Table2 },
  { id: "groups", label: "Groups", icon: AtSign },
  { id: "roles", label: "Roles", icon: ShieldCheck },
] as const;

let seq = 100;
const nextId = (prefix: string) => `${prefix}-${String(++seq).padStart(4, "0")}`;

function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(seedTeams);
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [invites, setInvites] = useState<PendingInvite[]>(seedInvites);
  const [groups, setGroups] = useState<MemberGroup[]>(seedGroups);
  const [activeTeamId, setActiveTeamId] = useState(seedTeams[0].id);
  const [addOpen, setAddOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "Member" as Member["role"], teamId: seedTeams[0].id });

  const activeTeam = useMemo(() => teams.find((t) => t.id === activeTeamId) ?? teams[0], [teams, activeTeamId]);

  const createTeam = (t: Omit<Team, "id" | "createdAt">) => {
    const team: Team = { ...t, id: nextId("TEAM"), createdAt: new Date().toISOString().slice(0, 10) };
    setTeams((ts) => [...ts, team]);
    setActiveTeamId(team.id);
  };
  const deleteTeam = (id: string) => {
    setTeams((ts) => ts.filter((t) => t.id !== id));
    setMembers((ms) => ms.filter((m) => m.teamId !== id));
    if (activeTeamId === id) setActiveTeamId((prev) => teams.find((t) => t.id !== id)?.id ?? prev);
  };
  const updateActiveTeam = (patch: Partial<Team>) => {
    setTeams((ts) => ts.map((t) => (t.id === activeTeamId ? { ...t, ...patch } : t)));
  };

  const sendInvites = (emails: string[], role: PendingInvite["role"], teamId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setInvites((inv) => [
      ...emails.map((email) => ({ id: nextId("INV"), email, role, teamId, status: "pending" as const, sentAt: today })),
      ...inv,
    ]);
  };
  const resendInvite = (id: string) => setInvites((inv) => inv.map((i) => (i.id === id ? { ...i, status: "resent" } : i)));
  const revokeInvite = (id: string) => setInvites((inv) => inv.map((i) => (i.id === id ? { ...i, status: "revoked" } : i)));

  const setMemberStatus = (ids: string[], status: Member["status"]) =>
    setMembers((ms) => ms.map((m) => (ids.includes(m.id) ? { ...m, status } : m)));
  const removeMembers = (ids: string[]) => setMembers((ms) => ms.filter((m) => !ids.includes(m.id)));

  const addMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) return;
    const m: Member = {
      id: nextId("USR"),
      displayName: newMember.name.trim(),
      legalName: newMember.name.trim(),
      email: newMember.email.trim(),
      phone: "—",
      extension: "—",
      avatarEmoji: "🙂",
      role: newMember.role,
      teamId: newMember.teamId,
      availability: "offline",
      lastSeen: "Never",
      title: "New team member",
      department: teams.find((t) => t.id === newMember.teamId)?.name ?? "General",
      customFields: [],
      status: "active",
    };
    setMembers((ms) => [m, ...ms]);
    setNewMember({ name: "", email: "", role: "Member", teamId: activeTeamId });
    setAddOpen(false);
  };

  const createGroup = (name: string, memberIds: string[]) => {
    setGroups((gs) => [...gs, { id: nextId("GRP"), name, mention: `@${name.toLowerCase().replace(/\s+/g, "-")}`, memberIds }]);
  };
  const deleteGroup = (id: string) => setGroups((gs) => gs.filter((g) => g.id !== id));

  return (
    <div className="animate-page-in flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar />
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 md:px-6">
          <div>
            <h1 className="text-[18px] font-bold tracking-tight text-foreground">Team Management</h1>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Create teams, invite people, onboard them, and control roles, branding and permissions for {activeTeam?.name ?? "your workspace"}.
            </p>
          </div>

          <Tabs defaultValue="teams" className="flex flex-col gap-5">
            <TabsList className="h-auto flex-wrap justify-start gap-1 bg-secondary/60 p-1.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <TabsTrigger key={t.id} value={t.id} className="gap-1.5 text-[11.5px]">
                    <Icon className="h-3.5 w-3.5" /> {t.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="teams" className="mt-0">
              <TeamsGrid
                teams={teams}
                members={members}
                activeTeamId={activeTeamId}
                onSwitchTeam={setActiveTeamId}
                onCreateTeam={createTeam}
                onDeleteTeam={deleteTeam}
              />
            </TabsContent>

            <TabsContent value="invite" className="mt-0">
              <InviteUsers invites={invites} teams={teams} activeTeamId={activeTeamId} onInvite={sendInvites} onResend={resendInvite} onRevoke={revokeInvite} />
            </TabsContent>

            <TabsContent value="onboarding" className="mt-0">
              <Onboarding teams={teams} />
            </TabsContent>

            <TabsContent value="directory" className="mt-0">
              <Directory members={members} teams={teams} />
            </TabsContent>

            <TabsContent value="branding" className="mt-0">
              {activeTeam && <Branding team={activeTeam} onUpdate={updateActiveTeam} />}
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              {activeTeam && <SettingsPanel team={activeTeam} />}
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              <MembersTable
                members={members}
                teams={teams}
                onAdd={() => setAddOpen(true)}
                onRemove={removeMembers}
                onSuspend={(ids) => setMemberStatus(ids, "suspended")}
                onDeactivate={(ids) => setMemberStatus(ids, "deactivated")}
                onReactivate={(ids) => setMemberStatus(ids, "active")}
              />
            </TabsContent>

            <TabsContent value="groups" className="mt-0">
              <Groups groups={groups} members={members} onCreate={createGroup} onDelete={deleteGroup} />
            </TabsContent>

            <TabsContent value="roles" className="mt-0">
              <RolesMatrix />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>Manually add a member to a team.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input placeholder="Full name" value={newMember.name} onChange={(e) => setNewMember((n) => ({ ...n, name: e.target.value }))} />
            <Input placeholder="Email" type="email" value={newMember.email} onChange={(e) => setNewMember((n) => ({ ...n, email: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={newMember.role} onValueChange={(v) => setNewMember((n) => ({ ...n, role: v as Member["role"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLE_NAMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={newMember.teamId} onValueChange={(v) => setNewMember((n) => ({ ...n, teamId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={addMember} disabled={!newMember.name.trim() || !newMember.email.trim()}>Add member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
