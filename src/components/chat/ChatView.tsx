import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Pin, ShieldCheck, MoreHorizontal, Phone, Video, Users, Hash,
  Reply, Bookmark, Languages, Volume2, Sparkles, Quote,
  Paperclip, Mic, Send, Image as ImageIcon, AtSign, Plus, Lock,
  Check, CheckCheck, Play, Smile, X, Wand2, FileText, Ticket,
  BarChart3, Calendar, Code2, MapPin, Camera, File, Zap, Film,
  ArrowDown, UploadCloud, Loader2, Users2,
} from "lucide-react";
import {
  messages, conversations, ROLE, EMOTION, PRIORITY, SMART_REPLIES, REACTIONS,
  type Message, type Conversation, type WorkStatus,
} from "./data";
import { supabase } from "@/integrations/supabase/client";
import { useLiveMessages } from "@/lib/live-messages";
import { toast } from "sonner";
import { TranslatedText } from "./TranslatedText";
import { LanguageMenu } from "./LanguageMenu";
import { ExpressionPicker } from "./ExpressionPicker";
import { MessageActionBar, type MessageActionHandlers } from "./MessageActions";
import { ThreadPanel, ThreadTeaser, type ThreadReply } from "./ThreadPanel";
import { MessageSearchDialog } from "./MessageSearch";
import { PinnedPanel, StarredPanel } from "./StarredPinnedPanel";
import {
  RichTextToolbar, MentionPopover, RichBody, LinkPreviewCard, VideoPreviewCard,
  type MentionEntity,
} from "./RichTextToolbar";

export const WORKSPACE_ID = "WS-SV-PRIME";

const SEED_THREADS: Record<string, ThreadReply[]> = {
  "MSG-100004": [
    { id: "T-1", senderId: "DEV-004521", role: "DEV", time: "10:31", text: "Which two edge cases exactly? Share trace IDs when ready." },
    { id: "T-2", senderId: "QA-001284", role: "QA", time: "10:33", text: "Socket reconnect + presence flap under packet loss. Repro is flaky, ~40%." },
  ],
};

export function ChatView({ chat }: { chat: Conversation }) {
  return (
    <section className="flex h-full min-w-0 flex-1 flex-col canvas-mesh">
      <ConversationRoot key={chat.id} chat={chat} />
    </section>
  );
}

function ConversationRoot({ chat }: { chat: Conversation }) {
  const [msgs, setMsgs] = useState<Message[]>(() => messages.map((m) => ({ ...m })));
  const { byConversation, markRead, connected } = useLiveMessages();
  const live = byConversation[chat.id];

  // Stream new message bodies into the transcript as they arrive.
  useEffect(() => {
    if (!live?.length) return;
    setMsgs((prev) => {
      const have = new Set(prev.map((m) => m.id));
      const incoming = live.filter((m) => !have.has(m.id));
      return incoming.length ? [...prev, ...incoming] : prev;
    });
    markRead(chat.id);
  }, [live, chat.id, markRead]);

  const [editedIds, setEditedIds] = useState<Set<string>>(new Set());
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(
    () => new Set(messages.filter((m) => m.pinned).map((m) => m.id)),
  );
  const [threads, setThreads] = useState<Record<string, ThreadReply[]>>(SEED_THREADS);
  const [threadFor, setThreadFor] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);

  const forwardTargets = useMemo(() => conversations.map((c) => c.id).filter((id) => id !== chat.id), [chat.id]);

  const scrollToMessage = (id: string) => {
    const el = document.querySelector(`[data-message="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.classList.add("animate-pop-in");
  };

  const makeHandlers = (m: Message): MessageActionHandlers => ({
    canEdit: !!m.out,
    starred: starred.has(m.id),
    pinned: pinnedIds.has(m.id),
    forwardTargets,
    onReplyInThread: () => setThreadFor(m.id),
    onEdit: () => setEditing({ id: m.id, value: m.text ?? "" }),
    onDelete: () => setMsgs((prev) => prev.filter((x) => x.id !== m.id)),
    onForward: (target) => toast.message(`Forwarded to ${target}`, { description: m.text?.slice(0, 60) }),
    onCopyText: () => { navigator.clipboard?.writeText(m.text ?? ""); toast.success("Copied to clipboard"); },
    onCopyLink: () => { navigator.clipboard?.writeText(`${window.location.origin}/#${chat.id}/${m.id}`); toast.success("Permalink copied"); },
    onStar: () => setStarred((prev) => {
      const next = new Set(prev);
      next.has(m.id) ? next.delete(m.id) : next.add(m.id);
      return next;
    }),
    onPin: () => setPinnedIds((prev) => {
      const next = new Set(prev);
      next.has(m.id) ? next.delete(m.id) : next.add(m.id);
      return next;
    }),
    onQuote: () => toast.message("Quoted in composer", { description: m.text?.slice(0, 60) }),
    onReact: () => {},
  });

  const pinnedMsgs = msgs.filter((m) => pinnedIds.has(m.id));
  const starredMsgs = msgs.filter((m) => starred.has(m.id));
  const activeThread = msgs.find((m) => m.id === threadFor) ?? null;

  return (
    <>
      <ConversationHeader
        chat={chat}
        pinnedMsgs={pinnedMsgs}
        starredMsgs={starredMsgs}
        onJump={scrollToMessage}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <div className="flex min-h-0 flex-1 flex-col animate-chat-swap">
        <Transcript
          conversationId={chat.id}
          msgs={msgs}
          editedIds={editedIds}
          starred={starred}
          pinnedIds={pinnedIds}
          threads={threads}
          editing={editing}
          onEditingChange={(v) => setEditing((e) => (e ? { ...e, value: v } : e))}
          onSaveEdit={() => {
            if (!editing) return;
            setMsgs((prev) => prev.map((x) => (x.id === editing.id ? { ...x, text: editing.value } : x)));
            setEditedIds((prev) => new Set(prev).add(editing.id));
            setEditing(null);
          }}
          onCancelEdit={() => setEditing(null)}
          makeHandlers={makeHandlers}
          onOpenThread={setThreadFor}
        />
        <SmartComposer chat={chat} />
      </div>

      <ThreadPanel
        open={!!threadFor}
        onOpenChange={(v) => !v && setThreadFor(null)}
        parent={activeThread}
        replies={threadFor ? (threads[threadFor] ?? []) : []}
        onSend={(text) => {
          if (!threadFor) return;
          setThreads((prev) => ({
            ...prev,
            [threadFor]: [
              ...(prev[threadFor] ?? []),
              { id: `T-${Date.now()}`, senderId: "BOSS-000001", role: "BOSS", time: "Now", text },
            ],
          }));
        }}
      />

      <MessageSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        messages={msgs}
        starred={starred}
        pinned={pinnedIds}
        conversationId={chat.id}
        onJump={scrollToMessage}
      />
    </>
  );
}

