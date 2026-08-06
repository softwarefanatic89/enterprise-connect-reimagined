import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles, RefreshCw, Loader2, Wand2, BookOpen, Gauge, ListChecks,
  StickyNote, Activity, ArrowUpRight, ShieldAlert, Languages, Send,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateCopilotBrief, type CopilotBrief } from "@/lib/copilot.functions";
import { useLiveMessages } from "@/lib/live-messages";
import type { Conversation } from "@/components/chat/data";

export const COPILOT_INSERT_EVENT = "sv:copilot-insert";

function insertIntoComposer(text: string) {
  window.dispatchEvent(new CustomEvent(COPILOT_INSERT_EVENT, { detail: text }));
}

export function AICopilotPanel({ chat, mobile = false }: { chat: Conversation; mobile?: boolean }) {
  const run = useServerFn(generateCopilotBrief);
  const { byConversation } = useLiveMessages();
  const [brief, setBrief] = useState<CopilotBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const turns = useMemo(() => {
    const live = byConversation[chat.id] ?? [];
    const base = live.map((m) => ({ role: m.role, text: m.text ?? "", out: !!m.out }));
    return base.length ? base : [{ role: chat.role ?? "CUS", text: chat.lastPreview, out: false }];
  }, [byConversation, chat]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await run({
        data: {
          conversationId: chat.id,
          department: chat.department,
          module: chat.module,
          turns,
        },
      });
      setBrief(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Copilot unavailable";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [run, chat.id, chat.department, chat.module, turns]);

  useEffect(() => {
    setBrief(null);
    setError(null);
  }, [chat.id]);

  return (
    <aside
      aria-label="AI Copilot"
      className={`panel-dark scrollbar-thin h-full shrink-0 flex-col overflow-y-auto border-l border-sidebar-border outline-none ${
        mobile ? "flex w-full" : "hidden w-[clamp(300px,20vw,352px)] xl:flex"
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-sidebar-border bg-sidebar/95 px-4 py-3 backdrop-blur-xl">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[12.5px] font-bold tracking-tight">AIRA Copilot</div>
          <div className="font-mono text-[9.5px] text-sidebar-muted">Executive supervisor · {chat.id}</div>
        </div>
        <button
          onClick={() => void refresh()}
          disabled={loading}
          title="Regenerate brief"
          className="grid h-8 w-8 place-items-center rounded-lg text-sidebar-muted transition-all hover:bg-sidebar-surface-hover hover:text-foreground active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </div>

      {!brief && !loading && (
        <EmptyState error={error} onRun={() => void refresh()} />
      )}

      {loading && !brief && <SkeletonBrief />}

      {brief && (
        <div className="flex flex-col">
          <Section icon={<Wand2 className="h-3.5 w-3.5" />} title="AI Summary">
            <p className="text-[12px] leading-relaxed text-foreground/90">{brief.summary}</p>
            {brief.bullets.length > 0 && (
              <ul className="mt-2 space-y-1">
                {brief.bullets.map((b) => (
                  <li key={b} className="flex gap-1.5 text-[11.5px] text-sidebar-muted">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section icon={<Send className="h-3.5 w-3.5" />} title="Suggested Replies">
            <div className="space-y-2">
              {brief.replies.map((r) => (
                <div
                  key={r.tone}
                  className="group rounded-xl border border-sidebar-border bg-sidebar-surface p-2.5 transition-all hover:border-primary/45"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary">
                      {r.tone}
                    </span>
                    <button
                      onClick={() => {
                        insertIntoComposer(r.text);
                        toast.success(`${r.tone} reply inserted into composer`);
                      }}
                      className="rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold text-sidebar-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-primary/15 hover:text-primary focus-visible:opacity-100"
                    >
                      Insert
                    </button>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-foreground/85">{r.text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Gauge className="h-3.5 w-3.5" />} title="Customer Insights">
            <div className="grid grid-cols-2 gap-1.5">
              <Stat label="Mood" value={brief.insights.mood} />
              <Stat label="Sentiment" value={brief.insights.sentiment} />
              <Stat label="Urgency" value={brief.insights.urgency} />
              <Stat label="Language" value={brief.insights.language} icon={<Languages className="h-2.5 w-2.5" />} />
              <div className="col-span-2">
                <Stat label="Conversation risk" value={brief.insights.risk} icon={<ShieldAlert className="h-2.5 w-2.5" />} />
              </div>
            </div>
          </Section>

          {brief.actions.length > 0 && (
            <Section icon={<ListChecks className="h-3.5 w-3.5" />} title="Suggested Actions">
              <div className="space-y-1.5">
                {brief.actions.map((a) => (
                  <button
                    key={a}
                    onClick={() => toast.success(`Action queued · ${a}`)}
                    className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-surface px-2.5 py-1.5 text-left text-[11.5px] font-medium transition-all hover:border-primary/45 hover:bg-sidebar-surface-hover active:scale-[0.99]"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{a}</span>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {brief.knowledge.length > 0 && (
            <Section icon={<BookOpen className="h-3.5 w-3.5" />} title="Knowledge Base">
              <div className="space-y-1.5">
                {brief.knowledge.map((k) => (
                  <div key={k.title} className="rounded-lg border border-sidebar-border bg-sidebar-surface px-2.5 py-2">
                    <div className="truncate text-[11.5px] font-semibold">{k.title}</div>
                    <div className="mt-0.5 text-[10.5px] leading-snug text-sidebar-muted">{k.hint}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section icon={<Activity className="h-3.5 w-3.5" />} title="Conversation Analytics">
            <div className="grid grid-cols-2 gap-1.5">
              <Stat label="Messages" value={String(turns.length)} />
              <Stat label="SLA" value="On track" />
              <Stat label="Avg response" value="2m 14s" />
              <Stat label="Waiting" value="00:42" />
            </div>
          </Section>

          <Section icon={<StickyNote className="h-3.5 w-3.5" />} title="Internal Notes">
            <textarea
              rows={3}
              placeholder="Internal note — visible to staff only, permanently audited."
              className="w-full resize-none rounded-lg border border-sidebar-border bg-sidebar-surface px-2.5 py-2 text-[11.5px] outline-none transition-all placeholder:text-sidebar-muted/70 focus:border-primary/55"
            />
          </Section>

          <div className="px-4 pb-5 pt-1 font-mono text-[9.5px] leading-relaxed text-sidebar-muted">
            AI output is advisory. Human agents remain responsible for final customer communication.
          </div>
        </div>
      )}
    </aside>
  );
}

function EmptyState({ error, onRun }: { error: string | null; onRun: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/25">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <div className="text-[13px] font-bold">Copilot standing by</div>
        <p className="text-[11.5px] leading-relaxed text-sidebar-muted">
          Generate a live executive brief with summary, smart replies, insights and next actions.
        </p>
      </div>
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-[11px] text-destructive">
          {error}
        </p>
      )}
      <button
        onClick={onRun}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-all hover:brightness-110 active:scale-95"
      >
        <Sparkles className="h-3.5 w-3.5" /> {error ? "Retry brief" : "Generate brief"}
      </button>
    </div>
  );
}

function SkeletonBrief() {
  return (
    <div className="space-y-3 p-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-2 rounded-xl border border-sidebar-border bg-sidebar-surface p-3">
          <div className="h-2.5 w-24 animate-pulse rounded-full bg-sidebar-surface-hover" />
          <div className="h-2 w-full animate-pulse rounded-full bg-sidebar-surface-hover" />
          <div className="h-2 w-4/5 animate-pulse rounded-full bg-sidebar-surface-hover" />
        </div>
      ))}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-sidebar-border px-4 py-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-sidebar-muted">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-surface px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-[9.5px] uppercase tracking-wider text-sidebar-muted">
        {icon}
        {label}
      </div>
      <div className="truncate text-[12px] font-semibold">{value}</div>
    </div>
  );
}
