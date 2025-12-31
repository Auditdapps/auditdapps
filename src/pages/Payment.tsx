// src/pages/Payment.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { startCheckout } from "@/lib/checkout";
import { PLANS } from "@/lib/plans";
import { Check, Loader2 } from "lucide-react";

type Period = "weekly" | "monthly" | "annual";

const PERIOD_LABEL: Record<Period, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  annual: "Yearly",
};

const PERIOD_PRICE: Record<Period, string> = {
  weekly: "9.99",
  monthly: "34.99",
  annual: "349.99",
};

export default function Payment() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("monthly");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("[Payment] getUser error:", error);
        toast.error("Please log in to manage your subscription.");
        navigate("/login");
        return;
      }

      if (!user) {
        toast.error("Please log in to manage your subscription.");
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("[Payment] profile error:", profileError);
      } else {
        setIsPremium(!!profile?.is_premium);
      }

      setChecking(false);
    };

    void checkStatus();
  }, [navigate]);

  const handleUpgrade = async () => {
    if (checking) return;

    if (isPremium) {
      toast("You’re already on the Premium plan.");
      return;
    }

    setLoading(true);
    const key =
      period === "weekly"
        ? "premium_weekly"
        : period === "monthly"
        ? "premium_monthly"
        : "premium_annual";

    try {
      const priceId = PLANS[key].priceId;
      await startCheckout(priceId);
    } catch (err: any) {
      console.error("[Payment] startCheckout error:", err);
      toast.error(err.message || "Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
  <main className="bg-slate-50">
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:flex-row lg:items-center">
      {/* Left content */}
      <section className="flex-1 space-y-6">
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
          Premium access
        </span>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Upgrade to unlock full AI audit reports &amp; certificates
        </h1>

        <p className="max-w-xl text-sm leading-relaxed text-slate-600">
          Get unlimited self-audits, detailed AI-generated recommendations and
          downloadable certificates so you can prove your project’s security
          posture to investors, partners and your community.
        </p>

        {/* Billing period toggle */}
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          {(["weekly", "monthly", "annual"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={[
                "rounded-full px-4 py-1.5 transition",
                period === p
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              ].join(" ")}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>

        {/* Features */}
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {[
            "Unlimited security self-audits",
            "Full AI-generated recommendations",
            "Implementation tracking & audit history",
            "Downloadable PDF certificates",
            "Priority email support",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[11px] text-slate-500">
          Cancel anytime. Prices in GBP. VAT may apply.
        </p>
      </section>

      {/* Right card */}
      <section className="flex-1">
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Premium plan
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {PERIOD_LABEL[period]} billing
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-end justify-end gap-1">
                <span className="text-3xl font-semibold tracking-tight text-slate-900">
                  £{PERIOD_PRICE[period]}
                </span>
                <span className="text-xs text-slate-500">
                  /
                  {period === "annual"
                    ? "year"
                    : period === "weekly"
                    ? "week"
                    : "month"}
                </span>
              </div>

              {/* Save 22% badge for yearly */}
              {period === "annual" && (
                <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-[2px] text-[10px] font-semibold text-emerald-700">
                  Save 22%
                </span>
              )}
            </div>
          </div>


          <button
            type="button"
            onClick={handleUpgrade}
            disabled={checking || loading || !!isPremium}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Stripe…
              </>
            ) : isPremium ? (
              "You’re already on Premium"
            ) : (
              "Upgrade securely with Stripe"
            )}
          </button>

          <p className="mt-3 text-[11px] text-slate-500">
            Payments are processed securely by Stripe. Your card details never
            touch our servers.
          </p>
        </div>
      </section>
    </div>
  </main>
);
}