/* ─────────── HEADER ─────────── */

const lockDown = {
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  onCopy: (e: React.ClipboardEvent) => e.preventDefault(),
  onCut: (e: React.ClipboardEvent) => e.preventDefault(),
  onDragStart: (e: React.DragEvent) => e.preventDefault(),
};

function ConversationHeader({
  chat, pinnedMsgs = [], starredMsgs = [], onJump, onOpenSearch,
}: {
  chat: Conversation;
  pinnedMsgs?: Message[];
  starredMsgs?: Message[];
  onJump?: (id: string) => void;
  onOpenSearch?: () => void;
}) {
  const r = chat.role ? ROLE[chat.role] : null;
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur-xl sm:gap-3.5 sm:px-6 sm:py-3">
      <div className="relative shrink-0">
        <div className={`avatar-3d grid h-10 w-10 place-items-center rounded-[16px] border-2 sm:h-12 sm:w-12 sm:rounded-[18px] ${r ? r.ring : "border-border"} ${r ? r.bg : "bg-surface"} text-[18px]`}>
          <span className="emoji-3d emoji-xl">{r ? r.icon : <Hash className="h-5 w-5 text-muted-foreground" />}</span>
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[--color-success] ring-2 ring-surface animate-pulse-ring" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h2 className="truncate font-mono text-[14.5px] font-bold tracking-wide">{chat.id}</h2>
          {chat.verified && <ShieldCheck className="h-3.5 w-3.5 text-[--color-success]" />}
          <span className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
            {chat.kind}
          </span>
        </div>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
          <span className="inline-flex items-center gap-1 font-semibold text-[--color-success]">
            <span className="h-1.5 w-1.5 rounded-full bg-[--color-success]" /> Online
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span className="font-mono font-semibold tabular-nums text-foreground">12</span> members
            <span className="text-muted-foreground/70">· 4 active</span>
          </span>
        </div>
        <div className="mt-1 hidden flex-wrap items-center gap-1 text-[10.5px] lg:flex">
          <Tag>{chat.department}</Tag>
          <Tag>{chat.module}</Tag>
          {chat.project && <Tag>{chat.project}</Tag>}
          {chat.ams && <Tag>{chat.ams}</Tag>}
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <span className="mr-2 hidden items-center gap-1 whitespace-nowrap rounded-full border border-[--color-success]/30 bg-[--color-success]/10 px-2 py-0.5 text-[10px] font-semibold text-[--color-success] xl:inline-flex">
          <Lock className="h-2.5 w-2.5" /> E2E · Internal Only
        </span>
        <span className="hidden sm:contents">
          <HBtn label="Search in conversation" onClick={onOpenSearch}><Search className="h-4 w-4" /></HBtn>
        </span>
        <HBtn label="Start voice call"><Phone className="h-4 w-4" /></HBtn>
        <span className="hidden sm:contents"><HBtn label="Start video call"><Video className="h-4 w-4" /></HBtn></span>
        <span className="hidden lg:contents">
          <PinnedPanel messages={pinnedMsgs} onJump={onJump ?? (() => {})} />
          <StarredPanel messages={starredMsgs} onJump={onJump ?? (() => {})} />
        </span>
        <span className="hidden lg:contents"><HBtn label="Members"><Users className="h-4 w-4" /></HBtn></span>
        <span className="hidden md:contents"><LanguageMenu scopeId={chat.id} scopeLabel={chat.id} /></span>
        <HBtn label="More actions"><MoreHorizontal className="h-4 w-4" /></HBtn>
      </div>
    </header>
  );
}

function HBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground active:scale-95 focus-visible:outline-none"
    >
      {children}
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[9.5px] text-muted-foreground">
      {children}
    </span>
  );
}

/* ─────────── TRANSCRIPT ─────────── */

type ReactionState = { emoji: string; count: number; mine?: boolean };

type ReactionRow = { message_id: string; emoji: string; user_id: string };

function rowsToMap(rows: ReactionRow[], uid: string | null): Record<string, ReactionState[]> {
  return rowsToMapImpl(rows, uid);
}

