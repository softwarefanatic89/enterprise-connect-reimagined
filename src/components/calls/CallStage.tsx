import { useState } from "react";
import { LayoutGrid, Maximize2, MonitorSmartphone, AppWindow, Monitor, ScreenShare, X, Clock3 } from "lucide-react";
import { ParticipantTile } from "./ParticipantTile";
import type { ParticipantState } from "./data";

export function CallStage({
  participants, onAdminMute, screenSharing, onStopShare, isOnHold, waitingCaller,
}: {
  participants: ParticipantState[];
  onAdminMute: (id: string) => void;
  screenSharing: null | "screen" | "window" | "application";
  onStopShare: () => void;
  isOnHold: boolean;
  waitingCaller: string | null;
}) {
  const [view, setView] = useState<"grid" | "speaker">("grid");
  const speaker = participants.find((p) => p.speaking) ?? participants[0];
  const others = participants.filter((p) => p.id !== speaker.id);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-3 rounded-2xl border border-border-soft bg-[oklch(0.1_0.015_260)] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/70">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.72_0.19_25)]" /> Live · 00:14:22
          </span>
          {screenSharing && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/25 px-2 py-1 text-primary-foreground">
              <ScreenShare className="h-3 w-3" /> Presenting
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-colors ${view === "grid" ? "bg-white text-[oklch(0.16_0.02_260)]" : "text-white/80 hover:bg-white/10"}`}
          >
            <LayoutGrid className="h-3 w-3" /> Grid
          </button>
          <button
            type="button"
            onClick={() => setView("speaker")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-colors ${view === "speaker" ? "bg-white text-[oklch(0.16_0.02_260)]" : "text-white/80 hover:bg-white/10"}`}
          >
            <Maximize2 className="h-3 w-3" /> Speaker
          </button>
        </div>
      </div>

      {isOnHold && (
        <div className="flex items-center gap-2 rounded-xl border border-[oklch(0.75_0.16_85)]/40 bg-[oklch(0.75_0.16_85)]/15 px-3 py-2 text-[11.5px] font-semibold text-[oklch(0.85_0.14_85)]">
          <Clock3 className="h-3.5 w-3.5" /> Call is on hold — other participants can't hear you.
        </div>
      )}
      {waitingCaller && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/40 bg-primary/15 px-3 py-2 text-[11.5px] font-semibold text-white">
          <span>📞 {waitingCaller} is waiting on the other line</span>
          <div className="flex gap-1.5">
            <button type="button" className="rounded-full bg-white/15 px-2 py-1 text-[10.5px] hover:bg-white/25">Ignore</button>
            <button type="button" className="rounded-full bg-primary px-2 py-1 text-[10.5px] text-primary-foreground hover:bg-primary/90">Switch</button>
          </div>
        </div>
      )}

      {screenSharing && (
        <div className="relative flex min-h-[180px] flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.2_0.02_260)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-white/80">
              {screenSharing === "screen" && <Monitor className="h-3.5 w-3.5" />}
              {screenSharing === "window" && <AppWindow className="h-3.5 w-3.5" />}
              {screenSharing === "application" && <MonitorSmartphone className="h-3.5 w-3.5" />}
              Presenting {screenSharing === "screen" ? "Entire Screen" : screenSharing === "window" ? "a Window" : "an Application"}
            </div>
            <button type="button" onClick={onStopShare} className="flex items-center gap-1 rounded-full bg-destructive/90 px-2 py-1 text-[10px] font-bold text-destructive-foreground hover:bg-destructive">
              <X className="h-3 w-3" /> Stop sharing
            </button>
          </div>
          <div className="grid flex-1 place-items-center text-white/40">
            <div className="flex flex-col items-center gap-2">
              <ScreenShare className="h-10 w-10" />
              <span className="text-[11px]">Screen-share preview area</span>
            </div>
          </div>
        </div>
      )}

      {view === "grid" || screenSharing ? (
        <div className={`grid flex-1 gap-2.5 overflow-auto ${screenSharing ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}>
          {participants.map((p) => (
            <ParticipantTile key={p.id} p={p} onAdminMute={onAdminMute} size={screenSharing ? "sm" : "md"} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2.5">
          <div className="min-h-0 flex-[3]">
            <ParticipantTile p={speaker} onAdminMute={onAdminMute} size="lg" />
          </div>
          <div className="flex flex-[1] gap-2 overflow-x-auto">
            {others.map((p) => (
              <div key={p.id} className="w-32 shrink-0 sm:w-40">
                <ParticipantTile p={p} onAdminMute={onAdminMute} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
