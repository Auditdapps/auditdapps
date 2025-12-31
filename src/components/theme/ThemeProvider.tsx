// src/components/theme/ThemeProvider.tsx
import * as React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type ThemeMode = "light" | "dark" | "system";

const getMode = (): ThemeMode => {
  const v = (localStorage.getItem("dashTheme") || "system").toLowerCase();
  return v === "light" || v === "dark" || v === "system" ? (v as ThemeMode) : "system";
};

const prefersDark = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;

// ✅ Treat these as “app / dashboard” areas that are allowed to stay dark
const isDashRoute = (path: string) =>
  /^\/(dashboard|audits|analytics|billing|scanner|request-audit)(\/|$)/.test(path);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  // Enforce theme on route changes
  useEffect(() => {
    const html = document.documentElement;

    if (isDashRoute(pathname)) {
      const mode = getMode();
      const dark = mode === "system" ? prefersDark() : mode === "dark";
      html.classList.toggle("dark", dark);
    } else {
      // Marketing/public pages stay light
      html.classList.remove("dark");
    }
  }, [pathname]);

  // Keep “system” reactive while on app routes
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const onChange = () => {
      if (!isDashRoute(window.location.pathname)) return;
      if (getMode() !== "system") return;
      document.documentElement.classList.toggle("dark", prefersDark());
    };

    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return <>{children}</>;
}
