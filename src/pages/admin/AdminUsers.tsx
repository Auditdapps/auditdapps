import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import type { Period, PlanTier } from "./_adminTypes";

type ProfileRow = {
  id: string;
  email: string | null;
  org_name: string | null;
  role: string | null;
  created_at: string | null;
  is_admin: boolean | null;
  is_premium: boolean | null;
  premium_expires_at: string | null;
  plan_tier: PlanTier | null;
  plan_period: Period | null;
};

type AdminAction =
  | { action: "set_admin"; targetUserId: string; is_admin: boolean }
  | { action: "grant_premium"; targetUserId: string; plan_period: Period }
  | { action: "revoke_premium"; targetUserId: string }
  | { action: "delete_user"; targetUserId: string };

type AdminFnOk<T = unknown> = { ok: true } & T;
type AdminFnErr = { error: string; details?: string };
type AdminFnResponse<T = unknown> = AdminFnOk<T> | AdminFnErr;

type GrantPremiumModalState =
  | { open: false }
  | { open: true; user: ProfileRow; period: Period };

type DeleteUserModalState =
  | { open: false }
  | { open: true; user: ProfileRow; typed: string };

function isPremiumActive(row: ProfileRow) {
  if (!row) return false;
  if (row.premium_expires_at) return new Date(row.premium_expires_at) > new Date();
  return row.is_premium === true;
}

function getErrorMessageFromInvoke(params: {
  invokeError: unknown;
  data: unknown;
}) {
  const { invokeError, data } = params;

  // Supabase Functions errors are often "Edge Function returned a non-2xx status code"
  // but the real message is usually in error.context or returned JSON { error }.
  const maybeErr = invokeError as { message?: string; context?: { statusText?: string } } | null;

  const ctxText = maybeErr?.context?.statusText;
  if (ctxText) return ctxText;

  if (data && typeof data === "object" && "error" in data) {
    const e = (data as { error?: unknown }).error;
    if (typeof e === "string") return e;
  }

  if (maybeErr?.message) return maybeErr.message;
  return "Request failed";
}

