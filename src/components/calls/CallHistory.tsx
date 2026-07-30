import { Phone, Video, Users, PhoneMissed, PhoneOff, Clock3, Redo2 } from "lucide-react";
import { callHistory, type CallHistoryEntry } from "./data";

const TYPE_META: Record<CallHistoryEntry["type"], { icon: typeof Phone; label: string }> = {
  "audio-1-1": { icon: Phone, label: "Audio · 1:1" },
  "video-1-1": { icon: Video, label: "Video · 1:1" },
  "audio-group": { icon: Users, label: "Audio · Group" },
  "video-group": { icon: Users, label: "Video · Group" },
};

export function CallHistoryList({ onRedial }: { onRedial: (title: string) => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[12.5px] font-bold">Call history</h3>
        <span className="text-[10.5px] text-muted-foreground">{callHistory.length} recent calls</span>
      </div>
      <div className="divide-y divide-border-soft">
        {callHistory.map((c) => {
          const meta = TYPE_META[c.type];
          const missed = c.status === "missed" || c.status === "declined";
          return (
            <div key={c.id} className="flex items-center gap-3 py-2.5">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${missed ? "bg-destructive/10 text-destructive" : "bg-primary-soft text-primary"}`}>
                {missed ? <PhoneMissed className="h-4 w-4" /> : <meta.icon className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-semibold">{c.title}</div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-muted-foreground">
                  <span>{meta.label}</span>
                  <span>·</span>
                  <span className="font-mono">{c.participants.join(", ")}</span>
                </div>
              </div>
              <div className="hidden flex-col items-end text-[10.5px] text-muted-foreground sm:flex">
                <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {c.duration}</span>
                <span>{c.when}</span>
              </div>
              <span className={`hidden rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide md:inline-flex ${
                c.status === "completed" ? "bg-[oklch(0.94_0.05_155)] text-[oklch(0.42_0.15_155)]"
                : c.status === "missed" ? "bg-destructive/10 text-destructive"
                : "bg-secondary text-muted-foreground"
              }`}>
                {c.status}
              </span>
              <button
                type="button"
                onClick={() => onRedial(c.title)}
                title="Call again"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-primary hover:bg-primary-soft"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
