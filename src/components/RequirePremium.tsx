// src/components/RequirePremium.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type RequirePremiumProps = {
  children: ReactNode;
};

type ProfileRow = {
  is_premium: boolean | null;
  premium_expires_at: string | null;
};

function isPremiumActive(profile: ProfileRow | null | undefined): boolean {
  if (!profile) return false;

  // ✅ Recommended: require BOTH flags
  // - is_premium true (Stripe says subscription is active/trialing)
  // - premium_expires_at in the future (time-based access)
  const premiumActive =
    profile.is_premium === true &&
    !!profile.premium_expires_at &&
    new Date(profile.premium_expires_at) > new Date();

  return premiumActive;
}

export function RequirePremium({ children }: RequirePremiumProps) {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setChecking(true);
        setNeedsAuth(false);
        setAllowed(false);

        // 1) Get user
        const { data: auth, error: authErr } = await supabase.auth.getUser();
        if (cancelled) return;

        if (authErr) {
          console.error("[RequirePremium] auth error:", authErr);
        }

        const user = auth?.user;

        if (!user) {
          setNeedsAuth(true);
          return;
        }

        // 2) Get profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_premium, premium_expires_at")
          .eq("id", user.id)
          .maybeSingle<ProfileRow>();

        if (cancelled) return;

        if (error) {
          console.error("[RequirePremium] profile error:", error);
          // fail closed (treat as not premium)
          setAllowed(false);
          return;
        }

        // 3) PREMIUM CHECK (strict, time-based)
        setAllowed(isPremiumActive(profile));
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search]);

  // Loading UI
  if (checking) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-sm text-muted-foreground">
        Checking your plan…
      </div>
    );
  }

  const next = encodeURIComponent(location.pathname + location.search);

  // Not logged in → login
  if (needsAuth) {
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // Not premium → payment
  if (!allowed) {
    return (
      <Navigate
        to={`/auth/payment?next=${next}&reason=premium_required`}
        replace
      />
    );
  }

  return <>{children}</>;
}
