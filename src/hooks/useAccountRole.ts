// src/hooks/useAccountRole.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AccountRole = "admin" | "editor" | "user";

export function useAccountRole() {
  const [accountRole, setAccountRole] = useState<AccountRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (active) {
            setAccountRole(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("account_role")
          .eq("id", user.id)
          .single();

        if (!active) return;

        if (error) {
          console.error("Failed to load account role:", error);
          setAccountRole("user");
          setLoading(false);
          return;
        }

        setAccountRole((data?.account_role as AccountRole | null) ?? "user");
        setLoading(false);
      } catch (err) {
        console.error("useAccountRole error:", err);
        if (active) {
          setAccountRole("user");
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  return { accountRole, loading };
}