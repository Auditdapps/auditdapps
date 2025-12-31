// supabase/functions/send-contact-message/index.ts
// Runs on Deno (Supabase Edge Runtime)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") || ""; // e.g. "AuditDapps <no-reply@auditdapps.com>"
const RESEND_TO =
  Deno.env.get("RESEND_TO") || "info@auditdapps.com";   // default to info@auditdapps.com

// CORS headers so the browser can call this function
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    console.log("📨 Contact form body:", body);

    const name = String(body.name || "");
    const email = String(body.email || "");
    const phone = String(body.phone || "");
    const subject = String(body.subject || "New contact form message");
    const message = String(body.message || "");

    if (!RESEND_API_KEY || !RESEND_FROM || !RESEND_TO) {
      console.error(
        "❌ Missing one of RESEND_API_KEY / RESEND_FROM / RESEND_TO"
      );
      return new Response(
        JSON.stringify({ ok: false, error: "missing_env" }),
        { status: 500, headers: CORS }
      );
    }

    if (!email || !message || !name) {
      return new Response(
        JSON.stringify({ ok: false, error: "missing_fields" }),
        { status: 400, headers: CORS }
      );
    }

    const text = [
      "New contact form message from auditdapps.com",
      "",
      `Name:   ${name}`,
      `Email:  ${email}`,
      `Phone:  ${phone || "(not provided)"}`,
      "",
      `Subject: ${subject}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [RESEND_TO],
        subject: `Contact form: ${subject}`,
        text,
        reply_to: email || undefined,
      }),
    });

    const json = await resendRes.json().catch(() => ({}));
    console.log("📤 Resend response:", resendRes.status, json);

    if (!resendRes.ok) {
      return new Response(
        JSON.stringify({ ok: false, status: resendRes.status, error: json }),
        { status: 500, headers: CORS }
      );
    }

    return new Response(JSON.stringify({ ok: true, id: json.id }), {
      headers: CORS,
    });
  } catch (err) {
    console.error("💥 send-contact-message error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        message: String((err as any)?.message || err),
      }),
      { status: 500, headers: CORS }
    );
  }
});
