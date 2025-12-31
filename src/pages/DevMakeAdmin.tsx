// src/pages/DevMakeAdmin.tsx
import React from "react";
import { supabase } from "../lib/supabaseClient";

export default function DevMakeAdmin() {
  async function makeMeAdmin() {
    const { data, error } = await supabase.auth.updateUser({
      data: { role: "admin" }, // writes to user_metadata.role
    });
    if (error) alert(error.message);
    else alert("Done. Refresh the page and open /admin/posts.");
  }

  async function showRole() {
    const { data } = await supabase.auth.getUser();
    const u = data?.user;
    const role =
      (u?.app_metadata as any)?.role ??
      (u?.user_metadata as any)?.role ??
      null;
    alert(`role: ${role ?? "(none)"}`);
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Dev: Make Me Admin</h1>
      <p className="text-slate-600">You must already be signed in.</p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={makeMeAdmin}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Set role=admin
        </button>
        <button
          onClick={showRole}
          className="px-4 py-2 rounded bg-gray-200"
        >
          Check my role
        </button>
      </div>
    </main>
  );
}
