// src/utils/ensureProfileExists.ts
// (Adjust the import path if your client is at ../lib/supabaseClient)
import { supabase } from "../lib/supabaseClient";

type ProfileRow = { id: string };

/**
 * Ensures there's a row in `profiles` for the given user id.
 * - If the row exists: do nothing.
 * - If it's missing: inserts `{ id: userId }`.
 */
export async function ensureProfileExists(userId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    // If we got an error that is NOT "no rows", surface it.
    // Supabase returns code "PGRST116" for no rows when using .single()
    if (error && (error as any).code !== "PGRST116") {
      console.error("❌ Failed to check profile row:", error.message);
      return;
    }

    const row = (data as ProfileRow | null) ?? null;

    if (!row) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId });

      if (insertError) {
        console.error("❌ Failed to create profile row:", insertError.message);
      } else {
        console.log("✅ Profile row created for user:", userId);
      }
    }
  } catch (e: any) {
    console.error("❌ Unexpected error ensuring profile:", e?.message || e);
  }
}
