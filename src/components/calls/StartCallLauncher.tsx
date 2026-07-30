import { Phone, Video, Users, User, Sparkles } from "lucide-react";

const OPTIONS = [
  { id: "audio-1-1", icon: Phone, label: "1:1 Audio Call", hint: "Direct voice call", hd: false },
  { id: "video-1-1", icon: Video, label: "1:1 Video Call", hint: "Direct video call", hd: true },
  { id: "audio-group", icon: Users, label: "Group Audio Call", hint: "Up to 50 participants", hd: false },
  { id: "video-group", icon: Sparkles, label: "Group Video Call", hint: "Up to 50 participants", hd: true },
] as const;

export function StartCallLauncher({ onStart }: { onStart: (kind: (typeof OPTIONS)[number]["id"]) => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[12.5px] font-bold">Start a call</h3>
        <span className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-secondary px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground">
          <User className="h-2.5 w-2.5" /> 6 online
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onStart(o.id)}
            className="group relative flex flex-col items-start gap-2 rounded-xl border border-border-soft bg-background p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
          >
            {o.hd && (
              <span className="absolute right-2 top-2 rounded-full bg-primary-soft px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-primary">
                HD
              </span>
            )}
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <o.icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-[12px] font-bold leading-tight">{o.label}</div>
              <div className="text-[10px] text-muted-foreground">{o.hint}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
