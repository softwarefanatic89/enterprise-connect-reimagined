import { useCallback, useEffect, useRef, useState } from "react";
import { Languages, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { useLanguage, languageLabel } from "@/lib/language";
import { translateText } from "@/lib/translate.functions";

/* ── Cache ─────────────────────────────────────────────
   Two-layer cache: in-memory Map for the session, plus a
   persistent localStorage layer keyed by (lang, text-hash)
   so re-opening a conversation doesn't re-translate.
──────────────────────────────────────────────────────── */
const memCache = new Map<string, string>();
const LS_PREFIX = "sv.tt.v1:";
const LS_INDEX = "sv.tt.v1.index";
const MAX_ENTRIES = 500;

function djb2(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
}
const cacheKey = (lang: string, text: string) => `${lang}:${djb2(text)}`;

function readPersistent(key: string): string | undefined {
  try {
    const v = localStorage.getItem(LS_PREFIX + key);
    return v === null ? undefined : v;
  } catch { return undefined; }
}
function writePersistent(key: string, value: string) {
  try {
    localStorage.setItem(LS_PREFIX + key, value);
    // maintain small LRU index to bound storage
    const idxRaw = localStorage.getItem(LS_INDEX);
    const idx: string[] = idxRaw ? JSON.parse(idxRaw) : [];
    const filtered = idx.filter((k) => k !== key);
    filtered.push(key);
    while (filtered.length > MAX_ENTRIES) {
      const drop = filtered.shift()!;
      localStorage.removeItem(LS_PREFIX + drop);
    }
    localStorage.setItem(LS_INDEX, JSON.stringify(filtered));
  } catch { /* ignore quota */ }
}

/* Track in-flight promises so N bubbles of the same text
   only trigger a single network round-trip. */
const inflight = new Map<string, Promise<string>>();

function fetchTranslation(text: string, target: string): Promise<string> {
  const key = cacheKey(target, text);
  const cached = memCache.get(key) ?? readPersistent(key);
  if (cached !== undefined) {
    memCache.set(key, cached);
    return Promise.resolve(cached);
  }
  const existing = inflight.get(key);
  if (existing) return existing;

  const p = translateText({ data: { text, target } })
    .then((r) => {
      memCache.set(key, r.translated);
      writePersistent(key, r.translated);
      inflight.delete(key);
      return r.translated;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });
  inflight.set(key, p);
  return p;
}

/* ── Component ─────────────────────────────────────── */
type State = "idle" | "loading" | "streaming" | "done" | "error";

export function TranslatedText({
  text,
  msgId,
  conversationId,
  className,
  toneClass,
}: {
  text: string;
  msgId: string;
  conversationId?: string;
  className?: string;
  toneClass?: string;
}) {
  const { lang, autoTranslate } = useLanguage(conversationId);
  const [translated, setTranslated] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string>("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showOriginal, setShowOriginal] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const activeKey = useRef<string>("");
  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Stream the translated text in like a subtitle track.
     Cached hits skip streaming (instant). */
  const streamReveal = useCallback((full: string) => {
    if (revealTimer.current) clearInterval(revealTimer.current);
    setRevealed("");
    setState("streaming");
    // Reveal ~2 chars per tick, capped so long messages finish in ~1.2s
    const total = full.length;
    const step = Math.max(2, Math.ceil(total / 60));
    let i = 0;
    revealTimer.current = setInterval(() => {
      i = Math.min(total, i + step);
      setRevealed(full.slice(0, i));
      if (i >= total) {
        if (revealTimer.current) clearInterval(revealTimer.current);
        revealTimer.current = null;
        setState("done");
      }
    }, 22);
  }, []);

  useEffect(() => {
    if (!autoTranslate) {
      setTranslated(null);
      setRevealed("");
      setState("idle");
      setErrorMsg("");
      return;
    }
    const key = `${msgId}::${lang}::${attempt}`;
    activeKey.current = key;

    const cKey = cacheKey(lang, text);
    const cached = memCache.get(cKey) ?? readPersistent(cKey);
    if (cached !== undefined) {
      memCache.set(cKey, cached);
      const isSame = cached === text;
      setTranslated(isSame ? null : cached);
      setRevealed(isSame ? "" : cached);
      setState("done");
      setErrorMsg("");
      return;
    }

    setState("loading");
    setTranslated(null);
    setRevealed("");
    setErrorMsg("");
    setShowOriginal(false);

    fetchTranslation(text, lang)
      .then((out) => {
        if (activeKey.current !== key) return;
        if (out === text) {
          setTranslated(null);
          setState("done");
          return;
        }
        setTranslated(out);
        streamReveal(out);
      })
      .catch((err: unknown) => {
        if (activeKey.current !== key) return;
        setErrorMsg(err instanceof Error ? err.message : "Translation unavailable");
        setState("error");
        // Auto-fallback: keep original visible (translated stays null)
      });

    return () => {
      if (revealTimer.current) clearInterval(revealTimer.current);
    };
  }, [text, lang, autoTranslate, msgId, attempt, streamReveal]);

  const retry = () => setAttempt((n) => n + 1);

  const showTranslated = autoTranslate && translated && !showOriginal && state !== "error";
  const body = showTranslated
    ? (state === "streaming" ? revealed : translated)
    : text;

  return (
    <span className={className}>
      <span className="whitespace-pre-wrap">
        {body}
        {state === "streaming" && (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-[1em] w-[2px] -mb-[2px] animate-pulse bg-current opacity-70 align-baseline"
          />
        )}
      </span>

      {autoTranslate && state !== "idle" && (
        <span
          className={`mt-1.5 flex flex-wrap items-center gap-1.5 text-[10.5px] font-medium ${
            toneClass ?? "text-muted-foreground"
          }`}
        >
          {state === "loading" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Translating to {languageLabel(lang)}…</span>
            </>
          )}
          {state === "streaming" && (
            <>
              <Languages className="h-3 w-3" />
              <span>Live · {languageLabel(lang)}</span>
            </>
          )}
          {state === "done" && translated && (
            <>
              <Languages className="h-3 w-3" />
              <span>
                {showOriginal
                  ? "Showing original"
                  : `Auto-translated · ${languageLabel(lang)}`}
              </span>
              <button
                type="button"
                onClick={() => setShowOriginal((v) => !v)}
                className="ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
              >
                {showOriginal ? "Show translation" : "Show original"}
              </button>
            </>
          )}
          {state === "error" && (
            <>
              <AlertTriangle className="h-3 w-3" />
              <span title={errorMsg}>
                Translation failed · showing original
              </span>
              <button
                type="button"
                onClick={retry}
                className="ml-1 inline-flex items-center gap-1 rounded-md border border-current/30 px-1.5 py-0.5 text-[10px] font-semibold hover:bg-current/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Retry
              </button>
            </>
          )}
        </span>
      )}
    </span>
  );
}