/** Minutes between two "HH:MM" stamps; large number when unparseable. */
function minutesBetween(a: string, b: string): number {
  const parse = (t: string) => {
    const m = /^(\d{1,2}):(\d{2})/.exec(t.trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const x = parse(a);
  const y = parse(b);
  if (x === null || y === null) return Number.POSITIVE_INFINITY;
  return Math.abs(y - x);
}

function rowsToMapImpl(rows: ReactionRow[], uid: string | null): Record<string, ReactionState[]> {
  const map: Record<string, Map<string, ReactionState>> = {};
  for (const r of rows) {
    const bucket = (map[r.message_id] ??= new Map());
    const existing = bucket.get(r.emoji);
    if (existing) {
      existing.count += 1;
      if (uid && r.user_id === uid) existing.mine = true;
    } else {
      bucket.set(r.emoji, { emoji: r.emoji, count: 1, mine: !!uid && r.user_id === uid });
    }
  }
  const out: Record<string, ReactionState[]> = {};
  for (const [k, v] of Object.entries(map)) out[k] = Array.from(v.values());
  return out;
}

function Transcript({
  conversationId,
  msgs = messages,
  editedIds = new Set<string>(),
  starred = new Set<string>(),
  pinnedIds = new Set<string>(),
  threads = {},
  editing = null,
  onEditingChange,
  onSaveEdit,
  onCancelEdit,
  makeHandlers,
  onOpenThread,
}: {
  conversationId: string;
  msgs?: Message[];
  editedIds?: Set<string>;
  starred?: Set<string>;
  pinnedIds?: Set<string>;
  threads?: Record<string, ThreadReply[]>;
  editing?: { id: string; value: string } | null;
  onEditingChange?: (v: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  makeHandlers?: (m: Message) => MessageActionHandlers;
  onOpenThread?: (id: string) => void;
}) {
  const [reactionMap, setReactionMap] = useState<Record<string, ReactionState[]>>(() =>
    Object.fromEntries(msgs.map((m) => [m.id, m.reactions ?? []])),
  );
  const [burst, setBurst] = useState<{ id: string; emoji: string; key: number } | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [liveMsg, setLiveMsg] = useState("");
  const uidRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [unseenBelow, setUnseenBelow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderLoaded, setOlderLoaded] = useState(false);

  // Skeleton screen on conversation switch (presentation only).
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(t);
  }, [conversationId]);

  // Scroll position memory per conversation + jump-to-latest visibility.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || loading) return;
    const key = `sv.scroll.${conversationId}`;
    const saved = Number(window.sessionStorage.getItem(key) ?? NaN);
    el.scrollTop = Number.isFinite(saved) ? saved : el.scrollHeight;

    const onScroll = () => {
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 64;
      setAtBottom(bottom);
      window.sessionStorage.setItem(key, String(el.scrollTop));
      if (bottom) {
        setUnseenBelow(0);
      } else {
        const viewportBottom = el.getBoundingClientRect().bottom;
        const nodes = el.querySelectorAll<HTMLElement>("[data-message]");
        let below = 0;
        nodes.forEach((n) => {
          if (n.getBoundingClientRect().top > viewportBottom - 8) below += 1;
        });
        setUnseenBelow(below);
      }
      if (el.scrollTop < 40 && !olderLoaded && !loadingOlder) {
        setLoadingOlder(true);
        window.setTimeout(() => { setLoadingOlder(false); setOlderLoaded(true); }, 500);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [conversationId, loading, olderLoaded, loadingOlder]);

  const jumpToLatest = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  // Keyboard: J jumps to latest when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key.toLowerCase() === "j" && !e.metaKey && !e.ctrlKey) jumpToLatest();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Load current session + initial reactions + realtime subscription
  useEffect(() => {
    let cancelled = false;

    const load = async (uid: string | null) => {
      uidRef.current = uid;
      const ids = messages.map((m) => m.id);
      const { data, error } = await supabase
        .from("message_reactions")
        .select("message_id, emoji, user_id")
        .in("message_id", ids);
      if (cancelled) return;
      if (error) return; // silently fall back to seed data
      const fresh = rowsToMap((data ?? []) as ReactionRow[], uid);
      setReactionMap((prev) => {
        const merged: Record<string, ReactionState[]> = { ...prev };
        for (const id of ids) merged[id] = fresh[id] ?? [];
        return merged;
      });
    };

    supabase.auth.getSession().then(({ data }) => {
      load(data.session?.user.id ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      load(session?.user.id ?? null);
    });

    const channel = supabase
      .channel("message_reactions_stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message_reactions" },
        () => load(uidRef.current),
      )
      .subscribe();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const applyLocal = (msgId: string, emoji: string, add: boolean) => {
    setReactionMap((prev) => {
      const list = prev[msgId] ?? [];
      const idx = list.findIndex((r) => r.emoji === emoji);
      let next: ReactionState[];
      if (add) {
        if (idx === -1) next = [...list, { emoji, count: 1, mine: true }];
        else next = list.map((x, i) => (i === idx ? { ...x, count: x.count + 1, mine: true } : x));
      } else {
        if (idx === -1) return prev;
        const c = list[idx].count - 1;
        next = c <= 0
          ? list.filter((_, i) => i !== idx)
          : list.map((x, i) => (i === idx ? { ...x, count: c, mine: false } : x));
      }
      return { ...prev, [msgId]: next };
    });
  };

  const toggle = async (msgId: string, emoji: string) => {
    const uid = uidRef.current;
    const current = reactionMap[msgId] ?? [];
    const mine = current.find((r) => r.emoji === emoji)?.mine;
    const add = !mine;

    // Optimistic update
    applyLocal(msgId, emoji, add);
    if (add) setBurst({ id: msgId, emoji, key: Date.now() });
    setLiveMsg(add ? `Added ${emoji} reaction` : `Removed ${emoji} reaction`);

    if (!uid) {
      // Roll back — not signed in
      applyLocal(msgId, emoji, !add);
      toast.error("Sign in required", { description: "You need to sign in to react to messages." });
      return;
    }

    const { error } = add
      ? await supabase.from("message_reactions").insert({ message_id: msgId, emoji, user_id: uid })
      : await supabase.from("message_reactions").delete()
          .eq("message_id", msgId).eq("emoji", emoji).eq("user_id", uid);

    if (error) {
      applyLocal(msgId, emoji, !add); // rollback
      toast.error("Reaction failed", { description: error.message });
    }
  };


  const unreadIndex = Math.max(msgs.length - 2, 1);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 select-none overflow-y-auto px-3 py-4 sm:px-6 sm:py-6"
        style={{ WebkitUserSelect: "none", userSelect: "none", scrollBehavior: "smooth" }}
        {...lockDown}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-1">
          <SecurityBanner />

          {(loadingOlder || !olderLoaded) && (
            <div className="mb-2 flex items-center justify-center gap-2 text-[10.5px] text-muted-foreground">
              {loadingOlder ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading earlier messages…
                </>
              ) : (
                <span className="rounded-full border border-border bg-surface px-2.5 py-1">
                  Scroll up to load earlier sealed records
                </span>
              )}
            </div>
          )}

          {loading ? (
            <TranscriptSkeleton />
          ) : (
            <>
              <DayDivider label="Today · Friday, June 19" />
              {msgs.map((m, i) => {
                const prev = msgs[i - 1];
                const grouped =
                  !!prev &&
                  prev.senderId === m.senderId &&
                  prev.out === m.out &&
                  !m.reply &&
                  minutesBetween(prev.time, m.time) <= 5;
                const handlers = makeHandlers?.(m);
                const replies = threads[m.id] ?? [];
                return (
                  <div key={m.id} data-message={m.id} className="group relative">
                    {i === unreadIndex && <UnreadDivider count={msgs.length - unreadIndex} />}
                    {handlers && <MessageActionBar out={!!m.out} h={handlers} />}
                    <Bubble
                      m={m}
                      conversationId={conversationId}
                      grouped={grouped && i !== unreadIndex}
                      reactions={reactionMap[m.id] ?? []}
                      onToggle={(e) => toggle(m.id, e)}
                      burst={burst && burst.id === m.id ? burst : null}
                      pickerOpen={pickerFor === m.id}
                      onRequestPicker={(open) => setPickerFor(open ? m.id : null)}
                    />
                    <div className={`flex ${m.out ? "justify-end pr-14" : "pl-14"}`}>
                      {editedIds.has(m.id) && (
                        <span className="mt-0.5 text-[9.5px] text-muted-foreground">(edited)</span>
                      )}
                      <ThreadTeaser
                        count={replies.length}
                        participants={replies.map((r) => r.role)}
                        onOpen={() => onOpenThread?.(m.id)}
                      />
                    </div>
                    {editing?.id === m.id && (
                      <div className={`mt-1 flex items-center gap-2 ${m.out ? "justify-end pr-14" : "pl-14"}`}>
                        <input
                          value={editing.value}
                          onChange={(e) => onEditingChange?.(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onSaveEdit?.();
                            if (e.key === "Escape") onCancelEdit?.();
                          }}
                          autoFocus
                          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12.5px] outline-none"
                        />
                        <button type="button" onClick={() => onSaveEdit?.()} className="rounded-lg bg-primary px-2.5 py-1.5 text-[11.5px] font-semibold text-primary-foreground">Save</button>
                        <button type="button" onClick={() => onCancelEdit?.()} className="rounded-lg border border-border px-2.5 py-1.5 text-[11.5px]">Cancel</button>
                      </div>
                    )}
                  </div>
                );
              })}
              <TypingRow />
            </>
          )}
          <div ref={bottomRef} />
        </div>
        <div aria-live="polite" aria-atomic="true" className="sr-only">{liveMsg}</div>
      </div>

      {!atBottom && !loading && (
        <button
          type="button"
          onClick={() => { setUnseenBelow(0); jumpToLatest(); }}
          aria-label={unseenBelow > 0 ? `${unseenBelow} new messages, jump to latest` : "Jump to latest message"}
          className="animate-notify-in absolute bottom-4 left-1/2 z-20 flex w-max max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-popover/90 px-4 py-2 text-[11.5px] font-semibold shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 active:scale-95"
        >
          <ArrowDown className="h-3.5 w-3.5 text-primary" />
          {unseenBelow > 0 ? "New messages" : "Jump to latest"}
          {unseenBelow > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-primary-foreground">
              {unseenBelow}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

function TranscriptSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-4" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`flex items-end gap-3 ${i % 2 ? "flex-row-reverse" : ""}`}>
          <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
          <div className={`flex w-full max-w-[60%] flex-col gap-1.5 ${i % 2 ? "items-end" : ""}`}>
            <div className="skeleton h-2.5 w-28 rounded-full" />
            <div className="skeleton h-14 w-full rounded-[22px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UnreadDivider({ count }: { count: number }) {
  return (
    <div className="my-4 flex items-center gap-3" role="separator" aria-label={`${count} unread messages`}>
      <span className="h-px flex-1 bg-[--color-destructive]/35" />
      <span className="rounded-full border border-[--color-destructive]/35 bg-[--color-destructive]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[--color-destructive]">
        {count} unread
      </span>
      <span className="h-px flex-1 bg-[--color-destructive]/35" />
    </div>
  );
}

function SecurityBanner() {
  return (
    <div className="mx-auto mb-3 flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[10.5px] text-muted-foreground">
      <Lock className="h-3 w-3 text-[--color-success]" />
      Messages are sealed inside Software Vala. Copy, forward, screenshot helpers and external share are disabled.
    </div>
  );
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="date-sticky my-3 flex items-center justify-center">
      <span className="rounded-full border border-border bg-surface/70 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground backdrop-blur">
        {label}
      </span>
    </div>
  );
}

/* ─────────── BUBBLE ─────────── */

function Bubble({
  m, conversationId, grouped, reactions, onToggle, burst, pickerOpen, onRequestPicker,
}: {
  m: Message;
  conversationId: string;
  grouped: boolean;
  reactions: ReactionState[];
  onToggle: (emoji: string) => void;
  burst: { id: string; emoji: string; key: number } | null;
  pickerOpen: boolean;
  onRequestPicker: (open: boolean) => void;
}) {
  const out = !!m.out;
  const role = ROLE[m.role];

  // Long-press (mobile) → open picker
  const pressTimer = useRef<number | null>(null);
  const startPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => onRequestPicker(true), 450);
  };
  const cancelPress = () => {
    if (pressTimer.current) { window.clearTimeout(pressTimer.current); pressTimer.current = null; }
  };

  return (
    <div
      className={`group relative flex items-end gap-3 ${out ? "flex-row-reverse" : ""} ${grouped ? "mt-0.5" : "mt-6"}`}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onTouchCancel={cancelPress}
    >
      {/* Lavender circle avatar (reference style) */}
      <div className="grid w-10 shrink-0 place-items-center">
        {grouped ? (
          <span className="pb-2 font-mono text-[9.5px] tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {m.time}
          </span>
        ) : (
          <div
            className={`grid h-10 w-10 place-items-center rounded-full text-[16px] shadow-[inset_0_1px_0_oklch(1_0_0/0.7),0_8px_18px_-8px_oklch(0.55_0.18_295/0.45)] ${
              out
                ? "bg-gradient-to-br from-[oklch(0.86_0.09_258)] to-[oklch(0.74_0.13_262)] text-[oklch(0.25_0.06_265)]"
                : "bg-gradient-to-br from-[oklch(0.92_0.08_295)] to-[oklch(0.78_0.13_295)] text-white"
            }`}
          >
            <span className="emoji-3d">{role.icon}</span>
          </div>
        )}
      </div>

      <div className={`flex max-w-[72%] min-w-0 flex-col ${out ? "items-end" : "items-start"}`}>
        {/* Minimal inline meta */}
        {!grouped && (
          <div className={`mb-1.5 flex items-center gap-1.5 px-1 text-[10.5px] ${out ? "flex-row-reverse" : ""}`}>
            <span className="font-mono font-bold tracking-tight text-foreground">{m.senderId}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${
              PRIORITY[m.priority].cls
            }`}>{PRIORITY[m.priority].label}</span>
          </div>
        )}

        {m.pinned && (
          <div className={`mb-1 flex items-center gap-1 text-[10px] text-muted-foreground ${out ? "flex-row-reverse" : ""}`}>
            <Pin className="h-3 w-3" /> Pinned
          </div>
        )}

        {/* Card */}
        <div className="relative w-fit max-w-full">
          <div
            className={`animate-pop-in relative overflow-hidden text-[13.5px] leading-relaxed transition-all duration-300 ${
              out
                ? "rounded-[22px] rounded-br-[8px] bg-[oklch(0.18_0.025_280)] text-white shadow-[0_14px_32px_-14px_oklch(0.18_0.025_280/0.55),inset_0_1px_0_oklch(1_0_0/0.08)] hover:-translate-y-0.5"
                : "rounded-[22px] rounded-bl-[8px] bg-white text-foreground ring-1 ring-[oklch(0.92_0.012_290)] shadow-[0_10px_28px_-14px_oklch(0.45_0.18_290/0.28),inset_0_1px_0_oklch(1_0_0/0.9)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_oklch(0.45_0.18_290/0.38)]"
            }`}
          >
            {/* Reply quote */}
            {m.reply && (
              <div className={`mx-3 mt-3 flex items-start gap-2 rounded-xl px-2.5 py-1.5 ${
                out
                  ? "bg-white/10 border-l-2 border-[oklch(0.72_0.13_258)]"
                  : `border-l-2 ${ROLE[m.reply.role].ring} ${ROLE[m.reply.role].bg}`
              }`}>
                <Quote className={`mt-0.5 h-3 w-3 shrink-0 ${out ? "text-white/60" : "text-muted-foreground"}`} />
                <div className="min-w-0">
                  <div className={`font-mono text-[10px] font-bold ${out ? "text-[oklch(0.72_0.13_258)]" : ROLE[m.reply.role].text}`}>{m.reply.id}</div>
                  <div className={`truncate text-[11.5px] ${out ? "text-white/75" : "text-muted-foreground"}`}>{m.reply.text}</div>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="px-4 pt-3">
              {m.emotion && !out && <EmotionChip s={m.emotion} />}
              {m.text && (
                <TranslatedText
                  text={m.text}
                  msgId={m.id}
                  conversationId={conversationId}
                  className="mt-1.5 block"
                  toneClass={out ? "text-white/70" : "text-muted-foreground"}
                />
              )}

              {m.attachment?.kind === "image" && <ImageAttachment id={m.attachment.id} size={m.attachment.size!} />}
              {m.attachment?.kind === "file" && <FileAttachment id={m.attachment.id} size={m.attachment.size!} />}
              {m.attachment?.kind === "voice" && <VoiceAttachment id={m.attachment.id} duration={m.attachment.duration!} bars={m.attachment.waveform!} />}
            </div>

            <BubbleStatusLine m={m} out={out} />
          </div>

          <BubbleQuickBar out={out} />
          <ReactionDock out={out} onPick={(e) => { onToggle(e); onRequestPicker(false); }} forceOpen={pickerOpen} onDismiss={() => onRequestPicker(false)} />
        </div>

        {reactions.length > 0 && (
          <div
            className={`mt-1.5 flex flex-wrap gap-1 ${out ? "justify-end" : ""}`}
            role="group"
            aria-label="Message reactions"
          >
            {reactions.map((r) => {
              const isBursting = burst?.emoji === r.emoji;
              const label = r.mine
                ? `Remove ${r.emoji} reaction, ${r.count} ${r.count === 1 ? "person" : "people"}`
                : `Add ${r.emoji} reaction, currently ${r.count} ${r.count === 1 ? "person" : "people"}`;
              return (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => onToggle(r.emoji)}
                  aria-pressed={!!r.mine}
                  aria-label={label}
                  className={`reaction-chip group/rx relative flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.2_295)] focus-visible:ring-offset-1 ${
                    r.mine
                      ? "border-[oklch(0.72_0.13_258)] bg-[oklch(0.86_0.09_258)]/50 text-foreground shadow-[0_2px_10px_-4px_oklch(0.68_0.14_258/0.45)]"
                      : "border-border bg-white text-foreground hover:border-[oklch(0.55_0.2_295)]/40 hover:bg-[oklch(0.98_0.02_295)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    key={isBursting ? burst!.key : "static"}
                    className={`emoji-3d inline-block transition-transform duration-200 group-hover/rx:scale-125 ${isBursting ? "animate-[reaction-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)]" : ""}`}
                  >
                    {r.emoji}
                  </span>
                  <span key={r.count} className="animate-[badge-pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)] font-semibold tabular-nums">
                    {r.count}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onRequestPicker(true)}
              aria-label="Open reaction picker"
              aria-haspopup="menu"
              aria-expanded={pickerOpen}
              className="grid h-6 w-6 place-items-center rounded-full border border-dashed border-border bg-white text-muted-foreground transition-all hover:scale-110 hover:border-solid hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.2_295)]"
            >
              <Smile className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        )}

        <AuditStrip m={m} conversationId={conversationId} out={out} />
      </div>
    </div>
  );
}

