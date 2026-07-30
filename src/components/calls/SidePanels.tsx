import { useState } from "react";
import { Send, MicOff, Mic, Hand, Search, X, ShieldCheck } from "lucide-react";
import type { ChatMessage, ParticipantState } from "./data";

export function ParticipantsPanel({
  participants, onAdminMute, onClose,
}: { participants: ParticipantState[]; onAdminMute: (id: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const filtered = participants.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-3">
        <h3 className="text-[12.5px] font-bold">Participants · {participants.length}</h3>
        <button type="button" onClick={onClose} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="border-b border-border p-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find participant"
            className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-muted">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-sm">{p.avatar}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 truncate text-[12px] font-semibold">
                {p.name}{p.isYou && " (You)"}
                {p.role !== "Participant" && <ShieldCheck className="h-3 w-3 text-primary" />}
              </div>
              <div className="text-[10px] text-muted-foreground">{p.role}</div>
            </div>
            {p.handRaised && <Hand className="h-3.5 w-3.5 text-[oklch(0.65_0.18_85)]" />}
            {!p.isYou && (
              <button
                type="button"
                onClick={() => onAdminMute(p.id)}
                title={p.muted ? "Ask to unmute" : "Mute participant"}
                className={`grid h-7 w-7 place-items-center rounded-lg ${p.muted ? "text-destructive" : "text-muted-foreground"} hover:bg-secondary`}
              >
                {p.muted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function InCallChatPanel({
  messages, onSend, onClose,
}: { messages: ChatMessage[]; onSend: (text: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-3">
        <h3 className="text-[12.5px] font-bold">In-call chat</h3>
        <button type="button" onClick={onClose} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.isYou ? "flex-row-reverse text-right" : ""}`}>
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px]">{m.avatar}</div>
            <div className={`max-w-[80%] rounded-xl px-2.5 py-1.5 text-[11.5px] ${m.isYou ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <div className={`mb-0.5 text-[9.5px] font-semibold ${m.isYou ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{m.author} · {m.time}</div>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { onSend(draft.trim()); setDraft(""); } }}
        className="flex items-center gap-1.5 border-t border-border p-2.5"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message everyone…"
          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button type="submit" className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
