// src/pages/AuthCallback.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, type Location } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { getRole } from "../utils/auth";

/** Params we expect from Supabase redirect */
type AuthParams = {
  access_token: string;
  refresh_token: string;
  type: string;
  next: string;
};

/**
 * Extract tokens from either ?query or #hash styles:
 * - access_token
 * - refresh_token
 * - type (signup, recovery, magiclink, email_change, etc.)
 * - next (optional: where to redirect after setting session)
 */
function extractParams(loc: Location): AuthParams {
  const all = new URLSearchParams(loc.search);
  // Also support legacy hash format: #access_token=...&refresh_token=...
  if (!all.get("access_token") && loc.hash) {
    const h = new URLSearchParams(loc.hash.replace(/^#/, ""));
    for (const [k, v] of h.entries()) all.set(k, v);
  }
  return {
    access_token: all.get("access_token") ?? "",
    refresh_token: all.get("refresh_token") ?? "",
    type: all.get("type") ?? "",
    next: all.get("next") ?? "",
  };
}

export default function AuthCallback(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<string>("Finishing sign-in…");

  useEffect(() => {
    (async () => {
      try {
        const { access_token, refresh_token, type, next } = extractParams(location);

        // Helper to decide where to go
        const goByRole = async (explicitNext?: string) => {
          const { data: u } = await supabase.auth.getUser();
          const role = getRole(u?.user);
          const dest = explicitNext || (role === "admin" ? "/admin" : "/dashboard");
          navigate(dest, { replace: true });
        };

        if (!access_token || !refresh_token) {
          // Some providers (or email confirm) will give you a session automatically.
          // Try to see if we already have one:
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            toast.success("You're signed in!");
            await goByRole(next || undefined);
            return;
          }
          toast.error("Missing auth tokens. Please login.");
          navigate("/login", { replace: true });
          return;
        }

        setStatus("Restoring session…");
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) throw error;

        // Optional messaging by type
        if (type === "signup") {
          toast.success("✅ Email confirmed. You're logged in!");
        } else {
          toast.success("Signed in!");
        }

        await goByRole(next || undefined);
      } catch (err) {
        console.error(err);
        toast.error("Could not complete sign-in. Please login.");
        navigate("/login", { replace: true });
      }
    })();
  }, [location, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white shadow rounded-xl px-6 py-8 text-center">
        <p className="text-gray-700">{status}</p>
      </div>
    </div>
  );
}
