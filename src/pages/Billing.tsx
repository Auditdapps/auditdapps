// src/pages/Billing.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import DashThemeToggle from "@/components/DashThemeToggle";
import toast from "react-hot-toast";

type Profile = {
  id: string;
  is_premium: boolean | null;
  premium_expires_at: string | null;
};

export default function BillingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [billingEmail, setBillingEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        navigate(`/login?next=${encodeURIComponent("/billing")}`);
        return;
      }

      setBillingEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, is_premium, premium_expires_at")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[Billing] load profile error:", error);
        toast.error("Could not load billing info.");
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading billing information…
      </div>
    );
  }

  const isPremium = !!profile?.is_premium;
  const expiresAt = profile?.premium_expires_at
    ? new Date(profile.premium_expires_at)
    : null;

  const now = new Date();
  const isExpired = expiresAt ? expiresAt < now : false;

  let renewLine: string | null = null;
  if (expiresAt) {
    const dateStr = expiresAt.toLocaleDateString();
    const diffDays = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    renewLine = isExpired
      ? `Expired on ${dateStr}`
      : diffDays <= 0
      ? `Renews today (${dateStr})`
      : `Renews on ${dateStr} (in ${diffDays} days)`;
  }

  const currentPlan =
    isPremium && !isExpired
      ? "Premium"
      : isPremium && isExpired
      ? "Premium (expired)"
      : "Free";

  const premiumCopy = isPremium
    ? isExpired
      ? "Your premium access has expired. You can renew below."
      : "You currently have full access to all premium features."
    : "Upgrade to Premium to unlock certificates, full recommendations, and priority support.";

  const handleOpenBillingPortal = async () => {
    try {
      setBusy(true);

      const { data, error } = await supabase.functions.invoke(
        "billing-portal",
        { body: {} }
      );

      if (error) {
        toast.error("Could not open billing portal.");
        return;
      }

      window.location.href = data.url;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">

        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              View your current plan, manage your subscription, and update billing details.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <DashThemeToggle />
              <button
                onClick={() => navigate("/dashboard")}
                className="h-9 px-3 inline-flex items-center rounded-full border border-border bg-card hover:bg-accent/60"
              >
                ← Back to dashboard
              </button>
            </div>
            <p>Managed securely via Stripe.</p>
          </div>
        </header>

        {/* Main two-column layout */}
        <div className="grid gap-6 lg:grid-cols-2 items-start">

          {/* CURRENT PLAN */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold mb-2">Current plan</h2>
            <p className="text-sm text-muted-foreground mb-4">{premiumCopy}</p>

            <div className="rounded-xl border border-border bg-background p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="font-semibold text-sm">{currentPlan}</p>

                  {renewLine && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {renewLine}
                    </p>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                    isPremium && !isExpired
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isPremium && !isExpired
                    ? "Premium active"
                    : isPremium && isExpired
                    ? "Premium expired"
                    : "Free plan"}
                </span>
              </div>

              {billingEmail && (
                <div className="text-[11px] mt-4 border-t border-dashed border-border pt-2 flex justify-between">
                  <span>Billing email</span>
                  <span className="font-medium">{billingEmail}</span>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3">

              {/* Stripe portal */}
              <button
                onClick={handleOpenBillingPortal}
                disabled={busy}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 shadow-sm disabled:opacity-50"
              >
                Manage billing in Stripe
              </button>

              {/* Send to AUTH/PAYMENT page */}
              {(!isPremium || isExpired) && (
                <button
                  onClick={() => navigate("/auth/payment")}
                  disabled={busy}
                  className="rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold px-4 py-2"
                >
                  {isExpired ? "Renew Premium" : "Upgrade to Premium"}
                </button>
              )}
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-semibold">What you get with Premium</h2>
            <ul className="space-y-2">
              <li>• Unlimited audits and saved results</li>
              <li>• Full AI-generated recommendations</li>
              <li>• Downloadable certificates for stakeholders</li>
              <li>• Priority support for audit questions</li>
              <li>• Yearly saves ~22% vs monthly</li>
            </ul>

            <div className="border border-dashed border-border rounded-xl p-3 mt-4 text-muted-foreground">
              <p className="font-semibold mb-1">Comparing plans?</p>
              <p>
                Visit the{" "}
                <button
                  onClick={() => navigate("/pricing")}
                  className="underline hover:text-blue-600"
                >
                  Pricing page
                </button>{" "}
                for a full overview.
              </p>
            </div>
          </section>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Something not right?{" "}
          <button
            onClick={() => navigate("/contact")}
            className="underline hover:text-blue-600"
          >
            Contact support
          </button>
          .
        </p>
      </div>
    </div>
  );
}
