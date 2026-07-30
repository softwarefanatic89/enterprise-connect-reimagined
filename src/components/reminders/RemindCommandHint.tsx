import { Terminal } from "lucide-react";

const EXAMPLES = [
  { cmd: "/remind me \"Follow up\" tomorrow 9am", desc: "Personal reminder for yourself" },
  { cmd: "/remind @rahul \"Push staging build\" in 2h", desc: "Assign a reminder to a teammate" },
  { cmd: "/remind this message in 1d", desc: "Link a reminder to the current message" },
  { cmd: "/remind list", desc: "Show your active reminders" },
];

export function RemindCommandHint() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary"><Terminal className="h-3.5 w-3.5" /></div>
        <h3 className="text-[12.5px] font-bold">/remind command</h3>
      </div>
      <p className="mb-3 text-[11.5px] text-muted-foreground">Type <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10.5px]">/remind</code> in any chat to quickly schedule a reminder without leaving the conversation.</p>
      <div className="space-y-1.5">
        {EXAMPLES.map((e) => (
          <div key={e.cmd} className="flex flex-col gap-0.5 rounded-lg border border-border-soft bg-background px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between">
            <code className="font-mono text-[11px] font-semibold text-primary">{e.cmd}</code>
            <span className="text-[10.5px] text-muted-foreground">{e.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
