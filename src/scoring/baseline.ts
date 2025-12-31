// Deterministic baseline scoring derived ONLY from questionnaire answers.
// Single source of truth for findings used across Dashboard/Detail.
// Industry-aligned severities & N/A/contradiction handling.

import type { ParsedFinding, Severity, Likelihood, Mitigation } from "@/utils/riskUtils";
import { computeRiskTotals, posturePercent } from "@/utils/riskUtils";

export type UserType = "developer" | "organization";
export type Responses = Record<string, string[]>;

type BaselineResult = { findings: ParsedFinding[] };

// Map a normalized control state to mitigation
function mitigationFor(state: "yes" | "partial" | "no"): Mitigation {
  if (state === "yes") return "full";
  if (state === "partial") return "partial";
  return "none";
}

// Severity weights are reflected indirectly via riskUtils; we still tag severities here.
type Rule = {
  // match the question text (case-insensitive)
  test: RegExp;
  // severity of the control if it is missing/partial
  sev: Severity; // "critical" | "high" | "medium" | "low"
  // narrative label for the control (used in finding text)
  label: string;
  // special handler for option semantics (optional)
  handler?: (values: string[]) => "yes" | "partial" | "no" | "exclude" | "contradiction";
};

/* ---------------------- Helpers: option normalization ---------------------- */

function normalizeVals(vals: string[]): string[] {
  return (vals || []).map((v) => v.trim().toLowerCase());
}

// Generic single-choice control: Yes/Partial/No/N/A (with contradiction/N/A logic)
function singleControl(values: string[]): "yes" | "partial" | "no" | "exclude" | "contradiction" {
  const v = normalizeVals(values);
  const hasYes = v.some((x) => x.startsWith("yes"));
  const hasPartial = v.some((x) => x.startsWith("partial"));
  const hasNo = v.some((x) => x === "no");
  const hasNA =
    v.includes("n/a") ||
    v.includes("not applicable (n/a)") ||
    v.includes("not required (n/a)") ||
    v.includes("not implemented (n/a)") ||
    v.includes("not upgradeable / no self-destruct (n/a)") ||
    v.includes("not using upgradeable contracts (n/a)");

  const positiveCount = Number(hasYes) + Number(hasPartial) + Number(hasNo);
  const anyContradiction = positiveCount > 1 || (hasNA && positiveCount > 0);
  if (anyContradiction) return "contradiction";
  if (hasNA && positiveCount === 0) return "exclude";
  if (hasYes) return "yes";
  if (hasPartial) return "partial";
  if (hasNo) return "no";
  return "exclude";
}

// Special: Upgradeable proxies — treat “Not using … (N/A)” carefully
function upgradeableHandler(values: string[]): "yes" | "partial" | "no" | "exclude" | "contradiction" {
  const v = normalizeVals(values);
  const na = v.includes("not using upgradeable contracts (n/a)");
  const basic = singleControl(values);
  if (!na) return basic;
  // If N/A alone → exclude (safe); N/A + anything else → contradiction (treat as Partial finding)
  const others = v.filter((x) => x !== "not using upgradeable contracts (n/a)");
  if (others.length === 0) return "exclude";
  return "contradiction";
}

// Special: Cryptography multi-select: “None” ⇒ gap; otherwise informational (no finding)
function cryptoHandler(values: string[]): "yes" | "partial" | "no" | "exclude" | "contradiction" {
  const v = normalizeVals(values);
  if (v.includes("none")) return "no";
  if (v.length === 0) return "exclude";
  return "yes"; // using some crypto primitives is good; no penalty
}

/* -------------------- Rules (controls with severities) -------------------- */

