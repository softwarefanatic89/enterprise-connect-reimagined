import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LangCode =
  | "en" | "hi" | "es" | "fr" | "de" | "pt" | "it" | "ja" | "ko"
  | "zh" | "ar" | "ru" | "tr" | "id" | "vi" | "bn" | "ta" | "mr" | "gu";

export const LANGUAGES: { code: LangCode; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English",    native: "English",    flag: "🇺🇸" },
  { code: "hi", label: "Hindi",      native: "हिन्दी",       flag: "🇮🇳" },
  { code: "es", label: "Spanish",    native: "Español",    flag: "🇪🇸" },
  { code: "fr", label: "French",     native: "Français",   flag: "🇫🇷" },
  { code: "de", label: "German",     native: "Deutsch",    flag: "🇩🇪" },
  { code: "pt", label: "Portuguese", native: "Português",  flag: "🇵🇹" },
  { code: "it", label: "Italian",    native: "Italiano",   flag: "🇮🇹" },
  { code: "ja", label: "Japanese",   native: "日本語",       flag: "🇯🇵" },
  { code: "ko", label: "Korean",     native: "한국어",        flag: "🇰🇷" },
  { code: "zh", label: "Chinese",    native: "中文",         flag: "🇨🇳" },
  { code: "ar", label: "Arabic",     native: "العربية",     flag: "🇸🇦" },
  { code: "ru", label: "Russian",    native: "Русский",    flag: "🇷🇺" },
  { code: "tr", label: "Turkish",    native: "Türkçe",     flag: "🇹🇷" },
  { code: "id", label: "Indonesian", native: "Bahasa",     flag: "🇮🇩" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "bn", label: "Bengali",    native: "বাংলা",       flag: "🇧🇩" },
  { code: "ta", label: "Tamil",      native: "தமிழ்",       flag: "🇮🇳" },
  { code: "mr", label: "Marathi",    native: "मराठी",       flag: "🇮🇳" },
  { code: "gu", label: "Gujarati",   native: "ગુજરાતી",     flag: "🇮🇳" },
];

const LS_LANG = "sv.chat.lang";
const LS_AUTO = "sv.chat.autoTranslate";
const LS_SCOPE_LANG = "sv.chat.lang.scopes";
const LS_SCOPE_AUTO = "sv.chat.auto.scopes";

type ScopeMap<T> = Record<string, T>;

type Ctx = {
  lang: LangCode;
  autoTranslate: boolean;
  setLang: (l: LangCode) => void;
  setAutoTranslate: (v: boolean) => void;
  // Per-conversation / per-workspace overrides
  getScopedLang: (scope?: string) => LangCode;
  getScopedAuto: (scope?: string) => boolean;
  setScopedLang: (scope: string, l: LangCode | null) => void;
  setScopedAuto: (scope: string, v: boolean | null) => void;
  hasScopeOverride: (scope: string) => boolean;
  clearScopeOverride: (scope: string) => void;
};

const LanguageCtx = createContext<Ctx | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function writeJSON(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");
  const [autoTranslate, setAutoState] = useState<boolean>(true);
  const [scopeLang, setScopeLang] = useState<ScopeMap<LangCode>>({});
  const [scopeAuto, setScopeAuto] = useState<ScopeMap<boolean>>({});

  useEffect(() => {
    try {
      const l = localStorage.getItem(LS_LANG) as LangCode | null;
      if (l && LANGUAGES.some((x) => x.code === l)) setLangState(l);
      const a = localStorage.getItem(LS_AUTO);
      if (a !== null) setAutoState(a === "1");
      setScopeLang(readJSON<ScopeMap<LangCode>>(LS_SCOPE_LANG, {}));
      setScopeAuto(readJSON<ScopeMap<boolean>>(LS_SCOPE_AUTO, {}));
    } catch { /* ignore */ }
  }, []);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    try { localStorage.setItem(LS_LANG, l); } catch { /* ignore */ }
  }, []);

  const setAutoTranslate = useCallback((v: boolean) => {
    setAutoState(v);
    try { localStorage.setItem(LS_AUTO, v ? "1" : "0"); } catch { /* ignore */ }
  }, []);

  const setScopedLang = useCallback((scope: string, l: LangCode | null) => {
    setScopeLang((prev) => {
      const next = { ...prev };
      if (l === null) delete next[scope]; else next[scope] = l;
      writeJSON(LS_SCOPE_LANG, next);
      return next;
    });
  }, []);
  const setScopedAuto = useCallback((scope: string, v: boolean | null) => {
    setScopeAuto((prev) => {
      const next = { ...prev };
      if (v === null) delete next[scope]; else next[scope] = v;
      writeJSON(LS_SCOPE_AUTO, next);
      return next;
    });
  }, []);

  const getScopedLang = useCallback(
    (scope?: string) => (scope && scopeLang[scope]) || lang,
    [lang, scopeLang],
  );
  const getScopedAuto = useCallback(
    (scope?: string) => (scope && scope in scopeAuto ? scopeAuto[scope] : autoTranslate),
    [autoTranslate, scopeAuto],
  );
  const hasScopeOverride = useCallback(
    (scope: string) => scope in scopeLang || scope in scopeAuto,
    [scopeLang, scopeAuto],
  );
  const clearScopeOverride = useCallback((scope: string) => {
    setScopedLang(scope, null);
    setScopedAuto(scope, null);
  }, [setScopedLang, setScopedAuto]);

  const value = useMemo<Ctx>(
    () => ({
      lang, autoTranslate, setLang, setAutoTranslate,
      getScopedLang, getScopedAuto, setScopedLang, setScopedAuto,
      hasScopeOverride, clearScopeOverride,
    }),
    [lang, autoTranslate, setLang, setAutoTranslate, getScopedLang, getScopedAuto, setScopedLang, setScopedAuto, hasScopeOverride, clearScopeOverride],
  );

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}

export function useLanguage(scope?: string) {
  const c = useContext(LanguageCtx);
  if (!c) {
    return {
      lang: "en" as LangCode,
      autoTranslate: false,
      setLang: () => {},
      setAutoTranslate: () => {},
      setScopedLang: () => {},
      setScopedAuto: () => {},
      hasScopeOverride: false,
      clearScopeOverride: () => {},
      scope,
    };
  }
  return {
    lang: c.getScopedLang(scope),
    autoTranslate: c.getScopedAuto(scope),
    setLang: (l: LangCode) => (scope ? c.setScopedLang(scope, l) : c.setLang(l)),
    setAutoTranslate: (v: boolean) => (scope ? c.setScopedAuto(scope, v) : c.setAutoTranslate(v)),
    setScopedLang: c.setScopedLang,
    setScopedAuto: c.setScopedAuto,
    hasScopeOverride: scope ? c.hasScopeOverride(scope) : false,
    clearScopeOverride: () => scope && c.clearScopeOverride(scope),
    scope,
  };
}

export function languageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.native ?? code.toUpperCase();
}
