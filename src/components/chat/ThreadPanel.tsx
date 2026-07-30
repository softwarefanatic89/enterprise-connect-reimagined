import { useState } from "react";
import { MessageSquareText, X, Send, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ROLE, type Message } from "./data";
import { RichBody } from "./RichTextToolbar";

export type ThreadReply = {
  id: string;
  senderId: string;
  role: Message["role"];
  time: string;
  text: string;
};

/** Small "N replies" affordance rendered under a bubble that has thread activity. */
export function ThreadTeaser({ count, participants, onOpen }: { count: number; participants: string[]; onOpen: () => void }) {
  if (count <= 0) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mt-1.5 inline-flex items-center gap-1.5 self-start rounded-lg px-1.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary-soft"
    >
      <span className="flex -space-x-1.5">
        {participants.slice(0, 3).map((p) => (
          <span key={p} className="grid h-4 w-4 place-items-center rounded-full border border-surface bg-primary-soft text-[8px]">
            {ROLE[p as keyof typeof ROLE]?.icon ?? "•"}
          </span>
        ))}
      </span>
      <MessageSquareText className="h-3 w-3" />
      {count} {count === 1 ? "reply" : "replies"}
    </button>
  );
}

export function ThreadPanel({
  open, onOpenChange, parent, replies, onSend,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  parent: Message | null;
  replies: ThreadReply[];
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  if (!parent) return null;
  const role = ROLE[parent.role];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-[13px]">
            <MessageSquareText className="h-4 w-4 text-primary" /> Thread
          </SheetTitle>
        </SheetHeader>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-3">
          {/* Parent message */}
          <div className="mb-3 flex gap-2.5 border-b border-border-soft pb-3">
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] ${role.bg}`}>
              <span className="emoji-3d">{role.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-mono font-bold">{parent.senderId}</span>
                <span className="text-muted-foreground">{parent.time}</span>
              </div>
              {parent.text && <RichBody text={parent.text} className="mt-1 text-[13px] leading-relaxed" />}
            </div>
          </div>

          {replies.length === 0 && (
            <div className="py-8 text-center text-[12px] text-muted-foreground">No replies yet. Start the thread below.</div>
          )}

          <div className="flex flex-col gap-3">
            {replies.map((r) => {
              const rr = ROLE[r.role];
              return (
                <div key={r.id} className="flex gap-2.5">
                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] ${rr.bg}`}>
                    <span className="emoji-3d">{rr.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10.5px]">
                      <span className="font-mono font-bold">{r.senderId}</span>
                      <span className="text-muted-foreground">{r.time}</span>
                    </div>
                    <RichBody text={r.text} className="mt-0.5 text-[12.5px] leading-relaxed" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim()) {
                  onSend(value.trim());
                  setValue("");
                }
              }}
              placeholder="Reply in thread…"
              className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              disabled={!value.trim()}
              onClick={() => { if (value.trim()) { onSend(value.trim()); setValue(""); } }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-bubble text-bubble-out-foreground disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[9.5px] text-muted-foreground">
            <ShieldCheck className="h-2.5 w-2.5 text-[--color-success]" /> Thread replies are recorded to the audit log
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
