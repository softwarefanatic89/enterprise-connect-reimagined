import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, User, Users, CalendarClock } from "lucide-react";
import { teamMembers } from "./data";

export function CreateReminderDialog({ onCreate }: { onCreate: (r: { title: string; note: string; type: "message-linked" | "personal" | "assigned"; assignee?: string; date: string; time: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"personal" | "message-linked" | "assigned">("personal");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [assignee, setAssignee] = useState(teamMembers[0].name);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onCreate({ title, note, type, assignee: type === "assigned" ? assignee : undefined, date, time });
    setOpen(false);
    setTitle(""); setNote(""); setDate(""); setTime("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 rounded-xl"><Plus className="h-4 w-4" /> New reminder</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Create reminder</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "personal" as const, icon: User, label: "Personal" },
            { id: "message-linked" as const, icon: MessageSquare, label: "Message" },
            { id: "assigned" as const, icon: Users, label: "Assign" },
          ].map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setType(o.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[10.5px] font-semibold transition-colors ${
                type === o.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <o.icon className="h-4 w-4" /> {o.label}
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you need to remember?" className="h-9 w-full rounded-lg border border-border bg-background px-3 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          {type === "message-linked" && (
            <div className="rounded-lg border border-border-soft bg-muted px-3 py-2 text-[11px] text-muted-foreground">
              Linked to: <span className="italic">"Sending the revised MSA shortly…"</span>
            </div>
          )}
          {type === "assigned" && (
            <div>
              <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Assign to</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {teamMembers.map((m) => <option key={m.id} value={m.name}>{m.avatar} {m.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              {type === "assigned" ? "Task / deadline note" : "Note"}
            </label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Optional details" className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground"><CalendarClock className="h-3 w-3" /> Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-2 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Set reminder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
