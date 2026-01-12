import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type AuditRow = {
  id: string;
  created_at: string;
  user_type: string;
  status: string | null;
  overall_pct: number | null;
  score: number | null;
  counts: Record<string, unknown> | null;
  profiles?: { email: string | null } | null;
};

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

export default function AdminAudits() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AuditRow[]>([]);

  const q = params.get("q") ?? "";
  const userType = params.get("user_type") ?? "";
  const sort = params.get("sort") ?? "new"; // new | low

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("audits")
          .select(
            "id, created_at, user_type, status, overall_pct, score, counts, profiles(email)",
            { count: "exact" }
          )
          .limit(100);

        if (userType) query = query.eq("user_type", userType);

        // basic search by audit id
        if (q) query = query.ilike("id", `%${q}%`);

        if (sort === "low") {
          query = query.order("overall_pct", { ascending: true, nullsFirst: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        if (!cancelled) setRows((data as AuditRow[]) ?? []);
      } catch (e) {
        console.error("[AdminAudits] load error", e);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [q, sort, userType]);

  const totals = useMemo(() => {
    const avg = rows.length
      ? Math.round(
          (rows.reduce((acc, r) => acc + (num(r.overall_pct) ?? 0), 0) / rows.length) * 10
        ) / 10
      : 0;
    return { avg };
  }, [rows]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audits</h1>
          <p className="text-sm text-slate-600">Search and inspect audits across all users.</p>
        </div>
        <div className="text-xs text-slate-600">Average score (loaded set): {totals.avg}%</div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setParams((p) => {
            p.set("q", e.target.value);
            return p;
          })}
          placeholder="Search by audit id…"
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        />
        <select
          value={userType}
          onChange={(e) => setParams((p) => {
            const v = e.target.value;
            if (v) p.set("user_type", v);
            else p.delete("user_type");
            return p;
          })}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All user types</option>
          <option value="Developer">Developer</option>
          <option value="Organization">Organization</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setParams((p) => {
            p.set("sort", e.target.value);
            return p;
          })}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="new">Newest first</option>
          <option value="low">Lowest score first</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Counts</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {r.profiles?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">{r.user_type}</td>
                    <td className="px-4 py-3">
                      {num(r.overall_pct) ?? num(r.score) ?? "—"}%
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {r.counts ? JSON.stringify(r.counts).slice(0, 70) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="text-blue-600 hover:underline"
                        to={`/admin/audits/${r.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={6}>
                    No audits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
