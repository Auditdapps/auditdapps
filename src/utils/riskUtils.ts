// src/utils/riskUtils.ts

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Likelihood = "very likely" | "likely" | "possible" | "unlikely" | "rare";
export type Mitigation = "none" | "partial" | "full";

export const SEVERITY_SCORE: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

export const LIKELIHOOD_SCORE: Record<Likelihood, number> = {
  "very likely": 5,
  likely: 4,
  possible: 3,
  unlikely: 2,
  rare: 1,
};

export const MITIGATION_FACTOR: Record<Mitigation, number> = {
  none: 1.0,
  partial: 0.5,
  full: 0.0, // Full mitigation = zero remaining risk
};

// ---------------- Types ----------------

export interface Finding {
  severity: Severity;
  likelihood: Likelihood;
  mitigation: Mitigation;
  text: string;
}

export interface ParsedFinding {
  severity: string;
  likelihood: string;
  mitigation: string;
  text: string;
}

export interface RiskTableRow {
  id: number;
  finding: string;
  severityLabel: string;
  sevScore: number;
  likelihoodLabel: string;
  likeScore: number;
  mitigationLabel: string;
  mitFactor: number;
  formula: string;
  status: "Unmitigated" | "In Progress" | "Resolved";
}

export interface LikeCell {
  adjusted: number;
  max: number;
  count: number;
}

export interface RiskTotals {
  totalAdjusted: number; // sum of sevScore * likeScore * mitFactor
  totalMax: number;      // sum of sevScore * 5 * 1.0
  overallPct: number;    // adjusted / max * 100  (lower is better)
  bySeverityAdjusted: Record<Severity, number>;
  countsBySeverity: Record<Severity, number>;
  bySevMitCounts: Record<Exclude<Severity, "info">, Record<Mitigation, number>>;
  bySevLike: Record<Exclude<Severity, "info">, Record<Likelihood, LikeCell>>;
  tableRows: RiskTableRow[];
}

// ---------------- Parsing ----------------

/**
 * Parses markdown to extract risk findings with severity, likelihood, and mitigation.
 */
export function parseFindings(md: string): ParsedFinding[] {
  if (!md) return [];
  const findings: ParsedFinding[] = [];
  const lines = md.split("\n");

  const isHeading = (s: string) => /^#{1,6}\s*/.test(s);
  const sevFromHeading = (s: string): Severity | null => {
    const t = s.toLowerCase();
    if (/critical|catastrophic|🛑/.test(t)) return "critical";
    if (/\bhigh\b|🔴/.test(t)) return "high";
    if (/\bmedium\b|🟠/.test(t)) return "medium";
    if (/\blow\b|🟡/.test(t)) return "low";
    if (/info|informational|ℹ️/.test(t)) return "info";
    return null;
  };

  // '-' at start; no unnecessary escapes
  const isBullet = (s: string) => /^[-*\u2022]\s+/.test(s) || /^\d+\.\s+/.test(s);

  let currentSev: Severity | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (isHeading(line)) {
      currentSev = sevFromHeading(line);
      continue;
    }

    if (currentSev && isBullet(line)) {
      const { likelihood, mitigation } = extractTags(line);
      findings.push({
        severity: currentSev,
        likelihood: (likelihood as Likelihood) || "possible",
        mitigation: (mitigation as Mitigation) || "none",
        text: sanitizeBullet(line),
      });
    }
  }
  return findings;
}

function extractTags(line: string): { likelihood: string | null; mitigation: string | null } {
  const lower = line.toLowerCase();
  const likeMatch = lower.match(/\[\s*likelihood\s*:\s*(very likely|likely|possible|unlikely|rare)\s*\]/i);
  const mitMatch = lower.match(/\[\s*mitigation\s*:\s*(fully mitigated|full|partially mitigated|partial|none|no mitigation)\s*\]/i);
  const likelihood = likeMatch?.[1] || null;
  let mitigation: Mitigation | null = null;
  if (mitMatch) {
    mitigation = /full/.test(mitMatch[1]) ? "full" : /partial/.test(mitMatch[1]) ? "partial" : "none";
  }
  return { likelihood, mitigation };
}

