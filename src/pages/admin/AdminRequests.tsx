import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

type ReqRow = {
  id: string;
  created_at: string;
  user_id: string | null;
  project: string | null;
  contact: string | null;
  notes: string | null;
  status: string | null;
};

const STATUSES = ["new", "in_review", "scheduled", "completed"] as const;

export default function AdminRequests() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ReqRow[]>([]);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.project, r.contact, r.notes, r.status].some((v) => (v ?? "").toLowerCase().includes(s))
    );
  }, [q, rows]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("manual_audit_requests")
      .select("id, created_at, user_id, project, contact, notes, status")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error(error);
      toast.error("Could not load requests");
      setLoading(false);
      return;
    }

    setRows((data as ReqRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: string, next: string) => {
    const { error } = await supabase
      .from("manual_audit_requests")
      .update({ status: next })
      .eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Could not update status");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    toast.success("Updated");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Manual audit requests</h1>
        <p className="text-sm text-muted-foreground">
          Pipeline view for inbound requests (new → in_review → scheduled → completed).
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search project/contact/notes…"
          className="h-10 w-full sm:max-w-md rounded-lg border border-border bg-background px-3 text-sm"
        />
        <button
          onClick={load}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm hover:bg-accent/50"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No requests</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2">Created</th>
                  <th>Project</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="max-w-[260px]">
                      <div className="font-medium">{r.project ?? "—"}</div>
                      {r.notes ? <div className="text-xs text-muted-foreground line-clamp-2">{r.notes}</div> : null}
                    </td>
                    <td className="max-w-[240px]">{r.contact ?? "—"}</td>
                    <td>
                      <select
                        value={r.status ?? "new"}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => navigator.clipboard.writeText(r.id)}
                        className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent/50"
                      >
                        Copy ID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
