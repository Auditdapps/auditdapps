// src/utils/openai.ts
import { supabase } from "@/lib/supabaseClient";
import { validateAndFixAuditMarkdown } from "../lib/riskTextValidator";

type ValidationResult = {
  output: string;
  warnings: string[];
};

/**
 * Get audit recommendations via Supabase Edge Function.
 * The actual OpenAI call + style guide live in `generate-recommendations`.
 */
export async function getRecommendations(prompt: string): Promise<string> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new Error("Prompt is empty.");
  }

  // Call Supabase Edge Function instead of OpenAI directly
  const { data, error } = await supabase.functions.invoke(
    "generate-recommendations",
    {
      body: { prompt: trimmed },
    }
  );

  if (error) {
    console.error("[getRecommendations] function error:", error);
    throw new Error("Failed to generate recommendations. Please try again.");
  }

  // Support a couple of possible shapes from the function
  const raw =
    (data as any)?.recommendations?.trim?.() ??
    (data as any)?.output?.trim?.() ??
    "";

  // Validate & auto-fix before returning/saving
  const { output, warnings } =
    (validateAndFixAuditMarkdown(raw) as ValidationResult) ?? {
      output: raw,
      warnings: [],
    };

  if (warnings?.length) {
    console.warn("Audit recommendations validation warnings:", warnings);
    try {
      localStorage.setItem(
        "audit_validation_warnings",
        JSON.stringify(warnings)
      );
    } catch {
      // ignore storage errors
    }
  }

  return output;
}
