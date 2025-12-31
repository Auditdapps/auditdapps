// src/utils/riskAnalytics.ts
import {
  parseFindings,
  computeRiskTotals,
  posturePercent,
  type RiskTotals,
  type ParsedFinding,
} from "@/utils/riskUtils";

export type BuiltAnalytics = {
  score: number;               // posture 0–100 (higher = better)
  overallPct: number;          // remaining risk % (lower = better)
  counts: { critical: number; high: number; medium: number; low: number };
  analytics: any;              // ready for audits.analytics jsonb
  findings: ParsedFinding[];   // parsed bullets (for recs, etc.)
  totals: RiskTotals;          // full totals if needed
};

export function buildAnalyticsFromMarkdown(markdown: string, extras?: Record<string, any>): BuiltAnalytics {
  const findings = parseFindings(markdown);
  const totals = computeRiskTotals(findings);

  const score = posturePercent(totals);      // higher is better
  const overallPct = totals.overallPct;      // lower is better

  const counts = {
    critical: totals.countsBySeverity.critical ?? 0,
    high: totals.countsBySeverity.high ?? 0,
    medium: totals.countsBySeverity.medium ?? 0,
    low: totals.countsBySeverity.low ?? 0,
  };

  const analytics = {
    risk_score: score,
    overallPct,
    by_severity: {
      critical: counts.critical,
      high: counts.high,
      medium: counts.medium,
      low: counts.low,
    },
    mitigation: totals.bySevMitCounts,
    bySevLike: totals.bySevLike,
    totals: { adjusted: totals.totalAdjusted, max: totals.totalMax },
    summary_md: markdown, // store full markdown for the detail page
    ...extras,
  };

  return { score, overallPct, counts, analytics, findings, totals };
}

/** Clean a recommendation title (drop emoji + trailing tags) */
export function cleanTitle(s: string): string {
  const str = String(s ?? "");
  const withoutTags = str.replace(/\s*\[\s*likelihood\s*:[^\]]+\]\s*\[\s*mitigation\s*:[^\]]+\]\s*$/i, "").trim();
  return withoutTags.replace(/^[\p{Extended_Pictographic}\s]+/u, "").trim();
}

/** Deterministic analytics: score purely from baseline findings; LLM narrative is separate. */
export function buildAnalyticsDeterministic(
  baselineFindings: ParsedFinding[],
  markdownFromLLM: string,
  extras: Record<string, any> = {}
): BuiltAnalytics {
  const aiFindings = parseFindings(markdownFromLLM || "");
  const totals = computeRiskTotals(baselineFindings);
  const score = posturePercent(totals);
  const overallPct = totals.overallPct;

  const counts = {
    critical: totals.countsBySeverity.critical,
    high: totals.countsBySeverity.high,
    medium: totals.countsBySeverity.medium,
    low: totals.countsBySeverity.low,
  };

  const analytics = {
    chart: {
      donut: {
        labels: ["Critical", "High", "Medium", "Low"],
        values: [
          counts.critical || 0,
          counts.high || 0,
          counts.medium || 0,
          counts.low || 0,
        ],
        center: score,
      },
      bySeverityAdjusted: totals.bySeverityAdjusted,
      bySevLike: totals.bySevLike,
      bySevMitCounts: totals.bySevMitCounts,
    },
    counts,
    totals: { adjusted: totals.totalAdjusted, max: totals.totalMax },
    summary_md: markdownFromLLM,
    ai_findings_count: aiFindings.length,
    ...extras,
  };

  const findings = baselineFindings;
  return { score, overallPct, counts, analytics, findings, totals };
}
