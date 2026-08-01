import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const ANALYTICS_ROLES = ["Owner", "Admin", "Manager", "Member", "Guest"] as const;
export type AnalyticsRole = (typeof ANALYTICS_ROLES)[number];

export type AnalyticsGrant = {
  view: boolean;
  kpis: boolean;
  breakdown: boolean;
  staff: boolean;
  export: boolean;
};
export type AnalyticsGrants = Record<AnalyticsRole, AnalyticsGrant>;

export const ANALYTICS_PERMISSIONS = [
  { key: "view", label: "View analytics", hint: "Open the dashboard" },
  { key: "kpis", label: "View KPIs", hint: "Overview cards & quick stats" },
  { key: "breakdown", label: "View rating breakdown", hint: "Star distribution" },
  { key: "staff", label: "View staff performance", hint: "Per-agent table" },
  { key: "export", label: "Export analytics", hint: "CSV & HTML reports" },
] as const satisfies readonly { key: keyof AnalyticsGrant; label: string; hint: string }[];

export const DEFAULT_ANALYTICS_GRANTS: AnalyticsGrants = {
  Owner: { view: true, kpis: true, breakdown: true, staff: true, export: true },
  Admin: { view: true, kpis: true, breakdown: true, staff: true, export: true },
  Manager: { view: true, kpis: true, breakdown: true, staff: true, export: false },
  Member: { view: false, kpis: false, breakdown: false, staff: false, export: false },
  Guest: { view: false, kpis: false, breakdown: false, staff: false, export: false },
};

const ROLE_KEY = "sv.analytics.role";
const GRANTS_KEY = "sv.analytics.grants";

type Ctx = {
  role: AnalyticsRole;
  setRole: (r: AnalyticsRole) => void;
  grants: AnalyticsGrants;
  setGrant: (role: AnalyticsRole, key: keyof AnalyticsGrant, value: boolean) => void;
  resetGrants: () => void;
  canView: boolean;
  canExport: boolean;
  canViewKpis: boolean;
  canViewBreakdown: boolean;
  canViewStaff: boolean;
};

const AnalyticsAccessContext = createContext<Ctx | null>(null);

export function AnalyticsAccessProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AnalyticsRole>("Admin");
  const [grants, setGrants] = useState<AnalyticsGrants>(DEFAULT_ANALYTICS_GRANTS);

  // Hydrate from device storage after mount (keeps SSR markup stable).
  useEffect(() => {
    try {
      const r = localStorage.getItem(ROLE_KEY);
      if (r && (ANALYTICS_ROLES as readonly string[]).includes(r)) setRoleState(r as AnalyticsRole);
      const g = localStorage.getItem(GRANTS_KEY);
      if (g) {
        const parsed = JSON.parse(g) as Partial<Record<AnalyticsRole, Partial<AnalyticsGrant>>>;
        setGrants(
          Object.fromEntries(
            ANALYTICS_ROLES.map((r) => [r, { ...DEFAULT_ANALYTICS_GRANTS[r], ...(parsed[r] ?? {}) }]),
          ) as AnalyticsGrants,
        );
      }
    } catch {
      /* storage unavailable — keep defaults */
    }
  }, []);

  const setRole = useCallback((r: AnalyticsRole) => {
    setRoleState(r);
    try { localStorage.setItem(ROLE_KEY, r); } catch { /* ignore */ }
  }, []);

  const persist = useCallback((next: AnalyticsGrants) => {
    setGrants(next);
    try { localStorage.setItem(GRANTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const setGrant = useCallback(
    (r: AnalyticsRole, key: keyof AnalyticsGrant, value: boolean) => {
      if (r === "Owner") return; // Owner always retains full analytics access
      setGrants((prev) => {
        const entry = { ...prev[r], [key]: value };
        // Any sub-permission implies view; revoking view revokes everything.
        if (key !== "view" && value) entry.view = true;
        if (key === "view" && !value) {
          entry.export = false;
          entry.kpis = false;
          entry.breakdown = false;
          entry.staff = false;
        }
        const next = { ...prev, [r]: entry };
        try { localStorage.setItem(GRANTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    },
    [],
  );

  const resetGrants = useCallback(() => persist(DEFAULT_ANALYTICS_GRANTS), [persist]);

  const value = useMemo<Ctx>(() => {
    const grant = grants[role] ?? DEFAULT_ANALYTICS_GRANTS.Guest;
    const isOwner = role === "Owner";
    const canView = isOwner || grant.view;
    return {
      role,
      setRole,
      grants,
      setGrant,
      resetGrants,
      canView,
      canExport: isOwner || (canView && grant.export),
      canViewKpis: isOwner || (canView && grant.kpis),
      canViewBreakdown: isOwner || (canView && grant.breakdown),
      canViewStaff: isOwner || (canView && grant.staff),
    };
  }, [role, grants, setRole, setGrant, resetGrants]);

  return <AnalyticsAccessContext.Provider value={value}>{children}</AnalyticsAccessContext.Provider>;
}

export function useAnalyticsAccess(): Ctx {
  const ctx = useContext(AnalyticsAccessContext);
  if (!ctx) throw new Error("useAnalyticsAccess must be used within AnalyticsAccessProvider");
  return ctx;
}
