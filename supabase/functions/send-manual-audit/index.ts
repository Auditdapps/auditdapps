// send-manual-audit/index.ts
// Runs on Deno (Supabase Edge Runtime)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") || ""; // e.g. "AuditDapps Notifications <no-reply@auditdapps.com>"
const RESEND_TO = Deno.env.get("RESEND_TO") || "";     // e.g. "info@auditdapps.com"

// CORS headers so the browser can call this function
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    console.log("🔔 Incoming body:", body);

    const project = String(body.project || "");
    const contact = String(body.contact || "");
    const notes   = String(body.notes   || "");
    const user_id = String(body.user_id || "");
    const email   = body.email ? String(body.email) : "";

    if (!RESEND_API_KEY || !RESEND_FROM || !RESEND_TO) {
      console.error("❌ Missing one of RESEND_API_KEY / RESEND_FROM / RESEND_TO");
      return new Response(JSON.stringify({ ok: false, error: "missing_env" }), { status: 500, headers: CORS });
    }

    // Build a simple text email
    const text = [
      "New manual audit request",
      "",
      `Project: ${project}`,
      `Contact: ${contact}`,
      "",
      "Notes:",
      notes || "(none)",
      "",
      `User ID: ${user_id}`,
      email ? `User Email: ${email}` : "",
    ].join("\n");

    // Send via Resend
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,           // MUST be on your verified domain
        to: [RESEND_TO],             // Where you want to receive (info@…)
        subject: "Manual Audit Request",
        text,
        reply_to: email || contact || undefined,  // helpful for quick reply
      }),
    });

    const j = await r.json().catch(() => ({}));
    console.log("📤 Resend response:", r.status, j);

    if (!r.ok) {
      return new Response(JSON.stringify({ ok: false, status: r.status, error: j }), {
        status: 500,
        headers: CORS,
      });
    }

    return new Response(JSON.stringify({ ok: true, id: j.id }), { headers: CORS });
  } catch (err) {
    console.error("💥 Function error:", err?.message || err);
    return new Response(JSON.stringify({ ok: false, message: String(err?.message || err) }), {
      status: 500,
      headers: CORS,
    });
  }
});
