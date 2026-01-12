// src/components/AdminSidebar.tsx
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  MessageSquareText,
  FileText,
  FilePlus2,
  BookMarked,
  Tags,
  Images,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  open: boolean;
  onClose: () => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
};

type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  accent?: boolean;
  badge?: string;
};

type Section = {
  label: string;
  items: NavItem[];
};

const sections: Section[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
      { to: "/admin/users", icon: Users, label: "Users" },
      { to: "/admin/audits", icon: ShieldCheck, label: "Audits" },
      { to: "/admin/recommendations", icon: AlertTriangle, label: "Recommendations" },
      { to: "/admin/requests", icon: ClipboardList, label: "Manual Requests" },
      { to: "/admin/feedback", icon: MessageSquareText, label: "Feedback" },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/posts", icon: FileText, label: "Blog Posts" },
      { to: "/admin/posts/new", icon: FilePlus2, label: "New Post", accent: true },
      { to: "/admin/posts?status=draft", icon: BookMarked, label: "Drafts", badge: "•" },
      { to: "/admin/posts?status=published", icon: Sparkles, label: "Published" },
      { to: "/admin/posts?category=all", icon: Tags, label: "Categories" },
      { to: "/admin/media", icon: Images, label: "Media" },
    ],
  },
  { label: "System", items: [{ to: "/admin/settings", icon: Settings, label: "Settings" }] },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="ml-2 rounded border bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm">
      {children}
    </kbd>
  );
}

export default function AdminSidebar({ open, onClose, expanded, setExpanded }: Props) {
  const nav = useNavigate();
  const { pathname } = useLocation(); // kept if you use it for active states elsewhere

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setExpanded(!expanded);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, setExpanded]);

  const railW = expanded ? "w-72" : "w-[72px]";
  const labelCls = expanded ? "opacity-100" : "opacity-0 pointer-events-none";
  const show = (s: boolean) => (s ? "translate-x-0" : "-translate-x-full");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out failed:", e);
    } finally {
      onClose();
      setExpanded(false);
      nav("/");
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            onClick={() => {
              setExpanded(true);
              // If you also need to set `open` in the parent, add an `onOpen` prop there and call it here.
            }}
            className="p-2 rounded-md hover:bg-slate-100"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">Admin</span>
          <button
            onClick={() => nav("/admin/posts/new")}
            className="inline-flex h-9 items-center rounded-md bg-blue-600 px-3 text-white text-sm font-semibold"
          >
            New Post
          </button>
        </div>
      </div>

      {open && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={[
          "fixed z-50 lg:z-30 top-0 h-full bg-white border-r transition-all duration-300 ease-out",
          railW,
          "lg:translate-x-0",
          show(open),
        ].join(" ")}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="hidden lg:flex items-center h-14 border-b px-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white grid place-items-center font-bold">AD</div>
            <div className={`text-sm font-semibold text-slate-800 transition ${labelCls}`}>AuditDapps Admin</div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-md hover:bg-slate-100"
              title="Toggle width"
              aria-label="Toggle sidebar width"
            >
              <ChevronLeft className={`h-5 w-5 transition ${expanded ? "" : "rotate-180"}`} />
            </button>
          </div>
        </div>

        <div className="hidden lg:block p-3">
          <button
            onClick={() => nav("/admin/posts/new")}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            <FilePlus2 className="h-4 w-4" />
            <span className={`transition ${labelCls}`}>New Post</span>
          </button>
          <div className={`mt-2 text-[11px] text-slate-500 ${expanded ? "" : "hidden"}`}>
            Quick actions <Kbd>Shift</Kbd>+<Kbd>A</Kbd> to toggle
          </div>
        </div>

        <nav className="mt-1 px-2">
          {sections.map((group) => (
            <div key={group.label} className="mb-3">
              <div
                className={`px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${
                  expanded ? "opacity-100" : "opacity-0"
                }`}
              >
                {group.label}
              </div>

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          [
                            "group flex items-center gap-3 rounded-lg px-2 py-2 text-sm",
                            isActive
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                              : "text-slate-700 hover:bg-slate-50",
                          ].join(" ")
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className={`flex-1 transition ${labelCls}`}>{item.label}</span>
                        {item.badge && expanded && (
                          <span className="text-[10px] rounded bg-slate-200 px-1.5 py-0.5">{item.badge}</span>
                        )}
                        {item.accent && expanded && (
                          <span className="ml-auto inline-flex items-center rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            NEW
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            <span className={`transition ${labelCls}`}>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
