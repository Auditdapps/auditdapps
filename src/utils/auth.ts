// src/utils/auth.ts
import type { User } from "@supabase/supabase-js";

export function getRole(user?: User | null): "admin" | "user" | null {
  return (
    ((user?.app_metadata as any)?.role ??
      (user?.user_metadata as any)?.role ??
      null) as "admin" | "user" | null
  );
}
