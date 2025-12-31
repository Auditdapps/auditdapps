// src/pages/Audits.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import DashThemeToggle from "@/components/DashThemeToggle";

/* ===================== types ===================== */
type Counts = Partial<{ critical: number; high: number; medium: number; low: number }>;
type Audit = {
  id: string;
  user_id?: string;
  created_at: string | null;
  user_type: string;
  status: string | null;
  counts: Counts | null;
  score: number | null;
  meta?: any;
  analytics?: any;
};

/* ===================== helpers ===================== */
function computeScoreFromCounts(counts: Counts | null | undefined) {
  const c = counts ?? {};
  const critical = c.critical ?? 0;
  const high = c.high ?? 0;
  const medium = c.medium ?? 0;
  const low = c.low ?? 0;
  const raw = 100 - 40 * critical - 20 * high - 10 * medium - 5 * low;
  const clamped = Math.max(0, Math.min(100, raw));
  return Math.round(clamped);
}

function pickNumber(...vals: any[]): number | null {
  for (const v of vals) {
    const n = typeof v === "string" ? parseFloat(v) : v;
    if (Number.isFinite(n)) return n as number;
  }
  return null;
}

/* ===================== page ===================== */
export default function Audits() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id ?? null;
        if (!userId) {
          navigate("/login");
          return;
        }
        const { data, error } = await supabase
          .from("audits")
          .select("id, created_at, user_type, status, counts, score, user_id, meta, analytics")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!mounted) return;
        setAudits(
          (data ?? []).map((a: any) => ({
            id: a.id,
            created_at: a.created_at ?? null,
            user_type: a.user_type,
            status: a.status,
            counts: (a.counts ?? null) as Counts | null,
            score: a.score ?? null,
            user_id: a.user_id,
            meta: a.meta ?? null,
            analytics: a.analytics ?? null,
          }))
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-background text-foreground">
        <div className="text-muted-foreground text-sm">Loading audits…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 md:px-6 py-6">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold">All Audits</h1>
          <div className="flex items-center gap-2">
            <DashThemeToggle />
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 h-9 inline-flex items-center rounded-full border border-border bg-card/80 shadow-sm text-sm hover:bg-accent/60"
            >
              ← Back to dashboard
            </button>
          </div>
        </div>

        <motion.div
          className="mt-6 rounded-2xl border border-border bg-card/90 backdrop-blur shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {audits.length ? `${audits.length} total audits` : "No audits yet."}
            </div>
          </div>

          <div className="overflow-auto rounded-b-2xl">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">Type</th>
                  <th className="py-2 px-3 text-right">Score</th>
                  <th className="py-2 px-3 text-right">Findings</th>
                  <th className="py-2 px-3 text-right">Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {audits.length ? (
                  audits.map((a, i) => {
                    const c = a.counts ?? {};
                    const total =
                      (c.critical ?? 0) +
                      (c.high ?? 0) +
                      (c.medium ?? 0) +
                      (c.low ?? 0);

                    const metaOverall = a?.meta?.analytics?.overallPct;
                    const legacyOverall = a?.analytics?.overallPct;

                    const rowScore = ((): number => {
                      const n = pickNumber(
                        a?.score,
                        a?.meta?.analytics?.score,
                        a?.meta?.analytics?.risk_score,
                        a?.analytics?.score,
                        a?.analytics?.risk_score,
                        metaOverall != null ? 100 - Number(metaOverall) : null,
                        legacyOverall != null ? 100 - Number(legacyOverall) : null
                      );
                      return n !== null
                        ? Math.round(n)
                        : computeScoreFromCounts(a.counts);
                    })();

                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        className="border-t border-border hover:bg-accent/40"
                      >
                        <td className="py-2 px-3">
                          {a.created_at
                            ? new Date(a.created_at).toLocaleString()
                            : "—"}
                        </td>
                        <td className="py-2 px-3">{a.user_type}</td>
                        <td className="py-2 px-3 text-right font-semibold">
                          {Math.round(rowScore)}%
                        </td>
                        <td className="py-2 px-3 text-right">{total}</td>
                        <td className="py-2 px-3 text-right">
                          {a.status ?? "—"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <a
                            href={`/audits/${a.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            View details →
                          </a>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      className="py-3 px-3 text-muted-foreground"
                      colSpan={6}
                    >
                      No audits yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
