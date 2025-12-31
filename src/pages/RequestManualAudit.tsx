// src/pages/RequestManualAudit.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import DashThemeToggle from "@/components/DashThemeToggle";

export default function RequestManualAudit() {
  const navigate = useNavigate();
  const [project, setProject] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string>("");
  const [errMsg, setErrMsg] = useState<string>("");

  async function submit() {
    try {
      setLoading(true);
      setOkMsg("");
      setErrMsg("");

      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id ?? null;
      const userEmail = auth.user?.email ?? null;

      if (!userId) {
        alert("Please sign in to request a manual audit.");
        return;
      }

      const { error: insertError } = await supabase
        .from("manual_audit_requests")
        .insert({
          user_id: userId,
          project,
          contact,
          notes,
          status: "new",
        })
        .select()
        .single();

      if (insertError) {
        console.warn("[manual-audit] insert failed:", insertError.message);
        setErrMsg("We couldn't save your request. Please try again.");
        return;
      }

      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "send-manual-audit",
        {
          body: { project, contact, notes, user_id: userId, email: userEmail },
        }
      );

      if (fnError) {
        setOkMsg("Your request was saved. We’ll email the team shortly.");
      } else if (!fnData?.ok) {
        setOkMsg("Your request was saved. Email notification is pending.");
      } else {
        setOkMsg(
          "Your request has been submitted. We'll get back to you shortly."
        );
      }

      setProject("");
      setContact("");
      setNotes("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header – match Scanner style */}
        <header className="mb-6 md:mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Request Manual Audit
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Premium/One-time users can request a deep, human-led engagement
              for critical smart contracts and production systems.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-[11px] text-muted-foreground md:text-right">
            <div className="flex items-center gap-2">
              <DashThemeToggle />
              <button
                onClick={() => navigate("/dashboard")}
                className="px-3 h-9 inline-flex items-center rounded-full text-[11px] font-medium border border-border bg-card hover:bg-accent/60"
              >
                ← Back to dashboard
              </button>
            </div>
            <p className="max-w-xs">
              We&apos;ll review your request and follow up with timelines, scope,
              and estimated pricing based on the complexity.
            </p>
          </div>
        </header>

        {/* Form card */}
        <section className="rounded-2xl border border-border bg-card/90 backdrop-blur p-5 md:p-6 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-5"
          >
            {/* Project URL */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Project / Repo / App URL
              </label>
              <input
                type="url"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="https://github.com/you/your-contracts"
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This could be a GitHub repo, dApp URL, or documentation link that
                best represents the scope.
              </p>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Contact Email / Telegram / Discord
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="you@example.com / @handle"
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;ll reach out via this contact channel to follow up.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Scope, timelines, target networks, critical components, upgrade plans, specific concerns…"
                rows={5}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Submit + messages */}
            <div className="flex items-center justify-between pt-2 gap-3 flex-wrap">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting…" : "Submit Request"}
              </button>

              <div className="flex-1 text-right space-y-1 text-sm">
                {okMsg && (
                  <div className="text-emerald-600">
                    {okMsg}
                  </div>
                )}
                {errMsg && (
                  <div className="text-rose-600">
                    {errMsg}
                  </div>
                )}
              </div>
            </div>
          </form>
        </section>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Don’t have access?{" "}
          <a
            href="/pricing"
            className="underline hover:text-blue-600"
          >
            Upgrade your plan
          </a>
          .
        </p>
      </div>
    </div>
  );
}
