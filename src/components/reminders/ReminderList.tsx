import { CheckCircle2, Clock3, Trash2, AlarmClockCheck, MessageSquare, User, Users, AlertTriangle } from "lucide-react";
import type { Reminder } from "./data";

const TYPE_ICON = { "message-linked": MessageSquare, personal: User, assigned: Users } as const;

function fmt(d: Date) {
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Group({ title, tone, items, onSnooze, onComplete, onDelete }: {
  title: string; tone: "overdue" | "today" | "upcoming"; items: Reminder[];
  onSnooze: (id: string) => void; onComplete: (id: string) => void; onDelete: (id: string) => void;
}) {
  if (items.length === 0) return null;
  const toneCls = tone === "overdue" ? "text-destructive" : tone === "today" ? "text-[oklch(0.55_0.15_60)]" : "text-primary";
  return (
    <div>
      <div className={`mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide ${toneCls}`}>
        {tone === "overdue" && <AlertTriangle className="h-3 w-3" />} {title} · {items.length}
      </div>
      <div className="space-y-2">
        {items.map((r) => {
          const Icon = TYPE_ICON[r.type];
          return (
            <div key={r.id} className="flex items-start gap-3 rounded-xl border border-border-soft bg-background p-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground"><Icon className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold">{r.title}</div>
                {r.note && <div className="text-[10.5px] text-muted-foreground">{r.note}</div>}
                {r.linkedMessage && <div className="mt-0.5 truncate text-[10.5px] italic text-muted-foreground">{r.linkedMessage}</div>}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {fmt(r.dueAt)}</span>
                  {r.assignee && <span className="flex items-center gap-1 font-mono">{r.assignee.avatar} {r.assignee.name}</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" title="Snooze" onClick={() => onSnooze(r.id)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><AlarmClockCheck className="h-3.5 w-3.5" /></button>
                <button type="button" title="Complete" onClick={() => onComplete(r.id)} className="grid h-7 w-7 place-items-center rounded-lg text-[oklch(0.5_0.15_155)] hover:bg-[oklch(0.95_0.05_155)]"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                <button type="button" title="Delete" onClick={() => onDelete(r.id)} className="grid h-7 w-7 place-items-center rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReminderList({ reminders, onSnooze, onComplete, onDelete }: {
  reminders: Reminder[]; onSnooze: (id: string) => void; onComplete: (id: string) => void; onDelete: (id: string) => void;
}) {
  const pending = reminders.filter((r) => r.status === "pending");
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-[12.5px] font-bold">Active reminders</h3>
      <div className="space-y-5">
        <Group title="Overdue" tone="overdue" items={pending.filter((r) => r.bucket === "overdue")} onSnooze={onSnooze} onComplete={onComplete} onDelete={onDelete} />
        <Group title="Today" tone="today" items={pending.filter((r) => r.bucket === "today")} onSnooze={onSnooze} onComplete={onComplete} onDelete={onDelete} />
        <Group title="Upcoming" tone="upcoming" items={pending.filter((r) => r.bucket === "upcoming")} onSnooze={onSnooze} onComplete={onComplete} onDelete={onDelete} />
        {pending.length === 0 && <p className="py-6 text-center text-[12px] text-muted-foreground">All caught up — no active reminders.</p>}
      </div>
    </div>
  );
}
