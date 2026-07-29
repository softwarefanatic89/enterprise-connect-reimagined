import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Density = "comfortable" | "compact";
export type SurfaceMode = "solid" | "glass";
export type MotionMode = "full" | "reduced";
export type ContrastMode = "normal" | "high";

export type ViewPrefs = {
  density: Density;
  surface: SurfaceMode;
  motion: MotionMode;
  contrast: ContrastMode;
};

const DEFAULTS: ViewPrefs = {
  density: "comfortable",
  surface: "solid",
  motion: "full",
  contrast: "normal",
};

const STORAGE_KEY = "sv.view.prefs.v1";

type Ctx = ViewPrefs & { set: <K extends keyof ViewPrefs>(k: K, v: ViewPrefs[K]) => void; reset: () => void };

const ViewPrefsContext = createContext<Ctx | null>(null);

export function ViewPreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ViewPrefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<ViewPrefs>) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.density = prefs.density;
    el.dataset.surface = prefs.surface;
    el.dataset.motion = prefs.motion;
    el.dataset.contrast = prefs.contrast;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  const value = useMemo<Ctx>(
    () => ({
      ...prefs,
      set: (k, v) => setPrefs((p) => ({ ...p, [k]: v })),
      reset: () => setPrefs(DEFAULTS),
    }),
    [prefs],
  );

  return <ViewPrefsContext.Provider value={value}>{children}</ViewPrefsContext.Provider>;
}

export function useViewPreferences(): Ctx {
  const ctx = useContext(ViewPrefsContext);
  if (!ctx) throw new Error("useViewPreferences must be used inside ViewPreferencesProvider");
  return ctx;
}
