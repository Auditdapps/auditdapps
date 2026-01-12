// src/components/RequireAdmin.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type Props = { children: ReactNode };

export default function RequireAdmin({ children }: Props) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;

        const user = data.user;
        if (!user) {
          setNeedsAuth(true);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("[RequireAdmin] profile error:", error);
          setAllowed(false);
          return;
        }

        setAllowed(profile?.is_admin === true);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search]);

  if (checking) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-sm text-muted-foreground">
        Checking admin access…
      </div>
    );
  }

  const next = encodeURIComponent(location.pathname + location.search);

  if (needsAuth) return <Navigate to={`/login?next=${next}`} replace />;
  if (!allowed) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
