import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { PlanKey } from "@/lib/plans";

export type Profile = {
  id: string;
  email: string | null;
  plan: PlanKey;
  subscription_status: string | null;
  stripe_customer_id: string | null;
};

export function useSessionProfile() {
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      if (!uid) {
        setSessionUserId(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setSessionUserId(uid);
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (mounted) {
        setProfile(data as any);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { loading, sessionUserId, profile };
}
