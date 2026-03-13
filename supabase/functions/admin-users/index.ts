// supabase/functions/admin-users/index.ts
import { serve } from "@std/http/server";
import { createClient } from "@supabase/supabase-js";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

type JsonObject = Record<string, JsonValue>;

type Period = "weekly" | "monthly" | "annual";
type AccountRole = "user" | "editor" | "admin";

type AdminUsersBody =
  | {
      action?: unknown;
      targetUserId?: unknown;
      account_role?: unknown;
    }
  | {
      action?: unknown;
      targetUserId?: unknown;
      plan_period?: unknown;
      premium_expires_at?: unknown;
    }
  | {
      action?: unknown;
      targetUserId?: unknown;
    };

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function cors(origin: string | null): Record<string, string> {
  const raw =
    Deno.env.get("ALLOWED_ORIGINS") ??
    ["http://localhost:5173", "https://auditdapps.com", "https://www.auditdapps.com"].join(",");

  const allowed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const o = origin ?? "";
  const allow = allowed.includes(o) ? o : allowed[0] || "*";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(headers: Record<string, string>, status: number, payload: JsonObject) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
}

function normalizePeriod(value: unknown): Period | null {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();

  if (v === "weekly") return "weekly";
  if (v === "monthly") return "monthly";
  if (v === "annual" || v === "yearly") return "annual";

  return null;
}

function normalizeAccountRole(value: unknown): AccountRole | null {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();

  if (v === "user") return "user";
  if (v === "editor") return "editor";
  if (v === "admin") return "admin";

  return null;
}

function computeExpiry(period: Period, from = new Date()): string {
  const d = new Date(from);

  if (period === "weekly") d.setUTCDate(d.getUTCDate() + 7);
  if (period === "monthly") d.setUTCMonth(d.getUTCMonth() + 1);
  if (period === "annual") d.setUTCFullYear(d.getUTCFullYear() + 1);

  return d.toISOString();
}

async function assertCallerIsAdmin(
  authHeader: string | null
): Promise<
  | { ok: true; callerId: string }
  | { ok: false; status: number; error: string }
> {
  if (!authHeader) {
    return { ok: false, status: 401, error: "Missing authorization" };
  }

  const jwt = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!jwt) {
    return { ok: false, status: 401, error: "Missing token" };
  }

  const { data, error } = await admin.auth.getUser(jwt);

  if (error || !data?.user?.id) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const callerId = data.user.id;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, account_role, is_admin")
    .eq("id", callerId)
    .maybeSingle();

  if (profileError) {
    return { ok: false, status: 500, error: "Could not verify admin status" };
  }

  const isAdmin =
    profile?.account_role === "admin" || profile?.is_admin === true;

  if (!isAdmin) {
    return { ok: false, status: 403, error: "Admin access required" };
  }

  return { ok: true, callerId };
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = cors(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (req.method !== "POST") {
    return json(headers, 405, { error: "Method Not Allowed" });
  }

  const gate = await assertCallerIsAdmin(req.headers.get("authorization"));
  if (!gate.ok) {
    return json(headers, gate.status, { error: gate.error });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as AdminUsersBody;

    const action = typeof body.action === "string" ? body.action.trim() : "";
    const targetUserId =
      typeof body.targetUserId === "string" ? body.targetUserId.trim() : "";

    if (!action) {
      return json(headers, 400, { error: "Missing action" });
    }

    if (!targetUserId) {
      return json(headers, 400, { error: "Missing targetUserId" });
    }

    if (action === "delete_user" && targetUserId === gate.callerId) {
      return json(headers, 400, { error: "You cannot delete your own account." });
    }

    if (action === "set_account_role") {
      const nextRole = normalizeAccountRole((body as { account_role?: unknown }).account_role);

      if (!nextRole) {
        return json(headers, 400, {
          error: "Invalid account_role. Expected one of: user, editor, admin",
        });
      }

      if (targetUserId === gate.callerId && nextRole !== "admin") {
        return json(headers, 400, {
          error: "You cannot remove your own admin access.",
        });
      }

      const { data: updated, error } = await admin
        .from("profiles")
        .update({
          account_role: nextRole,
          is_admin: nextRole === "admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId)
        .select("id, email, account_role, is_admin, updated_at")
        .single();

      if (error) throw error;

      return json(headers, 200, {
        ok: true,
        user: updated as unknown as JsonValue,
      });
    }

    if (action === "grant_premium") {
      const period = normalizePeriod((body as { plan_period?: unknown }).plan_period) ?? "monthly";

      const rawExpiry = (body as { premium_expires_at?: unknown }).premium_expires_at;

      const expiresAt =
        typeof rawExpiry === "string" && rawExpiry.trim()
          ? rawExpiry.trim()
          : computeExpiry(period);

      const { data: updated, error } = await admin
        .from("profiles")
        .update({
          is_premium: true,
          plan_tier: "premium",
          plan_period: period,
          premium_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId)
        .select("id, is_premium, plan_tier, plan_period, premium_expires_at, updated_at")
        .single();

      if (error) throw error;

      return json(headers, 200, {
        ok: true,
        user: updated as unknown as JsonValue,
      });
    }

    if (action === "revoke_premium") {
      const { data: updated, error } = await admin
        .from("profiles")
        .update({
          is_premium: false,
          plan_tier: "free",
          plan_period: null,
          stripe_price_id: null,
          premium_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId)
        .select("id, is_premium, plan_tier, plan_period, premium_expires_at, updated_at")
        .single();

      if (error) throw error;

      return json(headers, 200, {
        ok: true,
        user: updated as unknown as JsonValue,
      });
    }

    if (action === "delete_user") {
      const { error } = await admin.auth.admin.deleteUser(targetUserId);

      if (error) throw error;

      return json(headers, 200, { ok: true });
    }

    return json(headers, 400, { error: "Unknown action" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin-users] error:", e);
    return json(headers, 500, { error: msg });
  }
});