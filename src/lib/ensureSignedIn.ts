// src/lib/ensureSignedIn.ts
import { supabase } from "@/lib/supabaseClient";

export async function ensureSignedIn(next: string): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  if (data?.user) return true;

  // push to login with ?next=...
  const url = new URL(window.location.href);
  const base = `${url.origin}/login?next=${encodeURIComponent(next)}`;
  window.location.assign(base);
  return false;
}