async function adminAction<T = unknown>(body: AdminAction): Promise<AdminFnOk<T>> {
  const { data, error } = await supabase.functions.invoke("admin-users", { body });

  if (error) {
    const msg = getErrorMessageFromInvoke({ invokeError: error, data });
    throw new Error(msg);
  }

  // Function can still return { error } with 200
  if (data && typeof data === "object" && "error" in data) {
    const e = (data as AdminFnErr).error;
    throw new Error(typeof e === "string" ? e : "Request failed");
  }

  return (data as AdminFnOk<T>) ?? ({ ok: true } as AdminFnOk<T>);
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [grantModal, setGrantModal] = useState<GrantPremiumModalState>({ open: false });
  const [deleteModal, setDeleteModal] = useState<DeleteUserModalState>({ open: false });

  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,org_name,role,created_at,is_admin,is_premium,premium_expires_at,plan_tier,plan_period")
        .order("created_at", { ascending: false })
        .limit(250);

      if (error) throw error;
      setRows((data as ProfileRow[]) ?? []);
    } catch (e) {
      console.error("[AdminUsers] load error", e);
      toast.error("Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.email, r.org_name, r.role, r.id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [rows, q]);

  const toggleAdmin = async (row: ProfileRow) => {
    try {
      setBusyId(row.id);
      const next = !(row.is_admin === true);

      await adminAction({
        action: "set_admin",
        targetUserId: row.id,
        is_admin: next,
      });

      toast.success(next ? "Admin granted" : "Admin removed");
      await load();
    } catch (e) {
      console.error("[AdminUsers] toggleAdmin", e);
      toast.error(e instanceof Error ? e.message : "Could not update admin flag.");
    } finally {
      setBusyId(null);
    }
  };

  const openGrantPremium = (row: ProfileRow) => {
    setGrantModal({ open: true, user: row, period: row.plan_period ?? "monthly" });
  };

  const confirmGrantPremium = async () => {
    if (!grantModal.open) return;

    const user = grantModal.user;
    const period = grantModal.period;

    try {
      setBusyId(user.id);

      await adminAction({
        action: "grant_premium",
        targetUserId: user.id,
        plan_period: period,
      });

      toast.success("Premium granted");
      setGrantModal({ open: false });
      await load();
    } catch (e) {
      console.error("[AdminUsers] grantPremium", e);
      toast.error(e instanceof Error ? e.message : "Could not grant premium.");
    } finally {
      setBusyId(null);
    }
  };

  const revokePremium = async (row: ProfileRow) => {
    if (!confirm("Revoke premium for this user?")) return;

    try {
      setBusyId(row.id);

      await adminAction({
        action: "revoke_premium",
        targetUserId: row.id,
      });

      toast.success("Premium revoked");
      await load();
    } catch (e) {
      console.error("[AdminUsers] revokePremium", e);
      toast.error(e instanceof Error ? e.message : "Could not revoke premium.");
    } finally {
      setBusyId(null);
    }
  };

  const openDeleteUser = (row: ProfileRow) => {
    setDeleteModal({ open: true, user: row, typed: "" });
  };

  const confirmDeleteUser = async () => {
    if (!deleteModal.open) return;

    const user = deleteModal.user;
    const typed = deleteModal.typed.trim();

    if (typed !== "DELETE") {
      toast.error('Type "DELETE" to confirm.');
      return;
    }

    try {
      setBusyId(user.id);

      await adminAction({
        action: "delete_user",
        targetUserId: user.id,
      });

      toast.success("User deleted");
      setDeleteModal({ open: false });
      await load();
    } catch (e) {
      console.error("[AdminUsers] deleteUser", e);
      toast.error(e instanceof Error ? e.message : "Could not delete user.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Profiles, roles, premium state and quick admin actions.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email/org/role/id…"
            className="h-10 w-72 max-w-full rounded-xl border border-border bg-background px-3 text-sm"
          />
          <button
            onClick={load}
            className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-accent/60"
          >
            Refresh
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Org</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Admin</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Premium status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    Loading users…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const active = isPremiumActive(row);
                  const plan = row.plan_tier ?? "free";
                  const period = row.plan_period ?? "—";
                  const isBusy = busyId === row.id;

                  return (
                    <tr key={row.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link className="font-medium hover:underline" to={`/admin/users/${row.id}`}>
                          {row.email ?? "(no email)"}
                        </Link>
                        <div className="text-[11px] text-muted-foreground">{row.id}</div>
                      </td>

                      <td className="px-4 py-3">{row.org_name ?? "—"}</td>
                      <td className="px-4 py-3">{row.role ?? "—"}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                            row.is_admin ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {row.is_admin ? "Admin" : "User"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium">{plan}</div>
                        <div className="text-[11px] text-muted-foreground">{period}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                            active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {active ? "Active" : "Expired/Free"}
                        </span>

                        {row.premium_expires_at && (
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            Expires: {new Date(row.premium_expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            onClick={() => toggleAdmin(row)}
                            disabled={isBusy}
                            className="h-8 rounded-lg border border-border bg-background px-3 text-xs font-semibold hover:bg-accent/60 disabled:opacity-50"
                          >
                            {row.is_admin ? "Remove admin" : "Make admin"}
                          </button>

                          {active ? (
                            <button
                              onClick={() => revokePremium(row)}
                              disabled={isBusy}
                              className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              Revoke premium
                            </button>
                          ) : (
                            <button
                              onClick={() => openGrantPremium(row)}
                              disabled={isBusy}
                              className="h-8 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              Grant premium
                            </button>
                          )}

                          <button
                            onClick={() => openDeleteUser(row)}
                            disabled={isBusy}
                            className="h-8 rounded-lg border border-red-300 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Showing {filtered.length} of {rows.length}
        </div>
      </section>

      {/* Grant Premium modal */}
      {grantModal.open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg">
            <div className="mb-2 text-lg font-semibold">Grant Premium</div>
            <div className="text-sm text-muted-foreground">
              User:{" "}
              <span className="font-medium text-foreground">
                {grantModal.user.email ?? grantModal.user.id}
              </span>
            </div>

            <label
              htmlFor="grant-premium-period"
              className="mt-4 block text-xs font-semibold text-muted-foreground"
            >
              Billing period
            </label>
            <select
              id="grant-premium-period"
              value={grantModal.period}
              onChange={(e) =>
                setGrantModal({
                  ...grantModal,
                  period: e.target.value as Period,
                })
              }
              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="weekly">Weekly (7 days)</option>
              <option value="monthly">Monthly (30 days)</option>
              <option value="annual">Annual (365 days)</option>
            </select>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setGrantModal({ open: false })}
                className="h-9 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-accent/60"
              >
                Cancel
              </button>
              <button
                onClick={confirmGrantPremium}
                disabled={busyId === grantModal.user.id}
                className="h-9 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Grant
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete user modal */}
      {deleteModal.open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-card p-5 shadow-lg">
            <div className="mb-1 text-lg font-semibold text-red-700">Danger Zone: Delete user</div>
            <p className="text-sm text-muted-foreground">
              This will delete the user and all related data via cascades (profiles, audits, recommendations, feedback,
              requests). This cannot be undone.
            </p>

            <div className="mt-3 text-sm">
              User:{" "}
              <span className="font-semibold">
                {deleteModal.user.email ?? deleteModal.user.id}
              </span>
            </div>

            <label
              htmlFor="delete-user-confirm"
              className="mt-4 block text-xs font-semibold text-muted-foreground"
            >
              Type <span className="text-red-700">DELETE</span> to confirm
            </label>
            <input
              id="delete-user-confirm"
              value={deleteModal.typed}
              onChange={(e) => setDeleteModal({ ...deleteModal, typed: e.target.value })}
              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              placeholder="DELETE"
            />

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteModal({ open: false })}
                className="h-9 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-accent/60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={busyId === deleteModal.user.id || deleteModal.typed.trim() !== "DELETE"}
                className="h-9 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Delete user
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
