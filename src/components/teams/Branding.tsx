import { useRef, useState } from "react";
import { UploadCloud, ImageOff, Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SWATCHES, type Team } from "./data";

export function Branding({ team, onUpdate }: { team: Team; onUpdate: (patch: Partial<Team>) => void }) {
  const [name, setName] = useState(team.name);
  const [color, setColor] = useState(team.color);
  const [logo, setLogo] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dirty = name !== team.name || color !== team.color;

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[13px] font-bold tracking-tight text-foreground">Team Branding</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Customize the look of “{team.name}” across the workspace.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
          <div>
            <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Logo</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                dragOver ? "border-primary bg-primary-soft" : "border-border hover:border-primary/50 hover:bg-secondary/40"
              }`}
            >
              <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
              {logo ? (
                <img src={logo} alt="Team logo preview" className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-secondary text-2xl">{team.logoEmoji}</div>
              )}
              <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-foreground">
                <UploadCloud className="h-3.5 w-3.5" /> Drop image or click to upload
              </div>
              <p className="text-[10px] text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
              {logo && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLogo(null); }}
                  className="inline-flex items-center gap-1 text-[10.5px] font-medium text-destructive"
                >
                  <ImageOff className="h-3 w-3" /> Remove
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Team name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Palette className="h-3.5 w-3.5" /> Accent color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {SWATCHES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-label={`Color ${s}`}
                  onClick={() => setColor(s)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: s, boxShadow: color === s ? `0 0 0 2px white, 0 0 0 4px ${s}` : undefined }}
                />
              ))}
              <input
                type="color"
                aria-label="Custom color"
                onChange={(e) => setColor(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-full border border-border bg-transparent p-0"
              />
            </div>
          </div>

          <Button
            size="sm"
            className="w-fit gap-1.5"
            disabled={!dirty}
            onClick={() => onUpdate({ name, color })}
          >
            <Save className="h-3.5 w-3.5" /> Save branding
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Live preview</div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 p-4" style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${color} 22%, white), white)` }}>
              {logo ? (
                <img src={logo} alt="" className="h-11 w-11 rounded-xl object-cover ring-2 ring-white" />
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-xl text-xl ring-2 ring-white" style={{ backgroundColor: color }}>{team.logoEmoji}</div>
              )}
              <div>
                <div className="text-[13px] font-bold text-foreground">{name || "Team name"}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{team.id}</div>
              </div>
            </div>
            <div className="border-t border-border p-3 text-[11px] text-muted-foreground">
              This is how the team appears in switchers, mentions and the directory.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
