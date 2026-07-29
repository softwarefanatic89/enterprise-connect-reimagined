import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Contrast, Gauge, Layers, SlidersHorizontal, Sparkles, Zap, RotateCcw } from "lucide-react";
import { useViewPreferences } from "@/lib/view-preferences";

type Opt<T extends string> = { value: T; label: string; hint: string };

function Segmented<T extends string>({
  label, icon: Icon, value, options, onChange,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: T;
  options: Opt<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="px-3 py-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden="true" />
        {label}
      </div>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-1">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              title={o.hint}
              onClick={() => onChange(o.value)}
              className={`ripple rounded-lg border px-2 py-1.5 text-left text-[11.5px] font-semibold transition-all duration-150 active:scale-[0.98] ${
                on
                  ? "border-primary bg-primary-soft text-primary shadow-[var(--shadow-glow)]"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {o.label}
              <span className="mt-0.5 block text-[9.5px] font-normal opacity-70">{o.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ViewPreferencesMenu() {
  const p = useViewPreferences();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Display preferences"
          aria-label="Display preferences"
          className="ripple grid h-9 w-9 place-items-center rounded-lg text-sidebar-muted transition-all duration-150 hover:bg-sidebar-surface-hover hover:text-foreground active:scale-95"
        >
          <SlidersHorizontal className="icon-morph h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[300px] animate-modal-scale overflow-hidden rounded-2xl border-border bg-surface p-0 shadow-[var(--shadow-float)]"
      >
        <div className="flex items-center justify-between border-b border-border-soft px-3 py-2.5">
          <div>
            <div className="text-[12.5px] font-bold tracking-tight">Display Preferences</div>
            <div className="font-mono text-[10px] text-muted-foreground">Local to this device</div>
          </div>
          <button
            type="button"
            onClick={p.reset}
            title="Reset to defaults"
            aria-label="Reset display preferences"
            className="ripple grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-border-soft">
          <Segmented
            label="Density"
            icon={Gauge}
            value={p.density}
            onChange={(v) => p.set("density", v)}
            options={[
              { value: "comfortable", label: "Comfortable", hint: "Roomy spacing" },
              { value: "compact", label: "Compact", hint: "More on screen" },
            ]}
          />
          <Segmented
            label="Surface"
            icon={Layers}
            value={p.surface}
            onChange={(v) => p.set("surface", v)}
            options={[
              { value: "solid", label: "Solid", hint: "Opaque panels" },
              { value: "glass", label: "Glass", hint: "Frosted panels" },
            ]}
          />
          <Segmented
            label="Contrast"
            icon={Contrast}
            value={p.contrast}
            onChange={(v) => p.set("contrast", v)}
            options={[
              { value: "normal", label: "Standard", hint: "WCAG AA" },
              { value: "high", label: "High", hint: "Stronger borders" },
            ]}
          />
          <Segmented
            label="Motion"
            icon={Zap}
            value={p.motion}
            onChange={(v) => p.set("motion", v)}
            options={[
              { value: "full", label: "Full", hint: "150–300ms" },
              { value: "reduced", label: "Reduced", hint: "Minimal motion" },
            ]}
          />
        </div>

        <div className="flex items-center gap-1.5 border-t border-border-soft px-3 py-2 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Preferences affect presentation only — no policy or data changes.
        </div>
      </PopoverContent>
    </Popover>
  );
}
