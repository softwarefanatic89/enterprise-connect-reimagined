import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message, RoleCode, WorkStatus, Priority } from "@/components/chat/data";

export type LiveRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  role: string;
  department: string;
  module: string;
  status: string;
  priority: string;
  body: string;
  author_uid: string | null;
  created_at: string;
};

function toMessage(row: LiveRow, uid: string | null): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    role: row.role as RoleCode,
    department: row.department,
    module: row.module,
    status: row.status as WorkStatus,
    priority: row.priority as Priority,
    time: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    out: !!uid && row.author_uid === uid,
    text: row.body,
    emotion: row.status as WorkStatus,
    read: "delivered",
  };
}

type SendInput = {
  conversationId: string;
  text: string;
  status?: WorkStatus;
  role?: RoleCode;
  department?: string;
  module?: string;
  priority?: Priority;
};

type Ctx = {
  connected: boolean;
  byConversation: Record<string, Message[]>;
  unread: Record<string, number>;
  markRead: (conversationId: string) => void;
  send: (input: SendInput) => Promise<boolean>;
};

const LiveMessagesContext = createContext<Ctx | null>(null);

export function LiveMessagesProvider({ children }: { children: React.ReactNode }) {
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const seen = useRef<Set<string>>(new Set());

  const ingest = useCallback((incoming: LiveRow[], countUnread: boolean) => {
    const fresh = incoming.filter((r) => !seen.current.has(r.id));
    if (!fresh.length) return;
    fresh.forEach((r) => seen.current.add(r.id));
    setRows((prev) =>
      [...prev, ...fresh].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    );
    if (countUnread) {
      setUnread((prev) => {
        const next = { ...prev };
        for (const r of fresh) next[r.conversation_id] = (next[r.conversation_id] ?? 0) + 1;
        return next;
      });
    }
  }, []);

  // Session (used only to mark own messages as outgoing).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUid(s?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Initial history + realtime stream of new message bodies.
  useEffect(() => {
    let cancelled = false;

    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(300)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        ingest(data as LiveRow[], false);
      });

    const channel = supabase
      .channel("chat_messages_stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => ingest([payload.new as LiveRow], true),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_messages" },
        (payload) => {
          const gone = (payload.old as Partial<LiveRow>).id;
          if (!gone) return;
          seen.current.delete(gone);
          setRows((prev) => prev.filter((r) => r.id !== gone));
        },
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [ingest]);

  const byConversation = useMemo(() => {
    const map: Record<string, Message[]> = {};
    for (const r of rows) {
      (map[r.conversation_id] ??= []).push(toMessage(r, uid));
    }
    return map;
  }, [rows, uid]);

  const markRead = useCallback((conversationId: string) => {
    setUnread((prev) => (prev[conversationId] ? { ...prev, [conversationId]: 0 } : prev));
  }, []);

  const send = useCallback(
    async (input: SendInput) => {
      const { data: session } = await supabase.auth.getSession();
      const author = session.session?.user.id ?? null;
      if (!author) return false; // not signed in — caller keeps local-only behaviour
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: input.conversationId,
        sender_id: input.role ? `${input.role}-SELF` : "BOSS-000001",
        role: input.role ?? "BOSS",
        department: input.department ?? "DPT-LEAD",
        module: input.module ?? "MOD-CHAT-CORE",
        status: input.status ?? "CODING",
        priority: input.priority ?? "P2",
        body: input.text,
        author_uid: author,
      });
      return !error;
    },
    [],
  );

  const value = useMemo<Ctx>(
    () => ({ connected, byConversation, unread, markRead, send }),
    [connected, byConversation, unread, markRead, send],
  );

  return <LiveMessagesContext.Provider value={value}>{children}</LiveMessagesContext.Provider>;
}

const EMPTY: Ctx = {
  connected: false,
  byConversation: {},
  unread: {},
  markRead: () => {},
  send: async () => false,
};

export function useLiveMessages(): Ctx {
  return useContext(LiveMessagesContext) ?? EMPTY;
}