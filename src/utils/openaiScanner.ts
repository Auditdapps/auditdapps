// src/utils/openaiScanner.ts
import { supabase } from "@/lib/supabaseClient";

type AIAnalysis =
  | string
  | {
      score?: number;
      summary_md?: string;
      findings?: unknown[];
      [k: string]: unknown;
    };

export async function getScannerAnalysis(prompt: string): Promise<string> {
  const p = (prompt ?? "").trim();
  if (!p) throw new Error("Prompt is empty.");

  const { data, error } = await supabase.functions.invoke("scanner-analyze", {
    body: { prompt: p },
  });

  if (error) {
    console.error("[getScannerAnalysis] invoke error:", error);
    throw new Error(
      error.message || "Failed to run scanner. Please try again."
    );
  }

  // If the Edge Function returns { error: "..." } but status 200,
  // surface it instead of pretending we have analysis.
  if (data && typeof data === "object" && "error" in (data as any)) {
    const msg = String((data as any).error || "Scanner error");
    console.error("[getScannerAnalysis] function returned error payload:", data);
    throw new Error(msg);
  }

  // Support these common shapes:
  // 1) { analysis: "JSON_STRING" }
  // 2) { analysis: { score, summary_md, findings } }  (already parsed)
  // 3) { score, summary_md, findings } (direct)
  // 4) "JSON_STRING" (rare)
  const raw =
    (data as any)?.analysis ??
    (data as any)?.json ??
    (data as any)?.content ??
    data;

  if (!raw) {
    console.error("[getScannerAnalysis] empty raw payload:", data);
    throw new Error("Scanner returned an empty response.");
  }

  // If it's already an object, stringify it so scannerPrompt.ts can JSON.parse it.
  if (typeof raw === "object") {
    return JSON.stringify(raw);
  }

  const text = String(raw).trim();
  if (!text) {
    console.error("[getScannerAnalysis] raw string was empty:", data);
    throw new Error("Scanner returned an empty response.");
  }

  return text;
}
