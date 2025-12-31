// src/utils/openaiScanner.ts
import { supabase } from "@/lib/supabaseClient";

export async function getScannerAnalysis(prompt: string): Promise<string> {
  if (!prompt.trim()) {
    throw new Error("Prompt is empty.");
  }

  const { data, error } = await supabase.functions.invoke("scanner-analyze", {
    body: { prompt },
  });

  if (error) {
    console.error("[getScannerAnalysis] function error:", error);
    throw new Error("Failed to run scanner. Please try again.");
  }

  const raw =
    (data as any)?.analysis ??
    (data as any)?.json ??
    (data as any)?.content ??
    (typeof data === "string" ? data : "");

  const text = String(raw || "").trim();

  if (!text) {
    throw new Error("Scanner returned an empty response.");
  }

  return text;
}
