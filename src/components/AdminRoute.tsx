// src/components/AdminRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type Props = { children: React.ReactNode };

export default function AdminRoute({ children }: Props): React.ReactElement {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Make sure session is restored after hard refresh
        await supabase.auth.getSession();

        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;

        // Check both app_metadata and user_metadata
        const role =
          (user?.app_metadata as any)?.role ??
          (user?.user_metadata as any)?.role ??
          null;

        if (mounted) {
          setOk(role === "admin");
          setChecking(false);
        }
      } catch {
        if (mounted) {
          setOk(false);
          setChecking(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return <div className="p-6 text-slate-500">Checking access…</div>;
  }

  if (ok) return <>{children}</>;

  // Preserve the target so login can bounce back to where the user tried to go
  const next = encodeURIComponent(loc.pathname + loc.search);
  return <Navigate to={`/login?next=${next}`} replace />;
}
