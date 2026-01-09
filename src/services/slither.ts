// src/services/slither.ts
import type { StaticFinding } from "@/types/staticFinding";

type SlitherAnalyzeResponse = {
  tool: "slither";
  count: number;
  findings: StaticFinding[];
};

export async function runSlitherAnalysis(args: {
  source_code: string;
  filename?: string;
}): Promise<StaticFinding[]> {
  const res = await fetch("http://127.0.0.1:8001/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_code: args.source_code,
      filename: args.filename ?? "Contract.sol",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Slither API error (${res.status}): ${text || "Unknown error"}`);
  }

  const data = (await res.json()) as Partial<SlitherAnalyzeResponse>;

  // ✅ clean + safe return (no frontend parsing)
  return Array.isArray(data.findings) ? data.findings : [];
}
