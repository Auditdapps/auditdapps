// supabase/functions/generate-recommendations/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Style guide lives ONLY here (server-side)
const STYLE_GUIDE = `
You are a senior smart contract security auditor.
Your job is to generate a concise, professional **markdown** report.

### Output structure (use exactly this order and headings)

# 🧾 Audit Summary
- 2–4 sentences summarising the overall security posture and key themes.

## 🛑 Critical
- <issue> [likelihood: very likely|likely|possible|unlikely|rare] [mitigation: none|partial|full]

## 🚨 High
- <issue> [likelihood: very likely|likely|possible|unlikely|rare] [mitigation: none|partial|full]

## ⚠️ Medium
- <issue> [likelihood: very likely|likely|possible|unlikely|rare] [mitigation: none|partial|full]

## 🟡 Low
- <issue> [likelihood: very likely|likely|possible|unlikely|rare] [mitigation: none|partial|full]

## ✅ Tailored Actionable Recommendations
- <action item, one short line>
- Focus on practical next steps for the specific DApp and codebase.
- Avoid long paragraphs; keep each bullet very focused.

### Style rules

- Use **markdown**, but no HTML tags.
- Be concrete and specific, not generic.
- Do NOT invent details that are not implied by the prompt.
- Group similar issues together when possible.
- Never mention this style guide or that you are an AI model.
`.trim();

serve(async (req) => {
  // --- CORS preflight ---
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
      },
    });
  }

  // --- Auth / env sanity checks ---
  if (!OPENAI_API_KEY) {
    console.error("[generate-recommendations] Missing OPENAI_API_KEY secret");
    return new Response(
      JSON.stringify({ error: "Server is not configured with OpenAI key." }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const prompt = (body?.prompt ?? "").toString().trim();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing 'prompt' in request body." }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // --- Call OpenAI securely from server side ---
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o", // or whatever model you're using
          temperature: 0.0,
          top_p: 1,
          presence_penalty: 0,
          frequency_penalty: 0,
          max_tokens: 900,
          messages: [
            { role: "system", content: STYLE_GUIDE },
            { role: "user", content: prompt },
          ],
        }),
      },
    );

    if (!openaiRes.ok) {
      const text = await openaiRes.text().catch(() => "");
      console.error(
        "[generate-recommendations] OpenAI error:",
        openaiRes.status,
        text,
      );
      return new Response(
        JSON.stringify({
          error: "OpenAI request failed",
          status: openaiRes.status,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const data = await openaiRes.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const recommendations =
      data?.choices?.[0]?.message?.content?.trim() ?? "";

    return new Response(
      JSON.stringify({ recommendations }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("[generate-recommendations] Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error: "Unexpected error generating recommendations",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
