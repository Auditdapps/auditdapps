// src/lib/supabaseClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase"; // your generated DB types

// Read envs compiled by Vite (must be prefixed with VITE_)
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    "❌ Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env, then restart the dev server."
  );
}

// Create a typed Supabase client (single source of truth)
export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// --- TEMP DEBUG (safe to remove later) ------------------------------
// @ts-ignore
window.supabase = supabase;
// @ts-ignore
window.__SUPA_ENV__ = { url: SUPABASE_URL, anonFirst8: SUPABASE_ANON.slice(0, 8) };
// -------------------------------------------------------------------

// Optional re-exports for cleaner downstream imports
export type DB = Database;
export type Public = Database["public"];
export type Tables = Public["Tables"];
