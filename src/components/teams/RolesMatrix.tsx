import { useState } from "react";
import { ShieldCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { defaultRolePermissions, PERMISSIONS, ROLE_NAMES, type Permission } from "./data";

type MatrixState = Record<(typeof ROLE_NAMES)[number], Set<Permission>>;

function buildInitial(): MatrixState {
  return Object.fromEntries(
    ROLE_NAMES.map((r) => [r, new Set(defaultRolePermissions[r])]),
  ) as MatrixState;
}

export function RolesMatrix() {
  const [matrix, setMatrix] = useState<MatrixState>(buildInitial);

  const toggle = (role: (typeof ROLE_NAMES)[number], perm: Permission) => {
    if (role === "Owner") return;
    setMatrix((prev) => {
      const next = { ...prev, [role]: new Set(prev[role]) };
      next[role].has(perm) ? next[role].delete(perm) : next[role].add(perm);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-bold tracking-tight text-foreground">Roles &amp; Permission Matrix</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Assign capabilities per role. Owner always has full access.</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setMatrix(buildInitial())}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] border-collapse text-[11.5px]">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 bg-card px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-muted-foreground">Permission</th>
              {ROLE_NAMES.map((r) => (
                <th key={r} className="px-3 py-2.5 text-center font-semibold text-foreground">
                  <span className="inline-flex items-center gap-1">
                    {r === "Owner" && <ShieldCheck className="h-3 w-3 text-primary" />}
                    {r}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((perm, i) => (
              <tr key={perm} className={i % 2 ? "bg-secondary/30" : undefined}>
                <td className="sticky left-0 bg-inherit px-3 py-2 font-medium text-foreground">{perm}</td>
                {ROLE_NAMES.map((role) => (
                  <td key={role} className="px-3 py-2 text-center">
                    <Checkbox
                      checked={matrix[role].has(perm)}
                      onCheckedChange={() => toggle(role, perm)}
                      disabled={role === "Owner"}
                      aria-label={`${role} — ${perm}`}
                      className="mx-auto"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
