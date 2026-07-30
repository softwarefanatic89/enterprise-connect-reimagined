import { Hand, MicOff, VideoOff, Pin, MoreVertical, ShieldCheck, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import type { ParticipantState } from "./data";
import { useState } from "react";

const CONN_ICON = {
  excellent: SignalHigh,
  good: SignalMedium,
  weak: SignalLow,
} as const;

export function ParticipantTile({
  p, onAdminMute, size = "md",
}: { p: ParticipantState; onAdminMute?: (id: string) => void; size?: "sm" | "md" | "lg" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ConnIcon = CONN_ICON[p.connection];
  const padH = size === "lg" ? "aspect-video" : "aspect-square sm:aspect-video";

  return (
    <div
      className={`group relative flex ${padH} min-h-0 flex-col items-center justify-center overflow-hidden rounded-2xl border bg-[oklch(0.16_0.02_260)] text-white transition-all ${
        p.speaking ? "border-primary ring-2 ring-primary/60" : "border-border-soft"
      }`}
    >
      {p.cameraOn ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.28_0.05_260)] to-[oklch(0.14_0.02_260)]" />
      ) : null}

      <div className={`relative grid ${size === "sm" ? "h-9 w-9 text-base" : "h-14 w-14 text-2xl"} place-items-center rounded-full bg-[oklch(0.3_0.03_260)] shadow-inner`}>
        {p.avatar}
      </div>
      {!p.cameraOn && (
        <span className="relative mt-2 text-[11px] font-medium text-white/70">Camera off</span>
      )}

      {/* top-left badges */}
      <div className="absolute left-2 top-2 flex items-center gap-1">
        {p.role !== "Participant" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/90 backdrop-blur">
            <ShieldCheck className="h-2.5 w-2.5" /> {p.role}
          </span>
        )}
        {p.handRaised && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[oklch(0.75_0.16_85)] text-black">
            <Hand className="h-3 w-3" />
          </span>
        )}
      </div>

      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white/90 hover:bg-black/70"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute right-2 top-9 z-20 w-40 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-elegant">
          <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] hover:bg-muted" onClick={() => setMenuOpen(false)}>
            <Pin className="h-3.5 w-3.5" /> Pin for me
          </button>
          {!p.isYou && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] hover:bg-muted"
              onClick={() => { onAdminMute?.(p.id); setMenuOpen(false); }}
            >
              <MicOff className="h-3.5 w-3.5" /> {p.muted ? "Request unmute" : "Mute participant"}
            </button>
          )}
        </div>
      )}

      {/* bottom bar */}
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1">
        <span className="max-w-[75%] truncate rounded-full bg-black/50 px-2 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur">
          {p.name}{p.isYou ? " (You)" : ""}
        </span>
        <span className="flex items-center gap-1">
          <ConnIcon className={`h-3 w-3 ${p.connection === "weak" ? "text-[oklch(0.75_0.18_50)]" : "text-[oklch(0.75_0.16_150)]"}`} />
          <span className="grid h-5 w-5 place-items-center rounded-full bg-black/50">
            {p.muted ? <MicOff className="h-3 w-3 text-[oklch(0.72_0.19_25)]" /> : <span className="h-2 w-2 rounded-full bg-[oklch(0.75_0.16_150)]" />}
          </span>
          {!p.cameraOn && (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black/50">
              <VideoOff className="h-3 w-3 text-[oklch(0.72_0.19_25)]" />
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
