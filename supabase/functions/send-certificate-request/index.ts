// send-certificate-request/index.ts
// Supabase Edge Runtime (Deno)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "";
const RESEND_TO = "info@auditdapps.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json().catch(() => ({}));

    const { project, repo, user_id, email, audit_id } = body;

    if (!project || !repo || !user_id) {
      return new Response(
        JSON.stringify({ ok: false, error: "missing_fields" }),
        { status: 400, headers: CORS }
      );
    }

    const text = `
Certificate Review Request

Project: ${project}
Repository: ${repo}

User ID: ${user_id}
User Email: ${email || "(none)"}
Audit ID: ${audit_id}

The user states they have fully implemented all recommendations.
`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [RESEND_TO],
        subject: `Certificate Request — ${project}`,
        text,
        reply_to: email || undefined,
      }),
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      return new Response(JSON.stringify({ ok: false, error: j }), {
        status: 500,
        headers: CORS,
      });
    }

    return new Response(JSON.stringify({ ok: true, id: j.id }), {
      headers: CORS,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: String(err),
      }),
      { status: 500, headers: CORS }
    );
  }
});
