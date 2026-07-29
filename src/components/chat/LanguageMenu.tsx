import { Check, ChevronDown, Languages, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES, useLanguage, type LangCode } from "@/lib/language";

export function LanguageMenu({ scopeId, scopeLabel }: { scopeId?: string; scopeLabel?: string } = {}) {
  const { lang, setLang, autoTranslate, setAutoTranslate, hasScopeOverride, clearScopeOverride } =
    useLanguage(scopeId);
  const active = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const scoped = Boolean(scopeId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={scoped ? `Language for ${scopeLabel ?? "this chat"}` : "Chat language"}
          aria-label={`Chat language: ${active.label}. Auto-translate ${autoTranslate ? "on" : "off"}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sidebar-muted transition-all hover:bg-sidebar-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden text-[11px] font-semibold uppercase tracking-wide lg:inline">
            {active.code}
          </span>
          {autoTranslate && (
            <span className="hidden h-1.5 w-1.5 rounded-full bg-[--color-success] lg:inline-block" />
          )}
          {scoped && hasScopeOverride && (
            <span className="hidden h-1.5 w-1.5 rounded-full bg-gold lg:inline-block" title="Custom for this chat" />
          )}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0">
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[12px] font-bold">Live chat translation</div>
              <div className="truncate text-[10.5px] text-muted-foreground">
                {scoped
                  ? `Applies to ${scopeLabel ?? "this conversation"} · saved permanently`
                  : "Default for all conversations · saved permanently"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoTranslate(!autoTranslate)}
              aria-pressed={autoTranslate}
              aria-label="Toggle auto-translate"
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                autoTranslate ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  autoTranslate ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          {scoped && hasScopeOverride && (
            <button
              type="button"
              onClick={() => clearScopeOverride()}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[10.5px] font-semibold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RotateCcw className="h-3 w-3" /> Use workspace default
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {scoped ? "Language for this chat" : "My language"}
        </DropdownMenuLabel>
        <div className="max-h-72 overflow-y-auto pb-1">
          {LANGUAGES.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onSelect={() => setLang(l.code as LangCode)}
              className="flex items-center gap-2.5"
            >
              <span className="text-base leading-none">{l.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold">{l.native}</div>
                <div className="text-[10px] text-muted-foreground">{l.label}</div>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {l.code.toUpperCase()}
              </span>
              {lang === l.code && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
