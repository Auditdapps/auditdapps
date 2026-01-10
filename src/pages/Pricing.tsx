// src/pages/Pricing.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FaCrown, FaUserShield } from "react-icons/fa";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

/* -------------------------------- Types ---------------------------------- */

type Period = "weekly" | "monthly" | "annual";
type PlanTier = "free" | "premium";

type Profile = {
  plan_tier: PlanTier | null;
  plan_period: Period | null;
  stripe_price_id: string | null;
  // legacy (optional)
  is_premium?: boolean | null;
};

/* ----------------------------- Animations -------------------------------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const cardV: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const cardsStagger: Variants = {
  show: { transition: { staggerChildren: 0.08 } },
};

/* ----------------------------- Helpers ----------------------------------- */

// “Higher” means longer commitment. We are not calling shorter plan “downgrade”.
// weekly < monthly < annual
const periodRank: Record<Period, number> = {
  weekly: 1,
  monthly: 2,
  annual: 3,
};

function formatPeriodLabel(p: Period) {
  return p === "annual" ? "yearly" : p;
}

function compareCommitment(from: Period, to: Period) {
  const a = periodRank[from];
  const b = periodRank[to];
  if (a === b) return "same";
  return b > a ? "longer" : "shorter";
}

/* -------------------------------- Component ------------------------------ */

