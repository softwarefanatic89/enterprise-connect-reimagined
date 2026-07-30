import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Home, PhoneCall, X, ChevronRight } from "lucide-react";
import { CallStage } from "@/components/calls/CallStage";
import { CallControls } from "@/components/calls/CallControls";
import { ParticipantsPanel, InCallChatPanel } from "@/components/calls/SidePanels";
import { StartCallLauncher } from "@/components/calls/StartCallLauncher";
import { CallHistoryList } from "@/components/calls/CallHistory";
import { initialParticipants, initialInCallMessages, type ChatMessage } from "@/components/calls/data";

export const Route = createFileRoute("/calls")({
  head: () => ({
    meta: [
      { title: "Calls — Software Vala" },
      { name: "description", content: "Voice & video calling — launch 1:1 or group calls, manage participants, screen share and review call history for Software Vala." },
      { property: "og:title", content: "Calls — Software Vala" },
      { property: "og:description", content: "Enterprise-grade voice & video communication hub." },
    ],
  }),
  component: CallsPage,
});

function CallsPage() {
  const [inCall, setInCall] = useState(true);
  const [participants, setParticipants] = useState(initialParticipants);
  const [messages, setMessages] = useState<ChatMessage[]>(initialInCallMessages);
  const [screenSharing, setScreenSharing] = useState<null | "screen" | "window" | "application">(null);
  const [handRaised, setHandRaised] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [waitingCaller, setWaitingCaller] = useState<string | null>("Priya Nair");
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);

  const self = participants.find((p) => p.isYou)!;

  const toggleSelfMute = () =>
    setParticipants((ps) => ps.map((p) => (p.isYou ? { ...p, muted: !p.muted } : p)));
  const toggleSelfCamera = () =>
    setParticipants((ps) => ps.map((p) => (p.isYou ? { ...p, cameraOn: !p.cameraOn } : p)));
  const adminMute = (id: string) =>
    setParticipants((ps) => ps.map((p) => (p.id === id ? { ...p, muted: !p.muted } : p)));
  const sendMessage = (text: string) =>
    setMessages((m) => [...m, { id: `m${m.length + 1}`, author: "You", avatar: "🧑‍💼", time: "Now", text, isYou: true }]);

  const startCall = (kind: string) => {
    setPendingLabel(kind);
    setInCall(true);
  };

  return (
    <div className="animate-page-in flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[oklch(0.32_0.12_265)] to-[oklch(0.24_0.14_275)] text-[13px] font-black text-white">SV</div>
          <div className="flex items-center gap-1.5 text-[13px] font-semibold">
            Software Vala <ChevronRight className="h-3 w-3 text-muted-foreground" /> <span className="text-primary">Calls</span>
          </div>
        </div>
        <Link to="/" className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold hover:bg-muted">
          <Home className="h-3.5 w-3.5" /> Hub
        </Link>
      </header>

      <div className="scrollbar-thin flex min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 md:px-6">
          {inCall ? (
            <div className="flex min-h-[560px] flex-1 flex-col gap-3 lg:flex-row">
              <div className="flex min-h-[420px] flex-1 flex-col gap-3">
                <CallStage
                  participants={participants}
                  onAdminMute={adminMute}
                  screenSharing={screenSharing}
                  onStopShare={() => setScreenSharing(null)}
                  isOnHold={onHold}
                  waitingCaller={waitingCaller}
                />
                <CallControls
                  selfMuted={self.muted}
                  onToggleMute={toggleSelfMute}
                  cameraOn={self.cameraOn}
                  onToggleCamera={toggleSelfCamera}
                  screenSharing={screenSharing}
                  onShareOptions={(kind) => setScreenSharing(kind)}
                  onStopShare={() => setScreenSharing(null)}
                  handRaised={handRaised}
                  onToggleHand={() => setHandRaised((h) => !h)}
                  onToggleParticipants={() => setParticipantsOpen((o) => !o)}
                  participantsOpen={participantsOpen}
                  onToggleChat={() => setChatOpen((o) => !o)}
                  chatOpen={chatOpen}
                  unreadChat={chatOpen ? 0 : messages.length}
                  onHold={onHold}
                  onHold_setter={() => setOnHold((h) => !h)}
                  onEndCall={() => { setInCall(false); setWaitingCaller(null); }}
                />
              </div>
              {(participantsOpen || chatOpen) && (
                <div className="grid w-full shrink-0 grid-cols-1 gap-3 lg:w-[320px] lg:grid-rows-[1fr]">
                  {participantsOpen && (
                    <div className="h-[320px] lg:h-full">
                      <ParticipantsPanel participants={participants} onAdminMute={adminMute} onClose={() => setParticipantsOpen(false)} />
                    </div>
                  )}
                  {chatOpen && (
                    <div className="h-[380px] lg:h-full">
                      <InCallChatPanel messages={messages} onSend={sendMessage} onClose={() => setChatOpen(false)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
                <PhoneCall className="h-6 w-6" />
              </div>
              <h2 className="text-[15px] font-bold">Call ended</h2>
              <p className="max-w-sm text-[12px] text-muted-foreground">
                {pendingLabel ? `Ready to launch a new ${pendingLabel.replace("-", " ")}.` : "Start a new call below or revisit your call history."}
              </p>
              <button
                type="button"
                onClick={() => setInCall(true)}
                className="mt-1 rounded-full bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground hover:bg-primary/90"
              >
                Rejoin demo call
              </button>
            </div>
          )}

          <StartCallLauncher onStart={startCall} />
          <CallHistoryList onRedial={() => setInCall(true)} />
        </div>
      </div>
    </div>
  );
}