function sanitizeBullet(line: string): string {
  return (
    line
      .replace(/^([-*\u2022]|\d+\.)\s+/, "")
      .replace(/\s*\[\s*likelihood\s*:\s*[^\]]+?\]\s*/gi, " ")
      .replace(/\s*\[\s*mitigation\s*:\s*[^\]]+?\]\s*/gi, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

// ---------------- Risk Totals ----------------

export function computeRiskTotals(findings: ParsedFinding[]): RiskTotals {
  let totalAdjusted = 0;
  let totalMax = 0;

  const bySeverityAdjusted: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  const countsBySeverity: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  const bySevMitCounts: Record<Exclude<Severity, "info">, Record<Mitigation, number>> = {
    critical: { none: 0, partial: 0, full: 0 },
    high: { none: 0, partial: 0, full: 0 },
    medium: { none: 0, partial: 0, full: 0 },
    low: { none: 0, partial: 0, full: 0 },
  };
  const bySevLike: Record<Exclude<Severity, "info">, Record<Likelihood, LikeCell>> = {
    critical: initLikeCells(),
    high: initLikeCells(),
    medium: initLikeCells(),
    low: initLikeCells(),
  };

  const tableRows: RiskTableRow[] = [];
  let id = 1;

  for (const f of findings) {
    const sevKey = normalizeSeverity(f.severity);
    if (!sevKey) continue;

    const sevScore = SEVERITY_SCORE[sevKey] ?? 0;
    const likeKey = normalizeLikelihood(f.likelihood);
    const likeScore = LIKELIHOOD_SCORE[likeKey] ?? 3;
    const mitKey = normalizeMitigation(f.mitigation);
    const mitFactor = MITIGATION_FACTOR[mitKey] ?? 1.0;

    const adjusted = sevScore * likeScore * mitFactor;
    const maxForFinding = sevScore * 5 * 1.0;

    totalAdjusted += adjusted;
    totalMax += maxForFinding;

    bySeverityAdjusted[sevKey] += adjusted;
    countsBySeverity[sevKey] += 1;

    if (sevKey !== "info") {
      bySevMitCounts[sevKey][mitKey]++;
      bySevLike[sevKey][likeKey].adjusted += adjusted;
      bySevLike[sevKey][likeKey].max += maxForFinding;
      bySevLike[sevKey][likeKey].count += 1;
    }

    const status: RiskTableRow["status"] =
      mitKey === "none" ? "Unmitigated" : mitKey === "partial" ? "In Progress" : "Resolved";

    tableRows.push({
      id: id++,
      finding: f.text,
      severityLabel: capFirst(sevKey),
      sevScore,
      likelihoodLabel: labelLike(likeKey),
      likeScore,
      mitigationLabel: capFirst(mitKey),
      mitFactor,
      formula: `${sevScore} × ${likeScore} × ${mitFactor} = ${adjusted.toFixed(1)}`,
      status,
    });
  }

  // overallPct = proportion of remaining risk (lower is better)
  const overallPct = totalMax > 0 ? Math.round((totalAdjusted / totalMax) * 100) : 0;

  return {
    totalAdjusted,
    totalMax,
    overallPct,
    bySeverityAdjusted,
    countsBySeverity,
    bySevLike,
    bySevMitCounts,
    tableRows,
  };
}

function initLikeCells(): Record<Likelihood, LikeCell> {
  return {
    rare: { adjusted: 0, max: 0, count: 0 },
    unlikely: { adjusted: 0, max: 0, count: 0 },
    possible: { adjusted: 0, max: 0, count: 0 },
    likely: { adjusted: 0, max: 0, count: 0 },
    "very likely": { adjusted: 0, max: 0, count: 0 },
  };
}

// ---------------- Normalizers ----------------

export function normalizeSeverity(s: string): Severity | null {
  const t = (s || "").toLowerCase();
  if (/critical|catastrophic/.test(t)) return "critical";
  if (/high/.test(t)) return "high";
  if (/medium/.test(t)) return "medium";
  if (/low/.test(t)) return "low";
  if (/info|informational/.test(t)) return "info";
  return null;
}

export function normalizeLikelihood(s: string): Likelihood {
  const t = (s || "").toLowerCase();
  if (/very\s*likely/.test(t)) return "very likely";
  if (/likely/.test(t)) return "likely";
  if (/possible/.test(t)) return "possible";
  if (/unlikely/.test(t)) return "unlikely";
  if (/rare/.test(t)) return "rare";
  return "possible";
}

export function normalizeMitigation(s: string): Mitigation {
  const t = (s || "").toLowerCase();
  if (/full/.test(t)) return "full";
  if (/partial/.test(t)) return "partial";
  return "none";
}

// ---------------- Helpers ----------------

export function capFirst(s: string): string {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

export function labelLike(k: string): string {
  switch (k) {
    case "very likely":
      return "Very Likely";
    case "likely":
      return "Likely";
    case "possible":
      return "Possible";
    case "unlikely":
      return "Unlikely";
    case "rare":
      return "Rare";
    default:
      return capFirst(k);
  }
}

/**
 * Convert RiskTotals into a 0–100 posture score (higher = better).
 * posture = 100 - (remainingRisk%).
 */
export function posturePercent(totals: RiskTotals): number {
  if (totals.totalMax <= 0) return 100;
  const remainingPct = Math.round((totals.totalAdjusted / totals.totalMax) * 100);
  const posture = 100 - remainingPct;
  return Math.max(0, Math.min(100, posture));
}
