import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(true); // desktop rail expanded

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        expanded={expanded}
        setExpanded={setExpanded}
      />

      {/* Content area shifts by rail width */}
      <main className={`${expanded ? "lg:pl-72" : "lg:pl-[72px]"} transition-all`}>
        {/* Spacer for fixed sidebar header height on desktop */}
        <div className="hidden lg:block h-14" />
        <div className="px-4 lg:px-8 py-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
