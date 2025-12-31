// src/hooks/useUser.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User, AuthError, Session } from "@supabase/supabase-js";

type UseUserReturn = {
  loading: boolean;
  user: User | null;
  error: AuthError | Error | null;
  /** Derived from app_metadata.role or user_metadata.role */
  role: string | null;
  /** Convenience flag for admin UX/guards */
  isAdmin: boolean;
  /** Current session in case you need access token, etc. */
  session: Session | null;
};

/** Safely read role from both app_metadata and user_metadata */
function getRole(u: User | null | undefined): string | null {
  if (!u) return null;
  const am = (u.app_metadata as any) ?? {};
  const um = (u.user_metadata as any) ?? {};
  return (am.role as string) || (um.role as string) || null;
}

/**
 * useUser()
 * - loading: true while we check the current session or wait for auth events
 * - user: Supabase user object (or null)
 * - error: optional error if the check failed
 * - role/isAdmin: derived from user meta
 * - session: current session (or null)
 */
export function useUser(): UseUserReturn {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<AuthError | Error | null>(null);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;

        if (error) {
          setError(error);
          setUser(null);
          setSession(null);
          setRole(null);
        } else {
          const sess = data?.session ?? null;
          const u = sess?.user ?? null;
          setSession(sess);
          setUser(u);
          setRole(getRole(u));
        }
      } catch (e) {
        if (!active) return;
        setError(e as Error);
        setUser(null);
        setSession(null);
        setRole(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    init();

    // Keep hook in sync with login/logout/token refresh
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!active) return;
      setSession(sess);
      const u = sess?.user ?? null;
      setUser(u);
      setRole(getRole(u));
      setLoading(false);
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return { loading, user, error, role, isAdmin: role === "admin", session };
}
