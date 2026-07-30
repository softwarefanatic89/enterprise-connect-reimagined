import { useState } from "react";
import { Save, Globe, Lock, MessageSquareOff, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Team } from "./data";

export function SettingsPanel({ team }: { team: Team }) {
  const [visibility, setVisibility] = useState("workspace");
  const [approval, setApproval] = useState(true);
  const [allowGuest, setAllowGuest] = useState(false);
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [defaultRole, setDefaultRole] = useState("Member");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-bold tracking-tight text-foreground">Team Settings &amp; Preferences</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Configure defaults for “{team.name}”.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={save}>
          <Save className="h-3.5 w-3.5" /> {saved ? "Saved!" : "Save changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <SettingRow icon={Globe} title="Team visibility" desc="Who can find and request to join this team.">
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="workspace">Workspace-wide</SelectItem>
              <SelectItem value="invite">Invite only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow icon={UserPlus2} title="Default role for new members" desc="Applied automatically on join.">
          <Select value={defaultRole} onValueChange={setDefaultRole}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Member", "Guest", "Manager"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow icon={Lock} title="Require approval to join" desc="Admins must approve new join requests.">
          <Switch checked={approval} onCheckedChange={setApproval} />
        </SettingRow>

        <SettingRow icon={UserPlus2} title="Allow guest accounts" desc="Guests get restricted, view-only access.">
          <Switch checked={allowGuest} onCheckedChange={setAllowGuest} />
        </SettingRow>

        <SettingRow icon={MessageSquareOff} title="Profanity & content filter" desc="Automatically flag inappropriate content.">
          <Switch checked={profanityFilter} onCheckedChange={setProfanityFilter} />
        </SettingRow>

        <SettingRow icon={Globe} title="Default timezone" desc="Used for schedules and digests.">
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Asia/Kolkata (IST)", "America/New_York (ET)", "Europe/London (GMT)", "Asia/Singapore (SGT)"].map((z) => (
                <SelectItem key={z} value={z}>{z}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon, title, desc, children,
}: { icon: typeof Globe; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-3.5">
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold text-foreground">{title}</div>
          <div className="text-[11px] text-muted-foreground">{desc}</div>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
