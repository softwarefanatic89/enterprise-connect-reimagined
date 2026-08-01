import { KeyRound, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ANALYTICS_ROLES,
  ANALYTICS_PERMISSIONS,
  useAnalyticsAccess,
  type AnalyticsRole,
} from "@/lib/analytics-access";

export function AnalyticsAccessControl() {
  const { grants, setGrant, resetGrants, role, setRole } = useAnalyticsAccess();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-[13px] font-bold tracking-tight text-foreground">Analytics Access Control</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Choose which roles may open the CSAT &amp; Analytics dashboard, which sections they see, and who can export reports.
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={resetGrants}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] border-collapse text-[11.5px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
              {ANALYTICS_PERMISSIONS.map((p) => (
                <th key={p.key} className="px-3 py-2.5 text-center font-semibold text-foreground">
                  {p.label}
                  <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">{p.hint}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ANALYTICS_ROLES.map((r, i) => (
              <tr key={r} className={i % 2 ? "bg-secondary/30" : undefined}>
                <td className="px-3 py-2 font-medium text-foreground">
                  <span className="inline-flex items-center gap-1">
                    {r === "Owner" && <ShieldCheck className="h-3 w-3 text-primary" />}
                    {r}
                  </span>
                </td>
                {ANALYTICS_PERMISSIONS.map((p) => (
                  <td key={p.key} className="px-3 py-2 text-center">
                    <Checkbox
                      className="mx-auto"
                      checked={r === "Owner" || grants[r][p.key]}
                      disabled={r === "Owner" || (p.key !== "view" && !grants[r].view)}
                      aria-label={`${r} — ${p.label}`}
                      onCheckedChange={(v) => setGrant(r, p.key, v === true)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
        <span className="text-[11px] font-semibold text-foreground">Preview as role</span>
        <div className="flex flex-wrap gap-1.5">
          {ANALYTICS_ROLES.map((r: AnalyticsRole) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                role === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground">
          Applies your current session role to <span className="font-medium text-foreground">/analytics</span>.
        </span>
      </div>
    </div>
  );
}
