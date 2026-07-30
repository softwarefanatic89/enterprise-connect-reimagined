import { Fragment, useMemo, useState } from "react";
import {
  Bold, Italic, Strikethrough, Code, FileCode2, Link2, Palette, AtSign,
  Hash, Users, ExternalLink, FileText, Play, Image as ImageIcon,
} from "lucide-react";
import { ROLE, type RoleCode } from "./data";

/* ─────────── Rich text toolbar (composer) ─────────── */

export type MentionEntity = { id: string; kind: "user" | "channel" | "group"; role?: RoleCode };

export const MENTIONABLE: MentionEntity[] = [
  { id: "all", kind: "group" },
  { id: "DEV-004521", kind: "user", role: "DEV" },
  { id: "QA-001284", kind: "user", role: "QA" },
  { id: "BOSS-000001", kind: "user", role: "BOSS" },
  { id: "SUP-005812", kind: "user", role: "SUP" },
  { id: "CUS-008742", kind: "user", role: "CUS" },
  { id: "AMS-002041", kind: "channel" },
  { id: "PRJ-ATLAS-23", kind: "channel" },
  { id: "DPT-SUPPORT", kind: "channel" },
];

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6", "#ec4899"];

export function RichTextToolbar({
  onWrap, onInsert,
}: {
  onWrap: (before: string, after?: string) => void;
  onInsert: (text: string) => void;
}) {
  const [colorOpen, setColorOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border-soft px-2 py-1">
      <TBtn label="Bold (**text**)" onClick={() => onWrap("**", "**")}><Bold className="h-3.5 w-3.5" /></TBtn>
      <TBtn label="Italic (*text*)" onClick={() => onWrap("*", "*")}><Italic className="h-3.5 w-3.5" /></TBtn>
      <TBtn label="Strikethrough (~~text~~)" onClick={() => onWrap("~~", "~~")}><Strikethrough className="h-3.5 w-3.5" /></TBtn>
      <TBtn label="Inline code (`text`)" onClick={() => onWrap("`", "`")}><Code className="h-3.5 w-3.5" /></TBtn>
      <TBtn label="Code block" onClick={() => onWrap("\n```\n", "\n```\n")}><FileCode2 className="h-3.5 w-3.5" /></TBtn>
      <TBtn label="Link [text](url)" onClick={() => onWrap("[", "](https://)")}><Link2 className="h-3.5 w-3.5" /></TBtn>
      <span className="mx-0.5 h-4 w-px bg-border" />
      <div className="relative">
        <TBtn label="Text color" onClick={() => setColorOpen((o) => !o)}><Palette className="h-3.5 w-3.5" /></TBtn>
        {colorOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setColorOpen(false)} />
            <div className="absolute bottom-9 left-0 z-30 flex items-center gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-lg">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  onClick={() => { onWrap(`{color:${c}}`, "{/color}"); setColorOpen(false); }}
                  className="h-5 w-5 rounded-full ring-1 ring-border transition-transform hover:scale-110"
                  style={{ background: c }}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <span className="ml-auto hidden items-center gap-1 text-[9.5px] text-muted-foreground sm:inline-flex">
        Markdown supported · **bold** *italic* `code` &gt; quote
      </span>
    </div>
  );
}

function TBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground"
    >
      {children}
    </button>
  );
}

/* ─────────── @ mention autocomplete popover ─────────── */

