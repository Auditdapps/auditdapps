import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FeedbackRow = {
  id: string;
  created_at: string;
  user_id: string;
  audit_id: string | null;
  surface: string;
  overall_rating: number;
  clarity_rating: number | null;
  would_recommend: boolean;
  consent_public: boolean;
  testimonial: string | null;
  what_should_improve: string | null;
  what_was_confusing: string | null;
  what_was_helpful: string | null;
};

export default function AdminFeedback() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [q, setQ] = useState("");
  const [onlyPublic, setOnlyPublic] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const query = supabase
          .from("product_feedback")
          .select(
            "id,created_at,user_id,audit_id,surface,overall_rating,clarity_rating,would_recommend,consent_public,testimonial,what_should_improve,what_was_confusing,what_was_helpful"
          )
          .order("created_at", { ascending: false })
          .limit(500);

        const { data, error } = await query;
        if (error) throw error;
        if (!mounted) return;
        setRows((data as FeedbackRow[]) ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyPublic && !r.consent_public) return false;
      if (!needle) return true;
      return (
        r.surface.toLowerCase().includes(needle) ||
        (r.testimonial ?? "").toLowerCase().includes(needle) ||
        (r.what_should_improve ?? "").toLowerCase().includes(needle) ||
        (r.what_was_confusing ?? "").toLowerCase().includes(needle) ||
        (r.what_was_helpful ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, onlyPublic]);

  const avg = useMemo(() => {
    if (filtered.length === 0) return 0;
    return Math.round(
      (filtered.reduce((sum, r) => sum + (r.overall_rating ?? 0), 0) / filtered.length) * 10
    ) / 10;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Product Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Insights, testimonials (with consent), and recurring pain points.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <div className="font-semibold">Avg rating</div>
          <div className="text-2xl font-bold">{avg || "—"}</div>
          <div className="text-xs text-muted-foreground">({filtered.length} rows)</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search feedback text…"
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyPublic}
              onChange={(e) => setOnlyPublic(e.target.checked)}
            />
            Public testimonials only
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Latest</div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No feedback found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold">
                    {new Date(r.created_at).toLocaleString()} • Rating {r.overall_rating}/5
                    {r.consent_public ? (
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                        Public
                      </span>
                    ) : (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Surface: {r.surface}</div>
                </div>

                {r.testimonial && (
                  <div className="mt-3 rounded-xl border border-border bg-background p-3 text-sm">
                    <div className="text-xs font-semibold text-muted-foreground">Testimonial</div>
                    <p className="mt-1 whitespace-pre-wrap">{r.testimonial}</p>
                  </div>
                )}

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <SmallTextCard title="Helpful" value={r.what_was_helpful} />
                  <SmallTextCard title="Confusing" value={r.what_was_confusing} />
                  <SmallTextCard title="Should improve" value={r.what_should_improve} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SmallTextCard({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-xs font-semibold text-muted-foreground">{title}</div>
      <p className="mt-1 text-sm whitespace-pre-wrap text-slate-900 dark:text-slate-100">
        {value?.trim() ? value : "—"}
      </p>
    </div>
  );
}
