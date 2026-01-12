import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import type { Period, PlanTier } from "./_adminTypes";

type ProfileRow = {
  id: string;
  email: string | null;
  org_name: string | null;
  role: string | null;
  is_admin: boolean | null;
  is_premium: boolean | null;
  premium_expires_at: string | null;
  plan_tier: PlanTier | null;
  plan_period: Period | null;
  created_at: string | null;
  updated_at: string | null;
};

type AuditRow = {
  id: string;
  user_type: string;
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

function badge(text: string, tone: "slate" | "emerald" | "amber" | "red" = "slate") {
  const map: Record<typeof tone, string> = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${map[tone]}`}>
      {text}
    </span>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [busy, setBusy] = useState(false);

  const premiumActive = useMemo(() => {
    if (!profile) return false;
    if (!profile.premium_expires_at) return false;
    return new Date(profile.premium_expires_at) > new Date();
  }, [profile]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (!id) return;

        const { data: p, error: pErr } = await supabase
          .from("profiles")
          .select(
            "id,email,org_name,role,is_admin,is_premium,premium_expires_at,plan_tier,plan_period,created_at,updated_at"
          )
          .eq("id", id)
          .single();
        if (pErr) throw pErr;

        const { data: a } = await supabase
          .from("audits")
          .select("id,user_type,status,score,overall_pct,created_at")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(25);

        const { data: r } = await supabase
          .from("manual_audit_requests")
          .select("id,project,contact,status,created_at")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(20);

        const { data: f } = await supabase
          .from("product_feedback")
          .select("id,overall_rating,surface,created_at,testimonial,consent_public")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!mounted) return;
        setProfile(p as ProfileRow);
        setAudits((a ?? []) as AuditRow[]);
        setRequests((r ?? []) as RequestRow[]);
        setFeedback((f ?? []) as FeedbackRow[]);
      } catch (e) {
        console.error(e);
        toast.error("Could not load user details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const toggleAdmin = async () => {
    if (!profile) return;
    try {
      setBusy(true);
      const next = !(profile.is_admin === true);
      const { error } = await supabase.from("profiles").update({ is_admin: next }).eq("id", profile.id);
      if (error) throw error;
      setProfile({ ...profile, is_admin: next });
      toast.success(next ? "Admin granted" : "Admin removed");
    } catch (e) {
      console.error(e);
      toast.error("Could not update admin status.");
    } finally {
      setBusy(false);
    }
  };

  const revokePremium = async () => {
    if (!profile) return;
    if (!confirm("Revoke Premium for this user?")) return;
    try {
      setBusy(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          premium_expires_at: null,
          plan_tier: "free",
          plan_period: null,
          stripe_price_id: null,
        })
        .eq("id", profile.id);
      if (error) throw error;
      setProfile({ ...profile, is_premium: false, premium_expires_at: null, plan_tier: "free", plan_period: null });
      toast.success("Premium revoked");
    } catch (e) {
      console.error(e);
      toast.error("Could not revoke premium.");
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

  const planLabel = profile.plan_tier === "premium" ? `Premium${profile.plan_period ? ` (${profile.plan_period})` : ""}` : "Free";

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs text-muted-foreground">User</div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.email ?? profile.id}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {profile.is_admin ? badge("Admin", "emerald") : badge("Standard", "slate")}
            {premiumActive ? badge("Premium active", "emerald") : badge("Not premium", "slate")}
            {badge(planLabel, premiumActive ? "emerald" : "slate")}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy}
            onClick={toggleAdmin}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent/40 disabled:opacity-50"
          >
            {profile.is_admin ? "Remove admin" : "Make admin"}
          </button>
          <button
            disabled={busy}
            onClick={revokePremium}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Revoke premium
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
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{profile.role ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Premium expires</span>
              <span className="font-medium">
                {profile.premium_expires_at ? new Date(profile.premium_expires_at).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{profile.created_at ? new Date(profile.created_at).toLocaleString() : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="font-medium">{profile.updated_at ? new Date(profile.updated_at).toLocaleString() : "—"}</span>
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
                      <td>{a.user_type}</td>
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
                    <div className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</div>
                    {badge(`${f.overall_rating}/5`, f.overall_rating >= 4 ? "emerald" : f.overall_rating <= 2 ? "red" : "amber")}
                  </div>
                  {f.testimonial ? (
                    <div className="mt-2 text-sm">
                      <div className="line-clamp-3">{f.testimonial}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Consent public: {f.consent_public ? "yes" : "no"}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-muted-foreground">No testimonial text.</div>
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