const CONTROL_RULES: Rule[] = [
  // CRITICAL – keys / admin / governance / IR / disclosure
  {
    test: /multisig|hsm|hardware\s*security\s*module|treasury|administrative/i,
    sev: "critical",
    label: "Admin/treasury protections (multisig/HSM)",
  },
  {
    test: /keys?\s+rotated|access\s+revocation|vault|kms/i,
    sev: "critical",
    label: "Key lifecycle & secret vault",
  },
  {
    test: /least\s*privilege|roles?\b.*(auditable)?|access\s+control/i,
    sev: "critical",
    label: "Least privilege & role separation",
  },
  {
    test: /incident\s+response/i,
    sev: "critical",
    label: "Incident response plan",
  },
  {
    test: /customer.*(disclosure|reporting)\s+channel|standardized\s+customer\s+disclosure/i,
    sev: "critical",
    label: "Customer disclosure channel",
  },

  // HIGH – upgrades, oracles/secure protocols, emergency pause, dual review/tests
  {
    test: /upgrade(able)?\s*pro( xy|xies)?|initializer\s*guard|uups|transparent/i,
    sev: "high",
    label: "Upgradeable proxy controls",
    handler: upgradeableHandler,
  },
  {
    test: /secure\s+protocols|tls|https|secure\s+oracles?/i,
    sev: "high",
    label: "Secure communications/oracles",
  },
  {
    test: /emergency\s+(pause|kill[-\s]*switch|circuit)/i,
    sev: "high",
    label: "Emergency pause/kill-switch",
  },
  {
    test: /review.*(independent|coverage)|unit\/integration\s+tests|coverage/i,
    sev: "high",
    label: "Dual review & test coverage",
  },

  // MEDIUM – monitoring/alerts/logs/change mgmt/governance docs/static analysis/formal verification
  {
    test: /on[-\s]*chain\s+activity\s+monitored|anomal(y|ies)|mev|exploit\s+signatures?/i,
    sev: "medium",
    label: "On-chain anomaly monitoring",
  },
  {
    test: /alerts?\s+configured|webhooks?|slack|discord|pagerduty|runbooks?/i,
    sev: "medium",
    label: "Automated alerting with runbooks",
  },
  {
    test: /logs?|telemetry|observability|forensic|retention|integrity\s+protections?/i,
    sev: "medium",
    label: "Log retention & integrity for forensics",
  },
  {
    test: /change\s+management|approvals?|rollback/i,
    sev: "medium",
    label: "Change management for upgrades/releases",
  },
  {
    test: /governance.*(documented|auditable)|decision\s+records|proposals?/i,
    sev: "medium",
    label: "Governance documentation & auditability",
  },
  {
    test: /static\s+analysis|sast|formal\s+verification/i,
    sev: "medium",
    label: "Static analysis / Formal verification",
  },

  // MEDIUM – developer-specific safety controls
  { test: /re-entrancy/i, sev: "medium", label: "Re-entrancy protections" },
  { test: /overflow|underflow|safemath/i, sev: "medium", label: "Overflow/Underflow protections" },
  { test: /access\s+modifiers?|encapsulated/i, sev: "medium", label: "Access modifiers & encapsulation" },
  { test: /randomness|vrf|commitments/i, sev: "medium", label: "Secure randomness" },
  { test: /gas\s+limit.*dos|bounded\s+loops|pull.*push/i, sev: "medium", label: "DoS by gas mitigation" },
  { test: /economic\s+attack|flash\s+loan|oracle\s+manipulation/i, sev: "medium", label: "Economic attack analysis" },
  { test: /front[-\s]*running|reordering/i, sev: "medium", label: "Front-running/reordering testing" },

  // LOW – scope/docs/UX etc.
  { test: /scope.*defined/i, sev: "low", label: "Scope definition" },
  { test: /documentation.*(recommendations|implementation)|comprehensive\s+documentation/i, sev: "low", label: "Security documentation" },
  { test: /front[-\s]*end.*(phishing|approvals?|manipulation)/i, sev: "low", label: "Front-end user protections" },
  { test: /dependencies?|libraries?.*(vetted|updated)/i, sev: "low", label: "Dependencies vetted & updated" },
  { test: /token\s+standards?|interoperability/i, sev: "low", label: "Standards/interoperability compliance" },

  // INFORMATIONAL – cryptography inventory (penalize only if “None”)
  {
    test: /cryptographic.*techniques|cryptographic.*concepts/i,
    sev: "medium",
    label: "Cryptography primitives in use",
    handler: cryptoHandler,
  },
];

/* ---------------------------- Build findings ---------------------------- */

function evalControl(question: string, values: string[]): {
  state: "yes" | "partial" | "no" | "exclude" | "contradiction";
  rule: Rule | null;
} {
  for (const r of CONTROL_RULES) {
    if (r.test.test(question)) {
      const state = r.handler ? r.handler(values) : singleControl(values);
      return { state, rule: r };
    }
  }
  return { state: "exclude", rule: null }; // unknown questions don't affect scoring
}

function toLikelihood(sev: Severity, state: "no" | "partial" | "contradiction"): Likelihood {
  if (state === "contradiction") return "possible";
  if (sev === "critical") return state === "no" ? "very likely" : "likely";
  if (sev === "high") return state === "no" ? "likely" : "possible";
  return "possible";
}

/** Build deterministic findings from answers (industry-aligned). */
export function buildBaselineFindings(responses: Responses, _userType: UserType): BaselineResult {
  const findings: ParsedFinding[] = [];

  const entries = Object.entries(responses || {});
  for (const [question, values] of entries) {
    const { state, rule } = evalControl(question, values || []);
    if (!rule) continue; // informational/unknown question

    if (state === "exclude") continue; // pure N/A

    if (state === "yes") continue; // implemented => no finding

    const sev = rule.sev;
    const mit: Mitigation =
      state === "partial" || state === "contradiction" ? "partial" : "none";
    const like = toLikelihood(sev, state === "no" ? "no" : "partial");

    // Finding text
    let prefix =
      state === "partial" || state === "contradiction"
        ? "Control partially implemented"
        : "Control missing";

    // Special contradictory answers noted explicitly
    const contradictoryNote =
      state === "contradiction" ? " (conflicting answers detected; auditor review needed)" : "";

    findings.push({
      severity: sev,
      likelihood: like,
      mitigation: mit,
      text: `${prefix}: ${rule.label} — ${question}${contradictoryNote}`,
    });
  }

  // Global governance red flag if ≥80% of applicable controls are “No”
  const applicable = findings.length
    ? entries.filter(([, v]) => singleControl(v) !== "exclude").length
    : entries.length;
  const noCount = entries.filter(([, v]) => singleControl(v) === "no").length;
  if (applicable >= 5 && noCount / Math.max(1, applicable) >= 0.8) {
    findings.push({
      severity: "critical",
      likelihood: "very likely",
      mitigation: "none",
      text: "Widespread absence of baseline controls across the program.",
    });
  }

  return { findings };
}

/** Summarize totals and compute a posture score (0–100). */
export function summarizeBaseline(responses: Responses, userType: UserType) {
  const { findings } = buildBaselineFindings(responses, userType);
  const totals = computeRiskTotals(findings);
  const score = posturePercent(totals); // uses weighted totals under the hood
  return { findings, totals, score, overallPct: totals.overallPct };
}