/* ─────────── AUDIT STRIP (enterprise record chip) ─────────── */

function AuditStrip({ m, conversationId, out }: { m: Message; conversationId: string; out: boolean }) {
  const readLabel = m.read === "read" ? "Delivered · Read" : m.read === "delivered" ? "Delivered" : "Sent";
  const details = [
    { k: "Message ID", v: m.id },
    { k: "Conversation ID", v: conversationId },
    { k: "Workspace ID", v: WORKSPACE_ID },
    { k: "Timestamp", v: `${m.time} · Today` },
    { k: "Delivery", v: readLabel },
    { k: "Integrity", v: "SHA-256 verified" },
    { k: "Security", v: "AES-256 · E2E sealed" },
    { k: "Audit", v: "Available · Immutable record" },
  ];
  return (
    <div
      tabIndex={0}
      aria-label={`Enterprise record for ${m.id}`}
      className={`group/audit relative mt-1 inline-flex max-w-full items-center gap-1 rounded-full border border-transparent px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/70 opacity-60 outline-none transition-all duration-200 hover:border-border/70 hover:bg-surface/80 hover:opacity-100 focus-visible:border-border focus-visible:opacity-100 group-hover:opacity-100 ${out ? "self-end" : "self-start"}`}
    >
      <ShieldCheck className="h-2.5 w-2.5 text-[--color-success]" />
      <span className="truncate font-semibold text-foreground/70">{m.id}</span>
      <Lock className="h-2.5 w-2.5 text-[--color-success]" aria-label="Sealed" />
      <span className="text-[--color-success]">{readLabel === "Delivered · Read" ? "READ" : readLabel === "Delivered" ? "DLV" : "SENT"}</span>
      <span className="hidden items-center gap-1 group-hover/audit:inline-flex">
        <FileText className="h-2.5 w-2.5" />
      </span>

      {/* Hover / focus reveal — full record without cluttering the default state */}
      <div className={`pointer-events-none absolute ${out ? "right-0" : "left-0"} top-full z-30 mt-1 hidden min-w-[260px] rounded-xl border border-border bg-popover p-2.5 text-[10px] text-foreground shadow-[0_20px_50px_-20px_oklch(0.2_0.05_265/0.45)] group-hover/audit:block group-focus-within/audit:block`}>
        <div className="mb-1 flex items-center gap-1.5 border-b border-border pb-1.5 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-[--color-success]" /> Enterprise Record
        </div>
        <dl className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 font-mono">
          {details.map((d) => (
            <div key={d.k} className="contents">
              <dt className="text-muted-foreground">{d.k}</dt>
              <dd className="truncate font-semibold text-foreground">{d.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}



function BubbleHeader({ m, out }: { m: Message; out: boolean }) {
  const role = ROLE[m.role];
  const prio = PRIORITY[m.priority];
  return (
    <div className={`mb-1 flex flex-wrap items-center gap-1 text-[10.5px] ${out ? "flex-row-reverse" : ""}`}>
      <span className={`inline-flex items-center gap-1 rounded-md border ${role.ring} ${role.bg} px-1.5 py-0.5 font-bold uppercase ${role.text}`}>
        <span className="emoji-3d text-[12px] leading-none">{role.icon}</span>
        {role.label}
      </span>
      <Tag>{m.department}</Tag>
      <Tag>{m.module}</Tag>
      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-bold uppercase ${prio.cls}`}>
        {prio.label}
      </span>
      <span className={`inline-flex items-center gap-1 rounded-md border ${EMOTION[m.status].cls} px-1.5 py-0.5 font-semibold`}>
        {m.status}
      </span>
      <span className="font-mono font-bold text-foreground">{m.senderId}</span>
      <span className="text-muted-foreground">· {m.time}</span>
    </div>
  );
}

function EmotionChip({ s }: { s: WorkStatus }) {
  const e = EMOTION[s];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${e.cls}`}>
      <span className="emoji-3d">{e.icon}</span>
      {e.label}
    </span>
  );
}

/** Quiet in-bubble status line: timestamp + delivery ticks, no action clutter. */
function BubbleStatusLine({ m, out }: { m: Message; out: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-4 pb-2.5 pt-2 text-[10px] ${out ? "justify-end text-white/55" : "justify-end text-muted-foreground"}`}>
      <span className="font-mono tabular-nums">{m.time}</span>
      {out && (
        <span key={m.read} className="tick-in inline-flex items-center gap-1">
          {m.read === "read"
            ? <CheckCheck className="h-3.5 w-3.5 text-[oklch(0.72_0.13_258)]" />
            : <Check className="h-3.5 w-3.5" />}
        </span>
      )}
    </div>
  );
}

/** Floating glass quick bar — revealed on hover only, never occupies layout space. */
function BubbleQuickBar({ out }: { out: boolean }) {
  return (
    <div
      role="toolbar"
      aria-label="Message quick actions"
      className={`pointer-events-none absolute -bottom-3.5 ${out ? "left-2" : "right-2"} z-10 flex translate-y-1 items-center gap-0.5 rounded-full border border-border/80 bg-popover/85 px-1 py-0.5 opacity-0 shadow-[0_12px_30px_-14px_oklch(0.35_0.12_290/0.55)] backdrop-blur-xl transition-all duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100`}
    >
      <FBtn icon={<Languages className="h-3.5 w-3.5" />} label="Translate" />
      <FBtn icon={<Volume2 className="h-3.5 w-3.5" />} label="Listen" />
      <FBtn icon={<Sparkles className="h-3.5 w-3.5" />} label="AI" accent />
      <span className="mx-0.5 h-3 w-px bg-border" />
      <FBtn icon={<Reply className="h-3.5 w-3.5" />} label="Reply" />
      <FBtn icon={<MoreHorizontal className="h-3.5 w-3.5" />} label="More" />
    </div>
  );
}

function FBtn({ icon, label, accent }: { icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`grid h-7 w-7 place-items-center rounded-full transition-all hover:bg-surface-hover active:scale-95 ${
        accent ? "text-[oklch(0.55_0.2_295)] hover:bg-[oklch(0.55_0.2_295)]/10" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
    </button>
  );
}


function ReactionDock({
  out, onPick, forceOpen, onDismiss,
}: {
  out: boolean;
  onPick: (emoji: string) => void;
  forceOpen?: boolean;
  onDismiss?: () => void;
}) {
  const dockRef = useRef<HTMLDivElement | null>(null);

  // Autofocus first button when opened via long-press / picker toggle
  useEffect(() => {
    if (forceOpen && dockRef.current) {
      const first = dockRef.current.querySelector<HTMLButtonElement>("button");
      first?.focus();
    }
  }, [forceOpen]);

  // Dismiss on outside tap / Escape when force-opened
  useEffect(() => {
    if (!forceOpen) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) onDismiss?.();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onDismiss?.(); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [forceOpen, onDismiss]);

  const openCls = forceOpen
    ? "pointer-events-auto translate-y-0 opacity-100"
    : "pointer-events-none translate-y-2 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100";

  return (
    <div
      ref={dockRef}
      role="menu"
      aria-label="Quick reactions"
      className={`absolute -top-5 ${out ? "left-2" : "right-2"} z-10 flex items-center gap-0.5 rounded-full border border-border bg-popover px-1.5 py-1 shadow-[0_18px_40px_-14px_oklch(0.35_0.12_290/0.5),0_2px_0_oklch(1_0_0/0.9)_inset] backdrop-blur-xl transition-all duration-200 ease-out ${openCls}`}
    >
      {REACTIONS.slice(0, 7).map((e, i) => (
        <button
          key={e}
          type="button"
          role="menuitem"
          onClick={() => onPick(e)}
          style={{ transitionDelay: `${i * 20}ms` }}
          className="reaction-dock-emoji grid h-8 w-8 origin-bottom place-items-center rounded-full text-[19px] transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.35] active:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.2_295)]"
          aria-label={`React with ${e}`}
        >
          <span className="emoji-3d" aria-hidden="true">{e}</span>
        </button>
      ))}
      <div className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
      <button
        type="button"
        aria-label="More reactions"
        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.2_295)]"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

/* ─────────── ATTACHMENTS (ID-only labels) ─────────── */

function ImageAttachment({ id, size }: { id: string; size: string }) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-border">
      <div className="relative h-44 w-full bg-gradient-to-br from-sky-500/15 via-violet-500/10 to-emerald-400/15">
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-2xl border border-border bg-surface/80 px-3 py-1.5 font-mono text-[11px] font-semibold backdrop-blur">
            {id} · {size}
          </div>
        </div>
      </div>
    </div>
  );
}

function FileAttachment({ id, size }: { id: string; size: string }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-surface-hover px-2.5 py-2">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="truncate font-mono text-[12.5px] font-bold">{id}</div>
        <div className="text-[10.5px] text-muted-foreground">{size} · sealed file · in-app view only</div>
      </div>
    </div>
  );
}

function VoiceAttachment({ id, duration, bars }: { id: string; duration: string; bars: number[] }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-surface-hover px-2.5 py-2">
      <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-bubble text-bubble-out-foreground">
        <Play className="h-4 w-4 translate-x-px" />
      </button>
      <div className="flex h-9 flex-1 items-end gap-[2px]">
        {bars.map((b, i) => (
          <span key={i} className="w-[2.5px] rounded-full bg-foreground/40" style={{ height: `${b}px` }} />
        ))}
      </div>
      <div className="text-right">
        <div className="font-mono text-[10.5px] font-semibold">{id}</div>
        <div className="text-[10px] text-muted-foreground tabular-nums">{duration}</div>
      </div>
    </div>
  );
}

function TypingRow() {
  return (
    <div className="mt-3 flex items-end gap-3">
      <div className={`avatar-3d grid h-10 w-10 place-items-center rounded-2xl border-2 ${ROLE.QA.ring} ${ROLE.QA.bg} text-[15px]`}>
        <span className="emoji-3d emoji-xl">{ROLE.QA.icon}</span>
      </div>

      <div className="bubble-gloss rounded-2xl rounded-bl-md px-4 py-3 ring-1 ring-border">
        <div className="tg-typing"><span /><span /><span /></div>
      </div>
      <span className="pb-1 font-mono text-[10.5px] text-muted-foreground">QA-001284 is typing…</span>
    </div>
  );
}

/* ─────────── SMART COMPOSER ─────────── */

function SmartComposer({ chat }: { chat: Conversation }) {
  const [value, setValue] = useState("");
  const [emotion, setEmotion] = useState<WorkStatus>("CODING");
  const [showEmotions, setShowEmotions] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent">("idle");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => { setValue(""); ref.current?.focus(); }, [chat.id]);

  const max = 2000;
  const left = max - value.length;

  const handleSend = () => {
    if (!value.trim() || sendState !== "idle") return;
    setSendState("sending");
    setTimeout(() => {
      setSendState("sent");
      setValue("");
      setTimeout(() => setSendState("idle"), 900);
    }, 420);
  };

  return (
    <div className="border-t border-border bg-surface px-6 py-3.5">
      <div className="mx-auto max-w-4xl space-y-2.5">
        {/* AI Suggestion floating panel */}
        <AiSuggestionPanel onPick={(t) => { setValue(t); ref.current?.focus(); }} />

        {/* Composer card — solid premium surface */}
        <div className="rounded-2xl border border-border bg-surface shadow-[0_1px_0_0_oklch(1_0_0/0.7)_inset,0_8px_24px_-12px_oklch(0.2_0.04_265/0.18)] transition-all duration-200 focus-within:border-primary/45 focus-within:shadow-[0_1px_0_0_oklch(1_0_0/0.7)_inset,0_0_0_4px_oklch(0.62_0.16_262/0.1),0_12px_32px_-12px_oklch(0.2_0.04_265/0.22)]">

          {/* Emotion drawer (revealed via long-press / More) */}
          {showEmotions && (
            <div className="animate-slide-down flex flex-wrap gap-1 border-b border-border-soft px-3 py-2">
              {(Object.keys(EMOTION) as WorkStatus[]).map((k) => (
                <button
                  key={k}
                  onClick={() => { setEmotion(k); setShowEmotions(false); }}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold transition-all ${EMOTION[k].cls} hover:scale-105`}
                >
                  <span className="emoji-3d">{EMOTION[k].icon}</span>
                  {EMOTION[k].label}
                </button>
              ))}
            </div>
          )}

          {/* Single row · minimal first experience: + Emoji 📎 🎤 [Message] Send */}
          <div
            className="relative flex items-end gap-1 px-2 py-1.5"
            onContextMenu={(e) => { e.preventDefault(); setShowEmotions((s) => !s); }}
          >
            {/* 1. More (+) — hides AI, Templates, Poll, Calendar, Code, Location, GIF, Sticker, Camera, Document, @ */}
            <MorePopover onPick={(t) => { setValue((v) => v + t); ref.current?.focus(); }} />

            {/* 2. Role-aware expressions */}
            <ExpressionPicker onPick={(e) => { setValue((v) => v + e); ref.current?.focus(); }} />

            {/* 3. Attachment */}
            <span className="hidden sm:contents"><CBtn label="Attach"><Paperclip className="h-[18px] w-[18px]" /></CBtn></span>

            {/* 4. Voice */}
            <span className="hidden sm:contents"><CBtn label="Voice note"><Mic className="h-[18px] w-[18px]" /></CBtn></span>

            {/* 5. Message Box */}
            <textarea
              ref={ref}
              data-shortcut="composer"
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, max))}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder={`Message ${chat.id}`}
              className="mx-1 max-h-40 min-h-[40px] w-full min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-[13.5px] leading-relaxed outline-none placeholder:text-muted-foreground"
            />

            {/* 6. Translate toggle — subtle */}
            <button
              onClick={() => setTranslate((t) => !t)}
              title="Translate before send"
              className={`press hidden h-9 w-9 place-items-center rounded-lg transition-all sm:grid ${
                translate ? "bg-primary/12 text-primary" : "text-muted-foreground/70 hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <Languages className="h-[18px] w-[18px]" />
            </button>

            {/* 7. Send */}
            <button
              onClick={handleSend}
              disabled={!value.trim() || sendState !== "idle"}
              className={`ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-all duration-300 active:scale-90 disabled:opacity-50 sm:h-10 sm:w-10 ${
                sendState === "sent"
                  ? "bg-[--color-success] text-white shadow-[var(--shadow-glow)]"
                  : value.trim() || sendState === "sending"
                  ? "bg-gradient-bubble text-bubble-out-foreground shadow-[var(--shadow-glow)] hover:scale-105"
                  : "bg-surface-hover text-muted-foreground"
              }`}
            >
              {sendState === "sent" ? (
                <CheckCheck key="sent" className="send-success h-4 w-4" />
              ) : sendState === "sending" ? (
                <span className="tg-typing"><span /><span /><span /></span>
              ) : (
                <Send key="send" className="send-success h-4 w-4 -translate-x-px" />
              )}
            </button>
          </div>

          {/* Minimal meta strip — hidden affordances surfaced subtly */}
          <div className="flex items-center justify-between gap-2 border-t border-border-soft px-3 py-1.5 text-[10px] text-muted-foreground">
            <span className="flex min-w-0 items-center gap-2">
              <button
                onClick={() => setShowEmotions((s) => !s)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 font-semibold transition-all hover:border-primary/40 hover:text-foreground"
                title="Set emotion / status"
              >
                <span className="emoji-3d">{EMOTION[emotion].icon}</span>
                {EMOTION[emotion].label}
              </button>
              <span className="hidden opacity-60 lg:inline">·</span>
              <span className="hidden items-center gap-2 lg:inline-flex">
                <kbd className="rounded border border-border bg-surface px-1">⏎</kbd> send
                <kbd className="rounded border border-border bg-surface px-1">⇧⏎</kbd> new line
                <kbd className="rounded border border-border bg-surface px-1">⌘K</kbd> more
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
              <span className="hidden items-center gap-1 sm:inline-flex"><Lock className="h-2.5 w-2.5" /> Sealed · {chat.id}</span>
              <span className={`font-mono ${left < 100 ? "text-[--color-warning]" : ""}`}>{value.length}/{max}</span>
            </span>

          </div>
        </div>
      </div>
    </div>
  );
}

function AiSuggestionPanel({ onPick }: { onPick: (t: string) => void }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/[0.08] via-transparent to-gold/[0.04] px-3 py-2 shadow-[var(--shadow-elegant)]">
      <div className="flex shrink-0 items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-gold">
        <Sparkles className="h-3.5 w-3.5" /> AI Smart Replies
      </div>
      <div className="scrollbar-thin flex flex-1 items-center gap-1.5 overflow-x-auto">
        {SMART_REPLIES.map((t) => (
          <button
            key={t}
            onClick={() => onPick(t)}
            className="shrink-0 rounded-full border border-border bg-surface px-3 py-1 text-[11.5px] font-medium transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:bg-gold/10"
          >
            {t}
          </button>
        ))}
      </div>
      <button onClick={() => setHidden(true)} className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CBtn({ children, accent, label }: { children: React.ReactNode; accent?: boolean; label?: string }) {
  return (
    <button title={label} className={`press grid h-9 w-9 place-items-center rounded-lg transition-all active:scale-95 ${accent ? "text-gold hover:bg-gold/15" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function ChipBtn({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10.5px] transition-all ${
        active ? "border-gold/40 bg-gold/15 text-gold" : "border-border bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/* Sticker icon (lucide doesn't have a clean rounded one) */
function Sticker() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M15.5 3H8a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h7l6-6V8a5 5 0 0 0-5-5Z" />
      <path d="M15 21v-3a3 3 0 0 1 3-3h3" />
    </svg>
  );
}

/* "+" More popover — hides advanced tools (AI, Templates, GIF, Sticker, Camera, Code, Poll, etc.) */
function MorePopover({ onPick }: { onPick: (insert: string) => void }) {
  const [open, setOpen] = useState(false);
  type Item = {
    icon: React.ReactNode;
    label: string;
    hint?: string;
    accent?: "ai" | "live" | "create";
    insert?: string;
  };
  const groups: { title: string; items: Item[] }[] = [
    {
      title: "Intelligence",
      items: [
        { icon: <Wand2 className="h-4 w-4" />, label: "AI Suggest", hint: "Draft reply", accent: "ai" },
        { icon: <Sparkles className="h-4 w-4" />, label: "Quick Action", hint: "Workflow", accent: "ai" },
        { icon: <FileText className="h-4 w-4" />, label: "Template", hint: "Saved replies" },
        { icon: <Zap className="h-4 w-4" />, label: "Snippet", hint: "Insert", insert: "/" },
      ],
    },
    {
      title: "Create",
      items: [
        { icon: <BarChart3 className="h-4 w-4" />, label: "Poll", hint: "Collect votes", accent: "create" },
        { icon: <Calendar className="h-4 w-4" />, label: "Calendar", hint: "Schedule" },
        { icon: <Ticket className="h-4 w-4" />, label: "AMS Task", hint: "Create ticket", accent: "create" },
        { icon: <Code2 className="h-4 w-4" />, label: "Code Block", hint: "Syntax", insert: "\n```\n\n```\n" },
      ],
    },
    {
      title: "Attach",
      items: [
        { icon: <ImageIcon className="h-4 w-4" />, label: "Photo", hint: "From device" },
        { icon: <File className="h-4 w-4" />, label: "Document", hint: "Any file" },
        { icon: <Camera className="h-4 w-4" />, label: "Camera", hint: "Capture", accent: "live" },
        { icon: <Film className="h-4 w-4" />, label: "GIF", hint: "Library" },
      ],
    },
    {
      title: "Live",
      items: [
        { icon: <Sticker />, label: "Sticker", hint: "Brand pack" },
        { icon: <MapPin className="h-4 w-4" />, label: "Location", hint: "Share", accent: "live" },
        { icon: <Mic className="h-4 w-4" />, label: "Voice", hint: "Record" },
        { icon: <AtSign className="h-4 w-4" />, label: "Mention", hint: "Tag user", insert: "@" },
      ],
    },
  ];

  const accentRing: Record<NonNullable<Item["accent"]>, string> = {
    ai: "ring-1 ring-gold/40 bg-gold/10 text-gold",
    live: "ring-1 ring-[--color-success]/40 bg-[--color-success]/10 text-[--color-success]",
    create: "ring-1 ring-primary/40 bg-primary/10 text-primary",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="More tools"
        className={`press grid h-9 w-9 place-items-center rounded-lg transition-all duration-300 ${
          open ? "bg-gold/15 text-gold rotate-45 scale-110" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        }`}
      >
        <Plus className="h-[18px] w-[18px]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20 animate-fade-in-up" style={{ animationDuration: "180ms" }} onClick={() => setOpen(false)} />
          <div className="popover-spring-in absolute bottom-12 left-0 z-30 w-[380px] overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_20px_60px_-12px_oklch(0.2_0.04_265/0.35),0_8px_24px_-8px_oklch(0.2_0.04_265/0.2)]">
            <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-gold/[0.06] via-transparent to-transparent px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-gold/15 text-gold">
                  <Plus className="h-3 w-3" />
                </span>
                <span className="text-[11px] font-bold tracking-wide">More tools</span>
              </div>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">⌘K</span>
            </div>
            <div className="max-h-[440px] overflow-y-auto p-2.5">
              {groups.map((g, gi) => {
                let cursor = gi * 4;
                return (
                  <div key={g.title} className="mb-2.5 last:mb-0">
                    <div
                      className="popover-group-title px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                      style={{ ["--g" as never]: gi }}
                    >
                      {g.title}
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {g.items.map((it) => {
                        const i = cursor++;
                        return (
                          <button
                            key={it.label}
                            onClick={() => { if (it.insert) onPick(it.insert); setOpen(false); }}
                            style={{ ["--i" as never]: i }}
                            className="popover-item group flex flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-hover"
                          >
                            <span
                              className={`grid h-10 w-10 place-items-center rounded-xl bg-surface shadow-[inset_0_1px_0_oklch(1_0_0/0.6),0_2px_6px_-2px_oklch(0.2_0.04_265/0.15)] transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.8),0_8px_18px_-6px_oklch(0.55_0.18_264/0.35)] ${
                                it.accent ? accentRing[it.accent] : "text-foreground"
                              }`}
                            >
                              {it.icon}
                            </span>
                            <span className="text-[10px] font-semibold leading-tight">{it.label}</span>
                            {it.hint && (
                              <span className="text-[8.5px] font-medium uppercase tracking-wider text-muted-foreground">
                                {it.hint}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-border/60 bg-surface/40 px-3 py-1.5 text-[9.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Lock className="h-2.5 w-2.5" /> Sealed · E2E</span>
              <span className="font-semibold">Software Vala™</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
