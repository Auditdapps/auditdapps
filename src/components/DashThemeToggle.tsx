// src/components/DashThemeToggle.tsx
import * as React from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type Mode = "light" | "dark" | "system";
const STORAGE_KEY = "dashTheme";

const prefersDarkNow = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;

const applyHtmlClass = (mode: Mode) => {
  if (typeof document === "undefined") return;
  const dark = mode === "system" ? prefersDarkNow() : mode === "dark";
  document.documentElement.classList.toggle("dark", dark);
};

const getSavedMode = (): Mode => {
  if (typeof window === "undefined") return "system";
  try {
    const v = (localStorage.getItem(STORAGE_KEY) || "system").toLowerCase();
    return v === "light" || v === "dark" || v === "system" ? (v as Mode) : "system";
  } catch {
    return "system";
  }
};

/** ---------- INITIAL THEME APPLIED AT MODULE LOAD ---------- */
let initialMode: Mode = "system";

if (typeof window !== "undefined") {
  initialMode = getSavedMode();
  applyHtmlClass(initialMode); // <- runs immediately on hard refresh for any route that imports this file
}

/** --------------------------------------------------------- */

export default function DashThemeToggle() {
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const appliedDark = mode === "system" ? prefersDarkNow() : mode === "dark";

  // apply when mode changes + persist
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, mode);
    applyHtmlClass(mode);
  }, [mode]);

  // keep “system” reactive
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const onChange = () => {
      if (mode === "system") applyHtmlClass("system");
    };

    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [mode]);

  const triggerIcon =
    mode === "system" ? (
      <Laptop className="h-5 w-5" />
    ) : appliedDark ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Sun className="h-5 w-5" />
    );

  const labelFor = mode === "system" ? "System" : appliedDark ? "Dark" : "Light";

  const Item = ({ value, children }: { value: Mode; children: React.ReactNode }) => (
    <DropdownMenuItem
      onClick={() => setMode(value)}
      role="menuitemradio"
      aria-checked={mode === value}
      className="flex items-center gap-2"
    >
      {children}
      <span className="ml-auto">
        {mode === value ? <Check className="h-4 w-4" /> : null}
      </span>
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Theme"
          title={`Theme: ${labelFor}`}
        >
          {triggerIcon}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Item value="light">
          <Sun className="mr-2 h-4 w-4" /> Light
        </Item>
        <Item value="dark">
          <Moon className="mr-2 h-4 w-4" /> Dark
        </Item>
        <Item value="system">
          <Laptop className="mr-2 h-4 w-4" /> System
        </Item>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
