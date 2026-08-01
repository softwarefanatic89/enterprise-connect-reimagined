import { CalendarRange, Download, FileText, Filter, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { STAFF, STATUS_META, TAGS, PRIORITY_META, type ConvStatus, type Priority } from "./data";

export type FilterState = {
  preset: string;
  from: string;
  to: string;
  staff: string;
  status: ConvStatus | "all";
  priority: Priority | "all";
  tag: string;
};

export const PRESETS = [
  { id: "7", label: "Last 7 days" },
  { id: "14", label: "Last 14 days" },
  { id: "30", label: "Last 30 days" },
  { id: "60", label: "Last 60 days" },
  { id: "custom", label: "Custom range" },
];

const selectCls =
  "h-8 rounded-lg border border-border bg-background px-2 text-[11.5px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Filters({
  value, onChange, onReset, onExportCsv, onExportHtml, resultCount, canExport = true,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  onExportCsv: () => void;
  onExportHtml: () => void;
  resultCount: number;
  canExport?: boolean;
}) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Filters
        </span>

        <select aria-label="Date range" className={selectCls} value={value.preset} onChange={(e) => set({ preset: e.target.value })}>
          {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>

        {value.preset === "custom" && (
          <span className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
            <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
            <input type="date" aria-label="From" value={value.from} onChange={(e) => set({ from: e.target.value })} className="bg-transparent text-[11px] outline-none" />
            <span className="text-muted-foreground">→</span>
            <input type="date" aria-label="To" value={value.to} onChange={(e) => set({ to: e.target.value })} className="bg-transparent text-[11px] outline-none" />
          </span>
        )}

        <select aria-label="Staff" className={selectCls} value={value.staff} onChange={(e) => set({ staff: e.target.value })}>
          <option value="all">All staff</option>
          {STAFF.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>

        <select aria-label="Status" className={selectCls} value={value.status} onChange={(e) => set({ status: e.target.value as FilterState["status"] })}>
          <option value="all">Any status</option>
          {(Object.keys(STATUS_META) as ConvStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>

        <select aria-label="Priority" className={selectCls} value={value.priority} onChange={(e) => set({ priority: e.target.value as FilterState["priority"] })}>
          <option value="all">Any priority</option>
          {(Object.keys(PRIORITY_META) as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
        </select>

        <select aria-label="Tag" className={selectCls} value={value.tag} onChange={(e) => set({ tag: e.target.value })}>
          <option value="all">All tags</option>
          {TAGS.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
        </select>

        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-[11px]" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] tabular-nums text-muted-foreground">{resultCount} results</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-[11px]"
                disabled={!canExport}
                title={canExport ? "Export report" : "Your role cannot export analytics"}
              >
                {canExport ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />} Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportCsv} className="gap-2 text-[12px]"><FileText className="h-3.5 w-3.5" /> Download CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={onExportHtml} className="gap-2 text-[12px]"><FileText className="h-3.5 w-3.5" /> Download HTML</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}