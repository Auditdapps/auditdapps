// src/components/AuditToolbar.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

type ThemeMode = "light" | "dark" | "system";

function getStoredMode(): ThemeMode {
  const v = (localStorage.getItem("dashTheme") || "").toLowerCase();
  return v === "light" || v === "dark" || v === "system" ? (v as ThemeMode) : "system";
}

function prefersDark(): boolean {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(mode: ThemeMode, setIsDark?: (b: boolean) => void) {
  const wantsDark = mode === "system" ? prefersDark() : mode === "dark";
  document.documentElement.classList.toggle("dark", wantsDark);
  setIsDark?.(wantsDark);
  localStorage.setItem("dashTheme", mode);
}

export default function AuditToolbar({
  title = "Here’s what’s happening with your security posture.",
  showUpgrade = true,
  avatarText = "L",
}: {
  title?: string;
  showUpgrade?: boolean;
  avatarText?: string;
}) {
  const navigate = useNavigate();

  // Theme state
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );

  // Dropdown state
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Apply on mount + when mode changes
  useEffect(() => {
    applyTheme(mode, setIsDark);
  }, [mode]);

  // Follow system if "system" is selected
  useEffect(() => {
    if (mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system", setIsDark);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [mode]);

  // Reflect external toggles of <html class="dark">
  useEffect(() => {
    const html = document.documentElement;
    const obs = new MutationObserver(() => setIsDark(html.classList.contains("dark")));
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Close on outside click / ESC
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const CurrentIcon =
    mode === "light" ? SunIcon : mode === "dark" ? MoonIcon : ComputerDesktopIcon;

  const Option = ({
    label,
    icon: Icon,
    value,
  }: {
    label: string;
    icon: typeof SunIcon;
    value: ThemeMode;
  }) => {
    const active = mode === value;
    return (
      <button
        role="menuitemradio"
        aria-checked={active}
        onClick={() => {
          setMode(value);
          setOpen(false);
        }}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm
          hover:bg-slate-100 dark:hover:bg-slate-800
          ${active ? "bg-slate-100 dark:bg-slate-800" : ""}`}
      >
        <Icon className="h-5 w-5" />
        <span className="flex-1 text-left">{label}</span>
        {active && <CheckIcon className="h-5 w-5 opacity-80" />}
      </button>
    );
  };

  return (
    <div
      className="
        sticky top-0 z-30
        bg-white/80 dark:bg-slate-950/80
        backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60
        border-b border-slate-200 dark:border-white/10
      "
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 h-12 md:h-14 flex items-center justify-between gap-3">
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 truncate">
          {title}
        </p>

        <div className="relative flex items-center gap-2">
          {/* Theme menu trigger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="inline-flex h-9 items-center gap-2 rounded-full border
                       border-slate-200 dark:border-white/10 px-3
                       hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Theme"
          >
            <CurrentIcon className="h-5 w-5" />
          </button>

          {/* Dropdown */}
          {open && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Theme"
              className="absolute right-0 top-11 w-56 rounded-xl border
                         border-slate-200 dark:border-white/10
                         bg-white dark:bg-slate-900 shadow-lg p-2"
            >
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Theme
              </div>
              <div className="space-y-1">
                <Option label="Light" icon={SunIcon} value="light" />
                <Option label="Dark" icon={MoonIcon} value="dark" />
                <Option label="System" icon={ComputerDesktopIcon} value="system" />
              </div>
            </div>
          )}

          {showUpgrade && (
            <button
              onClick={() => navigate("/auth/payment")}
              className="h-9 rounded-full px-4 font-medium
                         bg-slate-900 text-white dark:bg-white dark:text-slate-900
                         hover:opacity-90"
            >
              Upgrade
            </button>
          )}

          <div
            className="h-9 w-9 rounded-full bg-indigo-600 text-white grid place-items-center text-sm font-semibold select-none"
            title="Account"
            aria-hidden
          >
            {avatarText}
          </div>
        </div>
      </div>
    </div>
  );
}
