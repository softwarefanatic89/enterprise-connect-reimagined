import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, PartyPopper, User, UsersRound, Hash, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Team } from "./data";

const STEPS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "team", label: "Team", icon: UsersRound },
  { id: "channels", label: "Channels", icon: Hash },
  { id: "notifications", label: "Notifications", icon: BellRing },
  { id: "done", label: "Done", icon: PartyPopper },
] as const;

export function Onboarding({ teams }: { teams: Team[] }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [channels, setChannels] = useState<string[]>(["general"]);
  const [notif, setNotif] = useState({ mentions: true, dms: true, digest: false });

  const toggleChannel = (c: string) =>
    setChannels((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? Boolean(teamId) : true;

  const reset = () => { setStep(0); setName(""); setTitle(""); setChannels(["general"]); setNotif({ mentions: true, dms: true, digest: false }); };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[13px] font-bold tracking-tight text-foreground">User Onboarding</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Guide new teammates through setup in a few quick steps.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <div key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 text-[12px] font-bold transition-all ${
                    state === "done"
                      ? "border-primary bg-primary text-primary-foreground"
                      : state === "active"
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {state === "done" ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${state === "todo" ? "text-muted-foreground" : "text-foreground"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="min-h-[220px] rounded-2xl border border-border bg-card p-5">
        {step === 0 && (
          <div className="flex max-w-sm flex-col gap-3">
            <h3 className="text-[12.5px] font-bold text-foreground">Tell us about you</h3>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Display name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Job title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product Designer" />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-[12.5px] font-bold text-foreground">Choose your team</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTeamId(t.id)}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${teamId === t.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg text-base" style={{ backgroundColor: `color-mix(in oklch, ${t.color} 16%, white)` }}>{t.logoEmoji}</span>
                  <span className="text-[12px] font-semibold text-foreground">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-[12.5px] font-bold text-foreground">Join channels</h3>
            <div className="flex flex-wrap gap-2">
              {["general", "announcements", "random", "engineering", "support", "product"].map((c) => (
                <button
                  key={c}
                  onClick={() => toggleChannel(c)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all ${
                    channels.includes(c) ? "border-primary bg-primary-soft text-accent-foreground" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Hash className="h-3 w-3" /> {c}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="flex max-w-sm flex-col gap-3">
            <h3 className="text-[12.5px] font-bold text-foreground">Notification preferences</h3>
            {([
              ["mentions", "Mentions & replies"],
              ["dms", "Direct messages"],
              ["digest", "Weekly digest email"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-[12px] text-foreground">{label}</span>
                <Switch checked={notif[key]} onCheckedChange={(v) => setNotif((n) => ({ ...n, [key]: v }))} />
              </div>
            ))}
          </div>
        )}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <PartyPopper className="h-8 w-8 text-primary" />
            <h3 className="text-[13px] font-bold text-foreground">You're all set, {name || "there"}!</h3>
            <p className="max-w-xs text-[11.5px] text-muted-foreground">
              Joined {teams.find((t) => t.id === teamId)?.name ?? "a team"} with {channels.length} channel{channels.length !== 1 ? "s" : ""}.
            </p>
            <Button size="sm" className="mt-2" onClick={reset}>Start another onboarding</Button>
          </div>
        )}
      </div>

      {step < 4 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="gap-1">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <Button size="sm" disabled={!canNext} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="gap-1">
            {step === 3 ? "Finish" : "Continue"} <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
