// src/components/RequirePremium.tsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type RequirePremiumProps = {
  children: JSX.Element;
};

type ProfileRow = {
  is_premium: boolean | null;
  premium_expires_at: string | null;
};

export function RequirePremium({ children }: RequirePremiumProps) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // Get user
        const { data: auth } = await supabase.auth.getUser();
        if (cancelled) return;

        const user = auth?.user;

        if (!user) {
          setNeedsAuth(true);
          setChecking(false);
          return;
        }

        // Get profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_premium, premium_expires_at")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("[RequirePremium] profile error:", error);
        }

        // PREMIUM CHECK
        let canAccess = false;

        if (profile?.is_premium === true) {
          canAccess = true;
        }

        if (profile?.premium_expires_at) {
          const expires = new Date(profile.premium_expires_at).getTime();
          const now = Date.now();
          if (expires > now) {
            canAccess = true;
          }
        }

        setAllowed(canAccess);
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

  return children;
}