export default function Pricing() {
  const navigate = useNavigate();

  // marketing display period
  const [period, setPeriod] = useState<Period>("monthly");

  // auth state
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  // plan state from profile
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setAuthLoading(true);

        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id ?? null;

        if (!mounted) return;

        setIsAuthed(!!userId);

        if (!userId) {
          setPlanTier("free");
          setCurrentPeriod(null);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("plan_tier, plan_period, stripe_price_id, is_premium")
          .eq("id", userId)
          .single();

        if (!mounted) return;

        if (error) {
          setPlanTier("free");
          setCurrentPeriod(null);
          return;
        }

        const p = profile as Profile;

        const tier: PlanTier =
          p.plan_tier === "premium" || p.is_premium === true ? "premium" : "free";

        setPlanTier(tier);
        setCurrentPeriod(tier === "premium" ? (p.plan_period ?? null) : null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const isPremium = planTier === "premium";

  const price = useMemo(
    () =>
      ({
        weekly: { free: "£0", premium: "£7.99", premium_sub: "/week", premium_note: "" },
        monthly: { free: "£0", premium: "£34.99", premium_sub: "/month", premium_note: "" },
        annual: { free: "£0", premium: "£329.99", premium_sub: "/year", premium_note: "Save ~22%" },
      } as const),
    []
  );

  const goToBilling = (nextPeriod: Period) => {
    // keep as you requested earlier: billing route handles upgrades/switches
    navigate(`/billing?plan=premium&period=${nextPeriod}`);
  };

  const isPremiumCurrentForDisplayedPeriod = () => {
    if (!isAuthed || authLoading) return false;
    if (!isPremium) return false;
    if (!currentPeriod) return false;
    return currentPeriod === period;
  };

  const getPremiumActionLabel = () => {
    // This implements your rules:
    // - Monthly → Annual: Upgrade (save more)
    // - Monthly → Weekly: Change to weekly (not downgrade)
    // - Annual → Monthly/Weekly: Change plan (and show “You’ll pay more per month/week”)
    // - Weekly → Monthly/Annual: Upgrade (save more) when moving longer
    if (!isPremium || !currentPeriod) return "Upgrade";

    const direction = compareCommitment(currentPeriod, period);

    if (direction === "same") return "Current plan";

    // monthly -> annual
    if (currentPeriod === "monthly" && period === "annual") return "Upgrade (save more)";

    // monthly -> weekly
    if (currentPeriod === "monthly" && period === "weekly") return "Change to weekly";

    // annual -> monthly/weekly
    if (currentPeriod === "annual" && (period === "monthly" || period === "weekly"))
      return "Change plan";

    // weekly -> monthly/annual OR monthly -> annual covered above
    if (direction === "longer") return "Upgrade (save more)";

    // everything else shorter (but we avoid “downgrade” wording)
    return "Change plan";
  };

  const getPremiumHelperText = () => {
    if (!isAuthed || authLoading) return null;

    if (!isPremium) return "Upgrade will take you to billing.";

    if (!currentPeriod) return "Manage your subscription from billing.";

    if (isPremiumCurrentForDisplayedPeriod()) {
      return `You’re on Premium (${formatPeriodLabel(currentPeriod)}).`;
    }

    const direction = compareCommitment(currentPeriod, period);

    // annual -> monthly/weekly: show “You’ll pay more per month/week”
    if (currentPeriod === "annual" && (period === "monthly" || period === "weekly")) {
      return `Change from yearly to ${formatPeriodLabel(period)}. You’ll pay more per ${period === "weekly" ? "week" : "month"}.`;
    }

    // monthly -> annual: reinforce savings
    if (currentPeriod === "monthly" && period === "annual") {
      return "Switching to yearly reduces the effective monthly cost.";
    }

    // monthly -> weekly: not downgrade, just change
    if (currentPeriod === "monthly" && period === "weekly") {
      return "Switch to weekly billing for shorter commitment.";
    }

    // generic
    if (direction === "longer") return `Upgrade from ${formatPeriodLabel(currentPeriod)} to ${formatPeriodLabel(period)} in billing.`;
    return `Change from ${formatPeriodLabel(currentPeriod)} to ${formatPeriodLabel(period)} in billing.`;
  };

  const handlePlanClick = (value: "free" | "premium") => {
    if (authLoading) return;

    if (!isAuthed) {
      navigate("/register");
      return;
    }

    if (value === "free") {
      navigate("/dashboard");
      return;
    }

    // premium clicked
    if (!isPremium) {
      goToBilling(period);
      return;
    }

    // premium user
    if (isPremiumCurrentForDisplayedPeriod()) {
      navigate("/dashboard");
      return;
    }

    goToBilling(period);
  };

  const getHeroButtons = () => {
    if (authLoading) {
      return (
        <div className="mt-8 flex items-center justify-center">
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
            Checking account…
          </div>
        </div>
      );
    }

    if (isAuthed) {
      return (
        <div className="mt-8 flex items-center justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold transition hover:bg-white"
          >
            Go to dashboard →
          </button>
        </div>
      );
    }

    return (
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          onClick={() => navigate("/register")}
          className="rounded-full bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700"
        >
          Get started →
        </button>
        <button
          onClick={() => navigate("/login")}
          className="rounded-full border border-slate-300 px-6 py-3 font-semibold transition hover:bg-white"
        >
          Sign in
        </button>
      </div>
    );
  };

  const getPlanButtonLabel = (value: "free" | "premium") => {
    if (authLoading) return "…";
    if (!isAuthed) return value === "premium" ? "Create account" : "Start free";

    if (value === "free") return isPremium ? "Free included" : "Current plan";

    // premium
    if (!isPremium) return "Upgrade";
    return getPremiumActionLabel();
  };

  const isPlanButtonDisabled = (value: "free" | "premium") => {
    if (authLoading) return true;
    if (!isAuthed) return false;

    // keep “free” non-clickable here (avoid downgrades from pricing page)
    if (value === "free") return true;

    // premium button disabled only when truly current
    if (value === "premium" && isPremiumCurrentForDisplayedPeriod()) return true;

    return false;
  };

  type PlanCard = {
    name: string;
    icon: React.ReactElement;
    border: string;
    button: string;
    text: string;
    tag: string | null;
    color: string;
    value: "free" | "premium";
    features: string[];
    price: string;
    priceSub: string;
    note?: string;
  };

  const plans: PlanCard[] = [
    {
      name: "Free Plan",
      icon: <FaUserShield className="mb-4 text-4xl text-indigo-500" />,
      border: "border-slate-200",
      button: "bg-slate-900 hover:bg-slate-950",
      text: "Access self-audit questions only.",
      tag: null,
      color: "text-indigo-500",
      value: "free",
      features: [
        "Self-audit questions",
        "Basic dashboard access",
        "No AI recommendations",
        "No certificate download",
      ],
      price: price[period].free,
      priceSub: "",
    },
    {
      name: "Premium",
      icon: <FaCrown className="mb-4 text-4xl text-purple-600" />,
      border: "border-2 border-purple-600",
      button: "bg-purple-600 hover:bg-purple-700",
      text:
        period === "annual"
          ? "Yearly access to all features & updates."
          : period === "weekly"
          ? "7-day access to all features & updates."
          : "30-day access to all features & updates.",
      tag: "Most Popular",
      color: "text-purple-600",
      value: "premium",
      features: [
        "Unlimited audits",
        "All AI recommendations",
        "Download certificates",
        "Full dashboard access",
        "Priority support",
      ],
      price: price[period].premium,
      priceSub: price[period].premium_sub || "",
      note: price[period].premium_note || "",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* HERO */}
      <header className="relative overflow-hidden px-4 pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-40 max-w-5xl rounded-full bg-gradient-to-b from-indigo-200/40 to-transparent blur-2xl"
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Pricing that scales with your DApp
          </h1>

          <p className="mt-3 text-slate-600">
            Start free. Upgrade anytime for instant AI-powered audit recommendations, certificates,
            and priority support.
          </p>

          <PeriodToggle period={period} setPeriod={setPeriod} />

          {getHeroButtons()}
        </motion.div>
      </header>

      {/* PLANS */}
      <main className="px-4 py-14">
        <motion.div
          variants={cardsStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2"
        >
          {plans.map((plan, index) => {
            const disabled = isPlanButtonDisabled(plan.value);

            return (
              <motion.div
                key={`${plan.name}-${index}`}
                variants={cardV}
                whileHover={{ y: -6, rotateX: 1.5, rotateY: -1.5 }}
                className={`relative flex transform flex-col items-center rounded-2xl border ${plan.border} bg-white p-8 text-center shadow-sm transition hover:shadow-lg`}
              >
                {plan.tag && plan.value === "premium" && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white shadow">
                    {plan.tag}
                  </span>
                )}

                {plan.icon}
                <h3 className="mb-1 text-2xl font-semibold">{plan.name}</h3>
                <p className="mb-4 text-slate-500">{plan.text}</p>

                <div className="mb-6">
                  <div className="flex items-end justify-center gap-1 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={`${plan.value}-${plan.price}-${period}`}
                        initial={{ y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -16, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-4xl font-extrabold text-slate-900"
                      >
                        {plan.price}
                      </motion.span>
                    </AnimatePresence>
                    {plan.priceSub && <span className="text-slate-500">{plan.priceSub}</span>}
                  </div>
                  {plan.note && <div className="mt-1 text-xs text-emerald-600">{plan.note}</div>}
                </div>

                <ul className="mb-6 w-full max-w-xs space-y-2 text-left text-sm text-slate-700">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircleIcon className={`mr-2 h-5 w-5 flex-shrink-0 ${plan.color}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handlePlanClick(plan.value)}
                  disabled={disabled}
                  className={[
                    plan.button,
                    "mt-auto w-full rounded-full px-6 py-2 font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-2",
                    disabled ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {getPlanButtonLabel(plan.value)}
                </button>

                {plan.value === "premium" && !authLoading ? (
                  <div className="mt-3 text-xs text-slate-500">{getPremiumHelperText()}</div>
                ) : null}

                {plan.value === "premium" && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-[1px] -z-10 rounded-2xl bg-gradient-to-tr from-purple-500/10 via-transparent to-indigo-500/10"
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto mt-16 max-w-6xl rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-12 text-center text-white"
        >
          <h3 className="mb-3 text-3xl font-bold">Ready to secure your DApp?</h3>
          <p className="mb-6 text-lg opacity-90">
            Get instant AI-powered audit recommendations and downloadable certificates. Start free,
            upgrade anytime from inside your dashboard.
          </p>

          <div className="flex items-center justify-center gap-3">
            {authLoading ? (
              <div className="rounded-full bg-white/10 px-6 py-3 font-semibold">Checking account…</div>
            ) : isAuthed ? (
              !isPremium ? (
                <button
                  onClick={() => goToBilling(period)}
                  className="rounded-full bg-white px-8 py-3 font-semibold text-purple-700 shadow transition hover:bg-slate-100"
                >
                  Upgrade to Premium →
                </button>
              ) : isPremiumCurrentForDisplayedPeriod() ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-full bg-white px-8 py-3 font-semibold text-purple-700 shadow transition hover:bg-slate-100"
                >
                  Go to dashboard →
                </button>
              ) : (
                <button
                  onClick={() => goToBilling(period)}
                  className="rounded-full bg-white px-8 py-3 font-semibold text-purple-700 shadow transition hover:bg-slate-100"
                >
                  {getPremiumActionLabel()} →
                </button>
              )
            ) : (
              <>
                <button
                  onClick={() => navigate("/register")}
                  className="rounded-full bg-white px-8 py-3 font-semibold text-purple-700 shadow transition hover:bg-slate-100"
                >
                  Get started →
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-full border border-white/70 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </motion.section>

        <div className="mx-auto mt-12 max-w-3xl text-center text-sm text-slate-500">
          Premium upgrades and plan changes are managed from your dashboard Billing page.
        </div>
      </main>
    </div>
  );
}

/* ----------------------------- Subcomponents ------------------------------ */

function PeriodToggle({
  period,
  setPeriod,
}: {
  period: Period;
  setPeriod: (p: Period) => void;
}) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next: Period =
        period === "weekly" ? "monthly" : period === "monthly" ? "annual" : "weekly";
      setPeriod(next);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Billing period"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="mx-auto mt-6 inline-flex rounded-full border border-slate-200 bg-white p-1"
    >
      <button
        role="tab"
        aria-selected={period === "weekly"}
        onClick={() => setPeriod("weekly")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          period === "weekly" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        Weekly
      </button>

      <button
        role="tab"
        aria-selected={period === "monthly"}
        onClick={() => setPeriod("monthly")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          period === "monthly" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        Monthly
      </button>

      <button
        role="tab"
        aria-selected={period === "annual"}
        onClick={() => setPeriod("annual")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          period === "annual" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        Yearly {period === "annual" && <span className="ml-1 text-xs opacity-80">— save ~22%</span>}
      </button>
    </div>
  );
}
