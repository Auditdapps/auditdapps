import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

type CountRow = { count: number | null };

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function formatDay(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type OverviewCard = { label: string; value: string; sub?: string };

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // raw datasets for charts
  const [auditRows, setAuditRows] = useState<{ created_at: string | null }[]>([]);
  const [recRows, setRecRows] = useState<{ severity: string; status: string | null }[]>([]);
  const [premiumRows, setPremiumRows] = useState<{ updated_at: string | null }[]>([]);

  // cards
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [newUsers30d, setNewUsers30d] = useState<number>(0);
  const [totalAudits, setTotalAudits] = useState<number>(0);
  const [audits7d, setAudits7d] = useState<number>(0);
  const [avgScore30d, setAvgScore30d] = useState<number | null>(null);
  const [premiumActive, setPremiumActive] = useState<number>(0);
  const [openHighCritical, setOpenHighCritical] = useState<number>(0);
  const [newManualRequests, setNewManualRequests] = useState<number>(0);
  const [feedback30d, setFeedback30d] = useState<{ count: number; avg: number | null }>({ count: 0, avg: null });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // --- USERS ---
        const [{ count: usersCount }, { count: newUsersCount }] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .gte("created_at", isoDaysAgo(30)),
        ]);

        // --- AUDITS ---
        const [{ count: auditsCount }, { count: audits7dCount }] = await Promise.all([
          supabase.from("audits").select("id", { count: "exact", head: true }),
          supabase
            .from("audits")
            .select("id", { count: "exact", head: true })
            .gte("created_at", isoDaysAgo(7)),
        ]);

        // Avg score (30d) + audits per day chart
        const { data: audits30d, error: audits30dErr } = await supabase
          .from("audits")
          .select("created_at, score")
          .gte("created_at", isoDaysAgo(30))
          .order("created_at", { ascending: true })
          .limit(5000);
        if (audits30dErr) throw audits30dErr;

        // --- PREMIUM ACTIVE ---
        const { count: premiumCount, error: premErr } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("plan_tier", "premium")
          .gt("premium_expires_at", new Date().toISOString());
        if (premErr) throw premErr;

        // --- OPEN HIGH/CRITICAL RECS ---
        const { count: recCount, error: recCountErr } = await supabase
          .from("recommendations")
          .select("id", { count: "exact", head: true })
          .eq("status", "open")
          .in("severity", ["Critical", "High"]);
        if (recCountErr) throw recCountErr;

        // for severity chart
        const { data: recs30d, error: recs30dErr } = await supabase
          .from("recommendations")
          .select("severity, status")
          .gte("created_at", isoDaysAgo(30))
          .limit(5000);
        if (recs30dErr) throw recs30dErr;

        // --- MANUAL REQUESTS (new) ---
        const { count: reqCount, error: reqErr } = await supabase
          .from("manual_audit_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "new");
        if (reqErr) throw reqErr;

        // --- FEEDBACK (30d) ---
        const { data: fbRows, error: fbErr } = await supabase
          .from("product_feedback")
          .select("overall_rating, created_at")
          .gte("created_at", isoDaysAgo(30))
          .limit(5000);
        if (fbErr) throw fbErr;

        // --- PREMIUM CONVERSION PROXY ---
        // There is no dedicated “upgraded_at” column yet.
        // So we use profiles.updated_at as a proxy for “plan changed to premium”.
        // Recommended upgrade: add `upgraded_at` and set it in the Stripe webhook.
        const { data: premRows, error: premRowsErr } = await supabase
          .from("profiles")
          .select("updated_at")
          .eq("plan_tier", "premium")
          .gte("updated_at", isoDaysAgo(30))
          .order("updated_at", { ascending: true })
          .limit(5000);
        if (premRowsErr) throw premRowsErr;

        if (!mounted) return;

        setTotalUsers(usersCount ?? 0);
        setNewUsers30d(newUsersCount ?? 0);
        setTotalAudits(auditsCount ?? 0);
        setAudits7d(audits7dCount ?? 0);
        setPremiumActive(premiumCount ?? 0);
        setOpenHighCritical(recCount ?? 0);
        setNewManualRequests(reqCount ?? 0);

        // charts datasets
        setAuditRows((audits30d ?? []).map((r) => ({ created_at: r.created_at })));
        setRecRows((recs30d ?? []) as any);
        setPremiumRows((premRows ?? []) as any);

        const scores = (audits30d ?? [])
          .map((r) => (typeof r.score === "number" ? r.score : r.score ? Number(r.score) : null))
          .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
        setAvgScore30d(scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null);

        const ratings = (fbRows ?? [])
          .map((r: any) => (typeof r.overall_rating === "number" ? r.overall_rating : Number(r.overall_rating)))
          .filter((v: number) => !Number.isNaN(v));
        setFeedback30d({
          count: ratings.length,
          avg: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
        });
      } catch (e) {
        console.error("[AdminOverview] load error:", e);
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load admin overview");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const cards: OverviewCard[] = useMemo(() => {
    return [
      { label: "Total users", value: String(totalUsers), sub: `New (30d): ${newUsers30d}` },
      { label: "Total audits", value: String(totalAudits), sub: `Last 7d: ${audits7d}` },
      { label: "Avg score (30d)", value: avgScore30d == null ? "—" : avgScore30d.toFixed(1) },
      { label: "Premium active", value: String(premiumActive), sub: "Based on premium_expires_at" },
      { label: "Open High/Critical", value: String(openHighCritical), sub: "Recommendations" },
      { label: "Manual requests", value: String(newManualRequests), sub: "Status: new" },
      { label: "Feedback (30d)", value: String(feedback30d.count), sub: feedback30d.avg ? `Avg: ${feedback30d.avg.toFixed(1)}/5` : "Avg: —" },
    ];
  }, [
    totalUsers,
    newUsers30d,
    totalAudits,
    audits7d,
    avgScore30d,
    premiumActive,
    openHighCritical,
    newManualRequests,
    feedback30d,
  ]);

  const auditsPerDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of auditRows) {
      if (!r.created_at) continue;
      const d = new Date(r.created_at);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const keys = Array.from(map.keys()).sort();
    return keys.map((k) => ({ day: formatDay(new Date(k)), audits: map.get(k) ?? 0 }));
  }, [auditRows]);

  const severityData = useMemo(() => {
    const severities = ["Critical", "High", "Medium", "Low"] as const;
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    for (const r of recRows) {
      const s = r.severity;
      if (severities.includes(s as any)) counts[s] += 1;
    }
    return severities.map((s) => ({ name: s, value: counts[s] }));
  }, [recRows]);

  const premiumTrend = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of premiumRows) {
      if (!r.updated_at) continue;
      const d = new Date(r.updated_at);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const keys = Array.from(map.keys()).sort();
    return keys.map((k) => ({ day: formatDay(new Date(k)), upgrades: map.get(k) ?? 0 }));
  }, [premiumRows]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading overview…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">
          Operations + product signals across users, audits, recommendations, requests, and feedback.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className="mt-1 text-2xl font-semibold">{c.value}</div>
            {c.sub ? <div className="mt-2 text-xs text-muted-foreground">{c.sub}</div> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-3">
            <div className="text-sm font-semibold">Audits per day</div>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={auditsPerDay}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="audits" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3">
            <div className="text-sm font-semibold">Severity distribution</div>
            <div className="text-xs text-muted-foreground">Recommendations (30d)</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" outerRadius={90}>
                  {severityData.map((_, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span>{s.name}</span>
                <span className="font-medium text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3">
          <div className="text-sm font-semibold">Premium conversion trend (proxy)</div>
          <div className="text-xs text-muted-foreground">
            Based on profiles.updated_at for premium users. For accuracy, add an upgraded_at column set by the Stripe webhook.
          </div>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={premiumTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="upgrades" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