export function MentionPopover({
  query, onPick,
}: {
  query: string;
  onPick: (entity: MentionEntity) => void;
}) {
  const matches = useMemo(
    () => MENTIONABLE.filter((m) => m.id.toLowerCase().includes(query.toLowerCase())).slice(0, 6),
    [query],
  );
  if (matches.length === 0) return null;
  return (
    <div className="absolute bottom-full left-0 z-30 mb-1.5 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-[0_20px_50px_-16px_oklch(0.2_0.05_265/0.4)]">
      <div className="border-b border-border/60 px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
        Mention
      </div>
      <div className="max-h-48 overflow-y-auto py-1">
        {matches.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick(m)}
            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-mono transition-colors hover:bg-surface-hover"
          >
            {m.kind === "group" ? (
              <Users className="h-3.5 w-3.5 text-primary" />
            ) : m.kind === "channel" ? (
              <Hash className="h-3.5 w-3.5 text-primary" />
            ) : (
              <span className="text-[13px]">{m.role ? ROLE[m.role].icon : "👤"}</span>
            )}
            @{m.id}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Rich-ish markdown renderer for message bodies ─────────── */

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // order matters: code > bold > italic > strike > links > mentions
  const tokens: React.ReactNode[] = [];
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(~~[^~]+~~)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))|(@[A-Za-z0-9_-]+)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text))) {
    if (match.index > last) tokens.push(text.slice(last, match.index));
    const t = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (t.startsWith("`")) {
      tokens.push(<code key={key} className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.92em]">{t.slice(1, -1)}</code>);
    } else if (t.startsWith("**")) {
      tokens.push(<strong key={key} className="font-bold">{t.slice(2, -2)}</strong>);
    } else if (t.startsWith("~~")) {
      tokens.push(<s key={key} className="opacity-70">{t.slice(2, -2)}</s>);
    } else if (t.startsWith("*")) {
      tokens.push(<em key={key} className="italic">{t.slice(1, -1)}</em>);
    } else if (t.startsWith("[")) {
      const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t);
      tokens.push(
        <a key={key} href={m?.[2] ?? "#"} onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-0.5 font-semibold text-primary underline decoration-primary/40 underline-offset-2">
          {m?.[1]} <ExternalLink className="h-2.5 w-2.5" />
        </a>,
      );
    } else if (t.startsWith("@")) {
      tokens.push(
        <span key={key} className="mx-0.5 inline-flex items-center rounded-md bg-primary-soft px-1 py-0.5 font-mono text-[0.9em] font-bold text-primary">
          {t}
        </span>,
      );
    }
    last = match.index + t.length;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
}

/** Renders a message body supporting bold/italic/strike/code/code-blocks/blockquotes/links/@mentions. */
export function RichBody({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { code.push(lines[i]); i++; }
      i++; // skip closing fence
      blocks.push(
        <pre key={key++} className="scrollbar-thin my-1.5 overflow-x-auto rounded-lg bg-[oklch(0.16_0.02_270)] px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[oklch(0.88_0.02_150)]">
          <code>
            {code.map((l, li) => (
              <div key={li}>
                <span className="mr-2 select-none text-[oklch(0.5_0.02_270)]">{li + 1}</span>
                {l || " "}
              </div>
            ))}
          </code>
        </pre>,
      );
      continue;
    }
    if (line.trim().startsWith(">")) {
      blocks.push(
        <blockquote key={key++} className="my-1 border-l-2 border-primary/50 bg-primary-soft/40 px-2.5 py-1 italic text-[0.96em]">
          {renderInline(line.replace(/^\s*>\s?/, ""), `q${key}`)}
        </blockquote>,
      );
      i++;
      continue;
    }
    blocks.push(<Fragment key={key++}>{renderInline(line, `l${key}`)}{i < lines.length - 1 && <br />}</Fragment>);
    i++;
  }
  return <span className={className}>{blocks}</span>;
}

/* ─────────── Inline preview cards for links/attachments ─────────── */

export function LinkPreviewCard({ url, title, domain }: { url: string; title: string; domain: string }) {
  return (
    <a
      href={url}
      onClick={(e) => e.preventDefault()}
      className="mt-2 flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface-hover px-2.5 py-2 transition-colors hover:border-primary/40"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <Link2 className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[12.5px] font-bold">{title}</div>
        <div className="truncate text-[10.5px] text-muted-foreground">{domain}</div>
      </div>
      <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

export function VideoPreviewCard({ id, duration }: { id: string; duration: string }) {
  return (
    <div className="relative mt-2 h-40 w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="absolute inset-0 grid place-items-center">
        <button className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform hover:scale-110">
          <Play className="h-4 w-4 translate-x-px" />
        </button>
      </div>
      <div className="absolute bottom-1.5 right-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">{duration}</div>
      <div className="absolute left-2 top-1.5 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[9.5px] text-white">{id}</div>
    </div>
  );
}
