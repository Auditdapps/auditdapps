import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type AuditRow = {
  id: string;
  user_id: string;
  user_type: string;
  status: string | null;
  created_at: string;
  overall_pct: number | null;
  score: number | null;
  counts: any;
  totals: any;
  answers: any;
  analytics: any;
  meta: any;
  baseline_findings: any;
  recommendations_md: string | null;
  profiles?: { email: string | null; org_name: string | null } | null;
};

type RecRow = {
  id: string;
  title: string;
  severity: string;
  status: string | null;
  rationale: string | null;
  mitigation: string | null;
  likelihood: string | null;
  weight: number | null;
  created_at: string;
};

function fmt(d: string) {
  return new Date(d).toLocaleString();
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(value ?? null, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  return (
    <details className="rounded-xl border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold">{label}</summary>
      <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
        {text}
      </pre>
    </details>
  );
}

export default function AdminAuditDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<AuditRow | null>(null);
  const [recs, setRecs] = useState<RecRow[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("audits")
          .select(
            "id, user_id, user_type, status, created_at, overall_pct, score, counts, totals, answers, analytics, meta, baseline_findings, recommendations_md, profiles(email, org_name)"
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!cancelled) setAudit((data as AuditRow) ?? null);

        const { data: recData, error: recErr } = await supabase
          .from("recommendations")
          .select("id, title, severity, status, rationale, mitigation, likelihood, weight, created_at")
          .eq("audit_id", id)
          .order("severity", { ascending: true })
          .order("created_at", { ascending: false });
        if (recErr) throw recErr;
        if (!cancelled) setRecs((recData as RecRow[]) ?? []);
      } catch (e) {
        console.error("[AdminAuditDetail] load error", e);
        if (!cancelled) {
          setAudit(null);
          setRecs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="text-sm text-slate-600">Loading audit…</div>;
  }

  if (!audit) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-slate-600">Audit not found.</div>
        <Link to="/admin/audits" className="text-sm text-blue-600 underline">
          ← Back to audits
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Audit details</h1>
          <div className="text-sm text-slate-600">
            <span className="font-mono">{audit.id}</span>
            <span className="mx-2">•</span>
            {audit.user_type}
            <span className="mx-2">•</span>
            {fmt(audit.created_at)}
          </div>
          <div className="text-sm text-slate-600">
            User: {audit.profiles?.email ?? audit.user_id}
            {audit.profiles?.org_name ? ` (${audit.profiles.org_name})` : ""}
          </div>
        </div>

        <div className="flex gap-2">
          <Link to="/admin/audits" className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold grid place-items-center">
            ← Back
          </Link>
          <Link to={`/admin/users/${audit.user_id}`} className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white grid place-items-center">
            View user
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Overall</div>
          <div className="mt-1 text-2xl font-bold">{audit.overall_pct ?? "—"}%</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Status</div>
          <div className="mt-1 text-2xl font-bold">{audit.status ?? "—"}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Recommendations</div>
          <div className="mt-1 text-2xl font-bold">{recs.length}</div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold">Recommendations</h2>
        <div className="mt-4 overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-2">Severity</th>
                <th className="py-2">Title</th>
                <th className="py-2">Status</th>
                <th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {recs.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <td className="py-3 font-semibold">{r.severity}</td>
                  <td className="py-3">
                    <div className="font-medium">{r.title}</div>
                    {r.mitigation ? <div className="mt-1 text-xs text-slate-600">Mitigation: {r.mitigation}</div> : null}
                  </td>
                  <td className="py-3">{r.status ?? "open"}</td>
                  <td className="py-3 text-xs text-slate-600">
                    {r.rationale ? <div>Rationale: {r.rationale}</div> : null}
                    {r.likelihood ? <div>Likelihood: {r.likelihood}</div> : null}
                    {typeof r.weight === "number" ? <div>Weight: {r.weight}</div> : null}
                  </td>
                </tr>
              ))}
              {!recs.length ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No recommendations rows.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {audit.recommendations_md ? (
        <details className="rounded-2xl border border-slate-200 bg-white p-6">
          <summary className="cursor-pointer text-base font-semibold">Raw recommendations markdown</summary>
          <pre className="mt-4 max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
            {audit.recommendations_md}
          </pre>
        </details>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <JsonBlock label="counts" value={audit.counts} />
        <JsonBlock label="totals" value={audit.totals} />
        <JsonBlock label="baseline_findings" value={audit.baseline_findings} />
        <JsonBlock label="answers" value={audit.answers} />
        <JsonBlock label="analytics" value={audit.analytics} />
        <JsonBlock label="meta" value={audit.meta} />
      </div>
    </div>
  );
}
