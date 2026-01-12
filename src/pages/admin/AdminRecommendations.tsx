import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type RecRow = {
  id: string;
  audit_id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: string | null;
  created_at: string;
  audit: { user_id: string | null } | null;
};

const severities: RecRow["severity"][] = ["Critical", "High", "Medium", "Low"];

export default function AdminRecommendations() {
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState<RecRow["severity"] | "all">("all");
  const [status, setStatus] = useState<string | "all">("all");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<RecRow[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("recommendations")
        .select(
          "id,audit_id,title,severity,status,created_at,audits(user_id)",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .limit(300);

      if (severity !== "all") query = query.eq("severity", severity);
      if (status !== "all") query = query.eq("status", status);
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

      const { data, error } = await query;
      if (error) throw error;

      const mapped: RecRow[] = (data ?? []).map((r: any) => ({
        id: r.id,
        audit_id: r.audit_id,
        title: r.title,
        severity: r.severity,
        status: r.status,
        created_at: r.created_at,
        audit: r.audits ? { user_id: r.audits.user_id } : null,
      }));

      setRows(mapped);
    } catch (e: any) {
      console.error(e);
      toast.error("Could not load recommendations");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recurring = useMemo(() => {
    const map = new Map<string, { title: string; count: number; critical: number; high: number }>();
    for (const r of rows) {
      const key = r.title.toLowerCase().trim();
      const prev = map.get(key) ?? { title: r.title, count: 0, critical: 0, high: 0 };
      prev.count += 1;
      if (r.severity === "Critical") prev.critical += 1;
      if (r.severity === "High") prev.high += 1;
      map.set(key, prev);
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [rows]);

  const updateStatus = async (id: string, next: string) => {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: next } : x)));
    const { error } = await supabase.from("recommendations").update({ status: next }).eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Failed to update status");
      setRows(prev);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recommendations</h1>
        <p className="text-sm text-muted-foreground">
          Global view across all audits. Filter, spot recurring findings, and mark status.
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title…"
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
            />
            <button
              onClick={load}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-950"
            >
              Apply
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="h-10 rounded-xl border bg-background px-3 text-sm"
            >
              <option value="all">All severities</option>
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-10 rounded-xl border bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="fixed">Fixed</option>
              <option value="in_progress">In progress</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Latest</h2>
            <span className="text-xs text-muted-foreground">Showing up to 300</span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 text-left">Title</th>
                    <th className="py-2 text-left">Severity</th>
                    <th className="py-2 text-left">Status</th>
                    <th className="py-2 text-left">Audit</th>
                    <th className="py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-2">
                        <span className="rounded-full border px-2 py-1 text-xs">{r.severity}</span>
                      </td>
                      <td className="py-2">
                        <span className="rounded-full border px-2 py-1 text-xs">
                          {r.status ?? "open"}
                        </span>
                      </td>
                      <td className="py-2">
                        <Link className="text-blue-600 hover:underline" to={`/admin/audits/${r.audit_id}`}>
                          View
                        </Link>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateStatus(r.id, "open")}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-muted"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "fixed")}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-muted"
                          >
                            Fixed
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "in_progress")}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-muted"
                          >
                            In progress
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Top recurring findings</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Quick proxy based on title frequency in the current result set.
          </p>
          <div className="mt-4 space-y-3">
            {recurring.map((r) => (
              <div key={r.title} className="rounded-xl border bg-background p-3">
                <div className="text-sm font-medium">{r.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {r.count} occurrences · {r.critical} critical · {r.high} high
                </div>
              </div>
            ))}
            {recurring.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">No data.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
