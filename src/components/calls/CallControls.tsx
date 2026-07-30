import {
  Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff, Hand, Users,
  MessageSquare, PhoneOff, Pause, Play, Monitor, AppWindow, MonitorSmartphone, ChevronUp,
} from "lucide-react";
import { useState } from "react";

function CtrlButton({
  active, danger, onClick, icon: Icon, label, badge,
}: {
  active?: boolean; danger?: boolean; onClick?: () => void; icon: typeof Mic; label: string; badge?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 sm:h-12 sm:w-12 ${
        danger
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          : active
            ? "bg-white text-[oklch(0.16_0.02_260)] hover:bg-white/90"
            : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
      {badge && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-[oklch(0.1_0.015_260)]">
          {badge}
        </span>
      )}
    </button>
  );
}

export function CallControls({
  selfMuted, onToggleMute, cameraOn, onToggleCamera, screenSharing, onShareOptions, onStopShare,
  handRaised, onToggleHand, onToggleParticipants, participantsOpen, onToggleChat, chatOpen,
  onHold, onHold_setter, unreadChat, onEndCall,
}: {
  selfMuted: boolean; onToggleMute: () => void;
  cameraOn: boolean; onToggleCamera: () => void;
  screenSharing: null | "screen" | "window" | "application";
  onShareOptions: (kind: "screen" | "window" | "application") => void;
  onStopShare: () => void;
  handRaised: boolean; onToggleHand: () => void;
  onToggleParticipants: () => void; participantsOpen: boolean;
  onToggleChat: () => void; chatOpen: boolean; unreadChat: number;
  onHold: boolean; onHold_setter: () => void;
  onEndCall: () => void;
}) {
  const [shareMenu, setShareMenu] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border-soft bg-[oklch(0.1_0.015_260)] px-3 py-2.5 sm:gap-2.5">
      <CtrlButton icon={selfMuted ? MicOff : Mic} label={selfMuted ? "Unmute" : "Mute"} active={!selfMuted} danger={selfMuted} onClick={onToggleMute} />
      <CtrlButton icon={cameraOn ? Video : VideoOff} label={cameraOn ? "Turn camera off" : "Turn camera on"} active={cameraOn} onClick={onToggleCamera} />

      <div className="relative">
        <CtrlButton
          icon={screenSharing ? ScreenShareOff : ScreenShare}
          label={screenSharing ? "Stop sharing" : "Share screen"}
          active={!!screenSharing}
          onClick={() => (screenSharing ? onStopShare() : setShareMenu((o) => !o))}
        />
        {shareMenu && (
          <div className="absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-52 -translate-x-1/2 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-elegant">
            <p className="px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground">Choose what to share</p>
            {[
              { kind: "screen" as const, icon: Monitor, label: "Entire Screen" },
              { kind: "window" as const, icon: AppWindow, label: "A Window" },
              { kind: "application" as const, icon: MonitorSmartphone, label: "An Application" },
            ].map((o) => (
              <button
                key={o.kind}
                type="button"
                onClick={() => { onShareOptions(o.kind); setShareMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] hover:bg-muted"
              >
                <o.icon className="h-3.5 w-3.5" /> {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <CtrlButton icon={Hand} label={handRaised ? "Lower hand" : "Raise hand"} active={handRaised} onClick={onToggleHand} />
      <CtrlButton icon={onHold ? Play : Pause} label={onHold ? "Resume call" : "Hold call"} active={onHold} onClick={onHold_setter} />
      <CtrlButton icon={Users} label="Participants" active={participantsOpen} onClick={onToggleParticipants} />
      <CtrlButton icon={MessageSquare} label="In-call chat" active={chatOpen} onClick={onToggleChat} badge={unreadChat > 0 ? String(unreadChat) : undefined} />

      <div className="mx-1 hidden h-8 w-px bg-white/15 sm:block" />

      <button
        type="button"
        onClick={onEndCall}
        className="flex h-11 items-center gap-1.5 rounded-full bg-destructive px-4 text-[12px] font-bold text-destructive-foreground transition-all hover:bg-destructive/90 active:scale-95 sm:h-12"
      >
        <PhoneOff className="h-4.5 w-4.5" /> End
      </button>
    </div>
  );
}
