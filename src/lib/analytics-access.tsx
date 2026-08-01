import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const ANALYTICS_ROLES = ["Owner", "Admin", "Manager", "Member", "Guest"] as const;
export type AnalyticsRole = (typeof ANALYTICS_ROLES)[number];

export type AnalyticsGrant = { view: boolean; export: boolean };
export type AnalyticsGrants = Record<AnalyticsRole, AnalyticsGrant>;

export const DEFAULT_ANALYTICS_GRANTS: AnalyticsGrants = {
  Owner: { view: true, export: true },
  Admin: { view: true, export: true },
  Manager: { view: true, export: false },
  Member: { view: false, export: false },
  Guest: { view: false, export: false },
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
      if (g) setGrants({ ...DEFAULT_ANALYTICS_GRANTS, ...(JSON.parse(g) as Partial<AnalyticsGrants>) });
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
        // Export implies view; revoking view revokes export.
        if (key === "export" && value) entry.view = true;
        if (key === "view" && !value) entry.export = false;
        const next = { ...prev, [r]: entry };
        try { localStorage.setItem(GRANTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    },
    [],
  );

  const resetGrants = useCallback(() => persist(DEFAULT_ANALYTICS_GRANTS), [persist]);

  const value = useMemo<Ctx>(() => {
    const grant = grants[role] ?? { view: false, export: false };
    return {
      role,
      setRole,
      grants,
      setGrant,
      resetGrants,
      canView: role === "Owner" || grant.view,
      canExport: role === "Owner" || (grant.view && grant.export),
    };
  }, [role, grants, setRole, setGrant, resetGrants]);

  return <AnalyticsAccessContext.Provider value={value}>{children}</AnalyticsAccessContext.Provider>;
}

export function useAnalyticsAccess(): Ctx {
  const ctx = useContext(AnalyticsAccessContext);
  if (!ctx) throw new Error("useAnalyticsAccess must be used within AnalyticsAccessProvider");
  return ctx;
}
