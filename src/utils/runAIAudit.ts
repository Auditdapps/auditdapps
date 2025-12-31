// src/utils/runAIAudit.ts
import { formatAuditResponses } from "./formatPrompt";
import { getRecommendations } from "./openai";
import {
  parseFindings,
  computeRiskTotals,
  normalizeMitigation,
  normalizeSeverity,
} from "./riskUtils";

export type AllowedSeverity = "Critical" | "High" | "Medium" | "Low";
export type RecStatus = "open" | "partial" | "implemented";

export type AIAuditResult = {
  summaryMd: string;
  counts: { critical: number; high: number; medium: number; low: number };
  score: number;
  recs: Array<{
    title: string;
    severity: AllowedSeverity;
    status: RecStatus;
    rationale?: string | null;
    meta?: Record<string, unknown>;
  }>;
  analytics: {
    risk_score: number;
    summary: string;
    summary_md: string;
    totals: { recommendations: number };
    by_severity: { critical: number; high: number; medium: number; low: number };
    mitigation: Record<AllowedSeverity, { none: number; partial: number; full: number }>;
  };
};

/** Map mitigation tag → status for DB/UI */
function statusFromMitigation(mit: "none" | "partial" | "full"): RecStatus {
  return mit === "full" ? "implemented" : mit === "partial" ? "partial" : "open";
}

/** Penalty formula used by your dashboard */
function penaltyScore(counts: { critical: number; high: number; medium: number; low: number }): number {
  const { critical, high, medium, low } = counts;
  const risk = Math.max(0, 100 - 40 * critical - 20 * high - 10 * medium - 5 * low);
  return Math.round(risk);
}

export async function runAIAudit(args: {
  userType: "developer" | "organization";
  responses: Record<string, string[]>;
  othersInput: Record<string, string>;
  // Optional: pass the ordered list of questions to keep deterministic prompt order
  questionsInOrder?: Array<{ question: string }>;
}): Promise<AIAuditResult> {
  // 1) Build prompt from answers
  const prompt = formatAuditResponses(
    args.responses,
    args.othersInput,
    args.userType,
    args.questionsInOrder ?? []
  );

  // 2) Ask OpenAI for markdown (Summary + per-severity bullets + Tailored recs)
  const md = await getRecommendations(prompt); // already validated/fixed by your validator

  // 3) Parse the *per-severity* bullets (these contain Likelihood/Mitigation tags)
  const findings = parseFindings(md);
  // If the model didn’t emit bullets, findings may be empty.

  // 4) Compute totals (from parsed findings)
  const totals = computeRiskTotals(findings);

  // Derive counts (drop "info")
  const counts = {
    critical: totals.countsBySeverity.critical || 0,
    high: totals.countsBySeverity.high || 0,
    medium: totals.countsBySeverity.medium || 0,
    low: totals.countsBySeverity.low || 0,
  };

  // 5) Compute ONE score used across app (penalty formula to match Dashboard/AuditDetail)
  const score = penaltyScore(counts);

  // 6) Convert each bullet into a recommendation row (severity section ⇒ severity; mitigation ⇒ status)
  const recs = findings
    .filter((f) => f.severity !== "info")
    .map((f) => {
      // severity to Title Case
      const sevNorm = normalizeSeverity(f.severity) ?? "low";
      const sevTitle: AllowedSeverity =
        sevNorm === "critical" ? "Critical" :
        sevNorm === "high"     ? "High"     :
        sevNorm === "medium"   ? "Medium"   : "Low";

      const mit = normalizeMitigation(f.mitigation);
      return {
        title: f.text,                    // bullet text without tags
        severity: sevTitle,               // Critical|High|Medium|Low
        status: statusFromMitigation(mit),
        rationale: null,
        meta: { source: "ai_md", likelihood: f.likelihood },
      };
    });

  // 7) Build mitigation matrix for Analytics
  const init = () => ({ none: 0, partial: 0, full: 0 });
  const mitigation: AIAuditResult["analytics"]["mitigation"] = {
    Critical: init(),
    High: init(),
    Medium: init(),
    Low: init(),
  };
  for (const r of recs) {
    const key = r.status === "implemented" ? "full" : r.status === "partial" ? "partial" : "none";
    mitigation[r.severity][key as "none" | "partial" | "full"]++;
  }

  // 8) Build analytics payload (summary is short; summary_md is the full markdown we got back)
  const analytics: AIAuditResult["analytics"] = {
    risk_score: score,
    summary: `Found ${recs.length} recommendation${recs.length === 1 ? "" : "s"} `
      + `(${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low). `
      + `Overall risk score: ${score}%.`,
    summary_md: md,
    totals: { recommendations: recs.length },
    by_severity: counts,
    mitigation,
  };

  return {
    summaryMd: md,
    counts,
    score,
    recs,
    analytics,
  };
}
