import { useMemo, useState } from "react";
import {
  AtSign,
  Bell,
  CheckCheck,
  CircleAlert,
  Dot,
  MessageSquareQuote,
  ShieldCheck,
  TicketCheck,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type NotifKind = "mention" | "approval" | "system" | "message" | "alert";
type Bucket = "today" | "yesterday" | "earlier";

type Notif = {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  meta: string;
  time: string;
  bucket: Bucket;
  read: boolean;
};

/* UI-only seed state — no backend, no fetch. */
const SEED: Notif[] = [
  {
    id: "NTF-000148",
    kind: "mention",
    title: "BOSS-000001 mentioned you",
    body: "@you please sign off the RC1 release checklist before 18:00.",
    meta: "CONV-000231 · MSG-100007",
    time: "09:42",
    bucket: "today",
    read: false,
  },
  {
    id: "NTF-000147",
    kind: "approval",
    title: "Approval requested",
    body: "Hotfix deployment window for PRJ-ATLAS-23 needs lead approval.",
    meta: "AMS-004512 · P1",
    time: "09:10",
    bucket: "today",
    read: false,
  },
  {
    id: "NTF-000146",
    kind: "alert",
    title: "Queue breach warning",
    body: "Waiting queue for DPT-SUPPORT exceeded the 12-minute SLA target.",
    meta: "DPT-SUPPORT · SLA",
    time: "08:55",
    bucket: "today",
    read: true,
  },
  {
    id: "NTF-000145",
    kind: "message",
    title: "New message in CONV-000198",
    body: "QA-001284 posted a regression summary with 3 blocking defects.",
    meta: "CONV-000198 · QA",
    time: "17:31",
    bucket: "yesterday",
    read: false,
  },
  {
    id: "NTF-000144",
    kind: "system",
    title: "Retention policy updated",
    body: "Message retention for WS-SV-PRIME changed to 7 years by an owner.",
    meta: "WS-SV-PRIME · Governance",
    time: "14:06",
    bucket: "yesterday",
    read: true,
  },
  {
    id: "NTF-000143",
    kind: "approval",
    title: "Access request approved",
    body: "Analytics export permission granted to DPT-LEAD role.",
    meta: "RBAC · Analytics",
    time: "Mon",
    bucket: "earlier",
    read: true,
  },
  {
    id: "NTF-000142",
    kind: "system",
    title: "Audit bundle ready",
    body: "Quarterly audit export for Q2 is available in the Audit Center.",
    meta: "AUD-2026-Q2",
    time: "Mon",
    bucket: "earlier",
    read: true,
  },
];

const KIND_META: Record<NotifKind, { icon: React.ReactNode; tone: string; label: string }> = {
  mention: {
    icon: <AtSign className="h-3.5 w-3.5" />,
    tone: "bg-primary/15 text-primary ring-primary/25",
    label: "Mention",
  },
  approval: {
    icon: <TicketCheck className="h-3.5 w-3.5" />,
    tone: "bg-gold/15 text-gold ring-gold/25",
    label: "Approval",
  },
  message: {
    icon: <MessageSquareQuote className="h-3.5 w-3.5" />,
    tone: "bg-sidebar-surface text-foreground ring-border",
    label: "Message",
  },
  alert: {
    icon: <CircleAlert className="h-3.5 w-3.5" />,
    tone: "bg-[--color-destructive]/15 text-[--color-destructive] ring-[--color-destructive]/25",
    label: "Alert",
  },
  system: {
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    tone: "bg-muted text-muted-foreground ring-border",
    label: "System",
  },
};

const BUCKET_LABEL: Record<Bucket, string> = {
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
};
const BUCKET_ORDER: Bucket[] = ["today", "yesterday", "earlier"];

export function NotificationCenter() {
  const [items, setItems] = useState<Notif[]>(SEED);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [open, setOpen] = useState(false);

  const unreadCount = items.filter((n) => !n.read).length;

  const visible = useMemo(
    () => (tab === "unread" ? items.filter((n) => !n.read) : items),
    [items, tab],
  );

  const grouped = useMemo(
    () =>
      BUCKET_ORDER.map((b) => ({
        bucket: b,
        rows: visible.filter((n) => n.bucket === b),
      })).filter((g) => g.rows.length > 0),
    [visible],
  );

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));

  const toggleRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Notifications"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ", all read"}`}
          className="relative grid h-9 w-9 place-items-center rounded-lg text-sidebar-muted transition-all hover:bg-sidebar-surface-hover hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 data-[state=open]:bg-sidebar-surface-hover data-[state=open]:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-[--color-destructive] px-1 text-[9px] font-bold text-white ring-2 ring-sidebar">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-[360px] max-w-[92vw] p-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-[12.5px] font-bold leading-tight">Notifications</div>
            <div className="truncate text-[10.5px] text-muted-foreground">
              {unreadCount ? `${unreadCount} unread · WS-SV-PRIME` : "You're all caught up"}
            </div>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[10.5px] font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <CheckCheck className="h-3 w-3" /> Mark all read
          </button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Notification filter"
          className="flex items-center gap-1 border-b border-border px-2 py-1.5"
        >
          {(["all", "unread"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                tab === t
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t}
              {t === "unread" && unreadCount > 0 && (
                <span className="ml-1 font-mono tabular-nums">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto">
          {grouped.length === 0 ? (
            <div className="grid place-items-center gap-1.5 px-4 py-10 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
                <CheckCheck className="h-4 w-4" />
              </div>
              <div className="text-[12px] font-semibold">Nothing unread</div>
              <div className="text-[10.5px] text-muted-foreground">
                New mentions, approvals and alerts will appear here.
              </div>
            </div>
          ) : (
            grouped.map((g) => (
              <section key={g.bucket} aria-label={BUCKET_LABEL[g.bucket]}>
                <div className="sticky top-0 z-10 bg-popover/95 px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
                  {BUCKET_LABEL[g.bucket]}
                </div>
                <ul className="pb-1">
                  {g.rows.map((n) => {
                    const k = KIND_META[n.kind];
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => toggleRead(n.id)}
                          aria-label={`${k.label}: ${n.title}. ${n.read ? "Mark as unread" : "Mark as read"}`}
                          className={`group flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
                            n.read ? "opacity-70" : ""
                          }`}
                        >
                          <span
                            className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1 ${k.tone}`}
                          >
                            {k.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`truncate text-[12px] ${n.read ? "font-medium" : "font-bold"}`}
                              >
                                {n.title}
                              </span>
                              <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                                {n.time}
                              </span>
                            </span>
                            <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-muted-foreground">
                              {n.body}
                            </span>
                            <span className="mt-1 flex items-center gap-1 font-mono text-[9.5px] text-muted-foreground/80">
                              <span className="truncate">{n.meta}</span>
                              <Dot className="h-3 w-3 shrink-0" />
                              <span className="shrink-0">{n.id}</span>
                            </span>
                          </span>
                          <span
                            aria-hidden
                            className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                              n.read ? "bg-transparent group-hover:bg-border" : "bg-primary"
                            }`}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <span className="font-mono text-[9.5px] text-muted-foreground">
            {items.length} total · retained per policy
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-[10.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Close
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}