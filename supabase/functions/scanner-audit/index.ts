// supabase/functions/scanner-audit/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: cors });
  }

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
      { status: 500, headers: cors }
    );
  }

  const { prompt } = await req.json().catch(() => ({}));

  if (!prompt) {
    return new Response(
      JSON.stringify({ error: "Missing prompt" }),
      { status: 400, headers: cors }
    );
  }

  const system = `
You are a senior smart contract auditor.
Always return STRICT JSON:
{
  "summary_md": "...",
  "score": 0-100,
  "findings": [...]
}
NO markdown. NO fences. NO headings.
`.trim();

  const openaiRes = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.0,
        max_tokens: 3000,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    }
  );

  if (!openaiRes.ok) {
    const text = await openaiRes.text();
    console.error("[scanner-audit] OpenAI error:", openaiRes.status, text);

    return new Response(
      JSON.stringify({ error: "OpenAI failed" }),
      { status: 500, headers: cors }
    );
  }

  const data = await openaiRes.json();
  const content = data?.choices?.[0]?.message?.content?.trim() || "";

  return new Response(
    JSON.stringify({ json: content }),
    { status: 200, headers: cors }
  );
});
