import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import type { Period, PlanTier } from "./_adminTypes";

type AccountRole = "user" | "editor" | "admin";
type AuditUserType = "developer" | "organization" | null;

type ProfileRow = {
  id: string;
  email: string | null;
  org_name: string | null;
  account_role: AccountRole | null;
  audit_user_type: AuditUserType;
  is_premium: boolean | null;
  premium_expires_at: string | null;
  plan_tier: PlanTier | null;
  plan_period: Period | null;
  created_at: string | null;
  updated_at: string | null;
};

type AuditRow = {
  id: string;
  user_type: string | null;
  status: string | null;
  score: number | null;
  overall_pct: number | null;
  created_at: string;
};

type RequestRow = {
  id: string;
  project: string | null;
  contact: string | null;
  status: string | null;
  created_at: string;
};

type FeedbackRow = {
  id: string;
  overall_rating: number;
  surface: string;
  created_at: string;
  testimonial: string | null;
  consent_public: boolean;
};

type AdminAction =
  | { action: "set_account_role"; targetUserId: string; account_role: AccountRole }
  | { action: "revoke_premium"; targetUserId: string };

type AdminFnOk<T = unknown> = { ok: true } & T;
type AdminFnErr = { error: string; details?: string };

function badge(text: string, tone: "slate" | "emerald" | "amber" | "red" | "blue" | "indigo" = "slate") {
  const map: Record<typeof tone, string> = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    indigo: "bg-indigo-100 text-indigo-800",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${map[tone]}`}>
      {text}
    </span>
  );
}

function roleBadge(role: AccountRole | null) {
  switch (role) {
    case "admin":
      return badge("Admin", "indigo");
    case "editor":
      return badge("Editor", "blue");
    default:
      return badge("User", "slate");
  }
}

function auditTypeBadge(type: AuditUserType) {
  switch (type) {
    case "developer":
      return badge("Developer", "amber");
    case "organization":
      return badge("Organization", "emerald");
    default:
      return badge("—", "slate");
  }
}

function prettyRole(role: AccountRole | null) {
  switch (role) {
    case "admin":
      return "Admin";
    case "editor":
      return "Editor";
    default:
      return "User";
  }
}

function getErrorMessageFromInvoke(params: {
  invokeError: unknown;
  data: unknown;
}) {
  const { invokeError, data } = params;

  const maybeErr = invokeError as
    | { message?: string; context?: { statusText?: string } }
    | null;

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

  if (data && typeof data === "object" && "error" in data) {
    const e = (data as AdminFnErr).error;
    throw new Error(typeof e === "string" ? e : "Request failed");
  }

  return (data as AdminFnOk<T>) ?? ({ ok: true } as AdminFnOk<T>);
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [busy, setBusy] = useState(false);

  const premiumActive = useMemo(() => {
    if (!profile) return false;

    if (profile.premium_expires_at) {
      return new Date(profile.premium_expires_at) > new Date();
    }

    return profile.is_premium === true;
  }, [profile]);

  const load = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const { data: p, error: pErr } = await supabase
        .from("profiles")
        .select(
          "id,email,org_name,account_role,audit_user_type,is_premium,premium_expires_at,plan_tier,plan_period,created_at,updated_at"
        )
        .eq("id", id)
        .single();

      if (pErr) throw pErr;

      const { data: a, error: aErr } = await supabase
        .from("audits")
        .select("id,user_type,status,score,overall_pct,created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(25);

      if (aErr) throw aErr;

      const { data: r, error: rErr } = await supabase
        .from("manual_audit_requests")
        .select("id,project,contact,status,created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (rErr) throw rErr;

      const { data: f, error: fErr } = await supabase
        .from("product_feedback")
        .select("id,overall_rating,surface,created_at,testimonial,consent_public")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (fErr) throw fErr;

      setProfile((p as ProfileRow) ?? null);
      setAudits((a ?? []) as AuditRow[]);
      setRequests((r ?? []) as RequestRow[]);
      setFeedback((f ?? []) as FeedbackRow[]);
    } catch (e) {
      console.error("[AdminUserDetail] load error", e);
      toast.error("Could not load user details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const updateAccountRole = async (nextRole: AccountRole) => {
    if (!profile) return;

    const currentRole = profile.account_role ?? "user";
    if (currentRole === nextRole) return;
    if (busy) return;

    const label = profile.email ?? profile.id;

    if (nextRole === "admin") {
      const confirmed = window.confirm(`Promote ${label} to admin?`);
      if (!confirmed) return;
    }

    if (currentRole === "admin" && nextRole !== "admin") {
      const confirmed = window.confirm(`Remove admin access from ${label}?`);
      if (!confirmed) return;
    }

    try {
      setBusy(true);

      await adminAction({
        action: "set_account_role",
        targetUserId: profile.id,
        account_role: nextRole,
      });

      setProfile({
        ...profile,
        account_role: nextRole,
      });

      toast.success(`Role updated to ${prettyRole(nextRole)}`);
    } catch (e) {
      console.error("[AdminUserDetail] updateAccountRole", e);
      toast.error(e instanceof Error ? e.message : "Could not update role.");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const revokePremium = async () => {
    if (!profile) return;
    if (busy) return;

    const confirmed = window.confirm("Revoke Premium for this user?");
    if (!confirmed) return;

    try {
      setBusy(true);

      await adminAction({
        action: "revoke_premium",
        targetUserId: profile.id,
      });

      setProfile({
        ...profile,
        is_premium: false,
        premium_expires_at: null,
        plan_tier: "free",
        plan_period: null,
      });

      toast.success("Premium revoked");
    } catch (e) {
      console.error("[AdminUserDetail] revokePremium", e);
      toast.error(e instanceof Error ? e.message : "Could not revoke premium.");
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">User not found.</div>
        <Link to="/admin/users" className="mt-3 inline-flex text-sm text-blue-600 hover:underline">
          ← Back to Users
        </Link>
      </div>
    );
  }

  const currentRole = profile.account_role ?? "user";

  const planLabel =
    profile.plan_tier === "premium"
      ? `Premium${profile.plan_period ? ` (${profile.plan_period})` : ""}`
      : "Free";

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs text-muted-foreground">User</div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.email ?? profile.id}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {roleBadge(currentRole)}
            {auditTypeBadge(profile.audit_user_type)}
            {premiumActive ? badge("Premium active", "emerald") : badge("Not premium", "slate")}
            {badge(planLabel, premiumActive ? "emerald" : "slate")}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={currentRole}
            disabled={busy}
            onChange={(e) => updateAccountRole(e.target.value as AccountRole)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent/40 disabled:opacity-50"
            aria-label="Change user access role"
          >
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>

          <button
            disabled={busy || !premiumActive}
            onClick={revokePremium}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Revoke premium
          </button>

          <button
            disabled={busy}
            onClick={load}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent/40 disabled:opacity-50"
          >
            Refresh
          </button>

          <Link
            to="/admin/users"
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent/40"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold">Profile</h2>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Org</span>
              <span className="font-medium">{profile.org_name ?? "—"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Access role</span>
              <span className="font-medium">{prettyRole(currentRole)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Audit type</span>
              <span className="font-medium">
                {profile.audit_user_type === "developer"
                  ? "Developer"
                  : profile.audit_user_type === "organization"
                  ? "Organization"
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Premium expires</span>
              <span className="font-medium">
                {profile.premium_expires_at
                  ? new Date(profile.premium_expires_at).toLocaleString()
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleString()
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="font-medium">
                {profile.updated_at
                  ? new Date(profile.updated_at).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent audits</h2>
            <Link to="/admin/audits" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-2">Created</th>
                  <th>User type</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {audits.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={5}>
                      No audits.
                    </td>
                  </tr>
                ) : (
                  audits.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="py-2">{new Date(a.created_at).toLocaleString()}</td>
                      <td>{a.user_type ?? "—"}</td>
                      <td>{a.overall_pct ?? a.score ?? "—"}</td>
                      <td>{a.status ?? "—"}</td>
                      <td className="text-right">
                        <Link to={`/admin/audits/${a.id}`} className="text-blue-600 hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold">Manual audit requests</h2>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-2">Created</th>
                  <th>Project</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={3}>
                      No requests.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="py-2">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="max-w-[420px] truncate">{r.project ?? "—"}</td>
                      <td>{r.status ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold">Product feedback</h2>

          <div className="mt-3 space-y-3">
            {feedback.length === 0 ? (
              <div className="text-sm text-muted-foreground">No feedback.</div>
            ) : (
              feedback.map((f) => (
                <div key={f.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {new Date(f.created_at).toLocaleDateString()}
                    </div>
                    {badge(
                      `${f.overall_rating}/5`,
                      f.overall_rating >= 4
                        ? "emerald"
                        : f.overall_rating <= 2
                        ? "red"
                        : "amber"
                    )}
                  </div>

                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Surface: {f.surface}
                  </div>

                  {f.testimonial ? (
                    <div className="mt-2 text-sm">
                      <div className="line-clamp-3">{f.testimonial}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Consent public: {f.consent_public ? "yes" : "no"}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-muted-foreground">
                      No testimonial text.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}