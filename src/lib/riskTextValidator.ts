// src/lib/riskTextValidator.ts
// Small, defensive “linter”/auto-fixer for the audit markdown produced by OpenAI.
// It enforces the section order, severity headings, one-line bullets, and the
// [Likelihood: …] [Mitigation: …] tags with allowed values.

export type ValidationResult = { output: string; warnings: string[] };

type SectionKey = "summary" | "critical" | "high" | "medium" | "low" | "recs";

const SEV_META = {
  critical: { icon: "🛑", title: "Critical", defaultLike: "Likely" },
  high: { icon: "🚨", title: "High", defaultLike: "Likely" },
  medium: { icon: "⚠️", title: "Medium", defaultLike: "Possible" },
  low: { icon: "🟡", title: "Low", defaultLike: "Unlikely" },
} as const;

const LIKE_ALLOWED = ["Very Likely", "Likely", "Possible", "Unlikely", "Rare"] as const;
const MIT_ALLOWED = ["None", "Partial", "Full"] as const;

const H_SUMMARY = /^#{1,6}\s*.*audit\s*summary.*$/i;
const H_CRIT = /^#{2,6}\s*(?:🛑\s*)?(?:critical)\b.*$/i;
const H_HIGH = /^#{2,6}\s*(?:🚨\s*)?(?:high)\b.*$/i;
const H_MED = /^#{2,6}\s*(?:⚠️\s*)?(?:medium)\b.*$/i;
const H_LOW  = /^#{2,6}\s*(?:🟡\s*)?(?:low)\b.*$/i;
const H_RECS = /^#{2,6}\s*(?:✅\s*)?(?:tailored|recommendations|actionable).*$/i;

const RX_BULLET = /^([-*\u2022]|\d+\.)\s+(.*)$/;              // capture text after list marker
const RX_TAG_LIKE = /\[\s*likelihood\s*:\s*(very likely|likely|possible|unlikely|rare)\s*\]/i;
const RX_TAG_MIT  = /\[\s*mitigation\s*:\s*(?:fully?\s*mitigated|full|partially?\s*mitigated|partial|none|no\s*mitigation)\s*\]/i;

export function validateAndFixAuditMarkdown(raw: string): ValidationResult {
  const warnings: string[] = [];
  let text = (raw ?? "").replace(/\r\n/g, "\n").trim();

  if (!text) {
    warnings.push("Markdown was empty; created a minimal skeleton.");
    return { output: buildSkeleton(), warnings };
  }

  // 1) Split into sections we care about
  const parsed = parseSections(text);

  // 2) Normalize summary
  const summary = normalizeSummary(parsed.summary, warnings);

  // 3) Normalize each severity list (ensure bullets are one-line and have both tags)
  const crit = normalizeSeverityList("critical", parsed.critical, warnings);
  const high = normalizeSeverityList("high", parsed.high, warnings);
  const med  = normalizeSeverityList("medium", parsed.medium, warnings);
  const low  = normalizeSeverityList("low", parsed.low, warnings);

  // 4) Normalize “Tailored Actionable Recommendations” (no tags enforced there)
  const recs = normalizeRecs(parsed.recs, warnings);

  // 5) Stitch back together in the exact order we expect
  const out = [
    `# 🧾 Audit Summary`,
    summary || "This summary was auto-generated from the provided answers and findings.",
    "",
    `## ${SEV_META.critical.icon} ${SEV_META.critical.title} Severity`,
    crit.length ? crit.map((t) => `- ${SEV_META.critical.icon} ${t}`).join("\n") : "_No significant critical issues found._",
    "",
    `## ${SEV_META.high.icon} ${SEV_META.high.title} Severity`,
    high.length ? high.map((t) => `- 🔴 ${t}`).join("\n") : "_No significant high issues found._",
    "",
    `## ${SEV_META.medium.icon} ${SEV_META.medium.title} Severity`,
    med.length ? med.map((t) => `- 🟠 ${t}`).join("\n") : "_No significant medium issues found._",
    "",
    `## ${SEV_META.low.icon} ${SEV_META.low.title} Severity`,
    low.length ? low.map((t) => `- 🟡 ${t}`).join("\n") : "_No significant low issues found._",
    "",
    `## ✅ Tailored Actionable Recommendations`,
    recs.length ? recs.map((t) => `- ✅ ${t}`).join("\n") : "- ✅ Establish a minimal hardening baseline and revisit DApp security posture in 30 days.",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n") // collapse extra blank lines
    .trim();

  return { output: out, warnings };
}

/* ------------------------- helpers ------------------------- */

function parseSections(md: string): Record<SectionKey, string[]> {
  const lines = md.split("\n");

  const out: Record<SectionKey, string[]> = {
    summary: [],
    critical: [],
    high: [],
    medium: [],
    low: [],
    recs: [],
  };

  let cur: SectionKey | null = null;

  for (const raw of lines) {
    const line = raw.trim();

    if (H_SUMMARY.test(line)) { cur = "summary"; continue; }
    if (H_CRIT.test(line))    { cur = "critical"; continue; }
    if (H_HIGH.test(line))    { cur = "high"; continue; }
    if (H_MED.test(line))     { cur = "medium"; continue; }
    if (H_LOW.test(line))     { cur = "low"; continue; }
    if (H_RECS.test(line))    { cur = "recs"; continue; }

    if (!cur) {
      // Before the first known heading: treat first paragraph as summary preface
      out.summary.push(line);
    } else {
      out[cur].push(line);
    }
  }

  return out;
}

function normalizeSummary(lines: string[], warnings: string[]): string {
  // keep only the first 2–3 sentences worth of content
  const text = lines
    .filter((l) => l && !l.startsWith("#"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    warnings.push("Missing summary; inserted a generic summary.");
    return "";
  }

  // soft cap to ~450 chars
  if (text.length > 600) {
    warnings.push("Summary was long; truncated to ~450 characters.");
  }
  return truncate(text, 450);
}

function normalizeSeverityList(
  sevKey: "critical" | "high" | "medium" | "low",
  lines: string[],
  warnings: string[]
): string[] {
  const items: string[] = [];
  const meta = SEV_META[sevKey];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const m = line.match(RX_BULLET);
    if (!m) continue;

    let content = m[2].replace(/\s+/g, " ").trim();

    // Ensure tags exist and are normalized
    let like = extractLike(content);
    let mit = extractMit(content);

    // Remove any existing tags so we can re-append canonical ones
    content = stripTags(content).trim();
    content = stripLeadingIcons(content); // <- prevent duplicate emojis

    if (!like) {
      like = meta.defaultLike;
      warnings.push(`Added missing Likelihood tag in ${meta.title} section.`);
    }
    if (!MIT_ALLOWED.includes(mit as any)) {
      // normalise & default
      mit = normalizeMit(mit) ?? "None";
      if (mit === "None") warnings.push(`Fixed/added Mitigation tag in ${meta.title} section.`);
    }

    // One-line, append canonical tags
    const bullet = `${content} [Likelihood: ${like}] [Mitigation: ${mit}]`;
    items.push(bullet);
  }
  return items;
}

function normalizeRecs(lines: string[], warnings: string[]): string[] {
  // Keep bullets, strip any tags accidentally added by the model.
  const out: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(RX_BULLET);
    if (!m) continue;

    let content = m[2].replace(/\s+/g, " ").trim();
    content = stripTags(content);
    content = stripLeadingIcons(content); // <- prevent duplicate emojis
    if (!content) continue;

    // Trim to keep them punchy
    out.push(truncate(content, 220));
  }
  return out.slice(0, 12);
}

function extractLike(s: string): typeof LIKE_ALLOWED[number] | null {
  const m = s.match(RX_TAG_LIKE);
  if (!m) return null;
  const raw = m[1].toLowerCase();
  if (/very\s*likely/.test(raw)) return "Very Likely";
  if (/likely/.test(raw)) return "Likely";
  if (/possible/.test(raw)) return "Possible";
  if (/unlikely/.test(raw)) return "Unlikely";
  if (/rare/.test(raw)) return "Rare";
  return null;
}

function extractMit(s: string): typeof MIT_ALLOWED[number] | null {
  const m = s.match(RX_TAG_MIT);
  if (!m) return null;
  const raw = m[0].toLowerCase();
  if (/full/.test(raw)) return "Full";
  if (/partial/.test(raw)) return "Partial";
  if (/none|no\s*mitigation/.test(raw)) return "None";
  return null;
}

function normalizeMit(v: any): typeof MIT_ALLOWED[number] | null {
  const t = String(v || "").toLowerCase();
  if (/full/.test(t)) return "Full";
  if (/partial/.test(t)) return "Partial";
  if (/none|no\s*mitigation/.test(t)) return "None";
  return null;
}

function stripTags(s: string): string {
  return s
    .replace(RX_TAG_LIKE, " ")
    .replace(RX_TAG_MIT, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function truncate(s: string, max = 450): string {
  return s.length <= max ? s : s.slice(0, max).trim() + "…";
}

// Strip any leading severity/recommendation icons the model may have added
const RX_LEADING_ICONS = /^(?:[🛑🔴🟠🟡✅]\s*)+/u;
function stripLeadingIcons(s: string): string {
  return s.replace(RX_LEADING_ICONS, "").trim();
}

function buildSkeleton(): string {
  return [
    "# 🧾 Audit Summary",
    "This summary was auto-generated from the provided answers and findings.",
    "",
    "## 🛑 Critical Severity",
    "_No significant critical issues found._",
    "",
    "## 🚨 High Severity",
    "_No significant high issues found._",
    "",
    "## ⚠️ Medium Severity",
    "_No significant medium issues found._",
    "",
    "## 🟡 Low Severity",
    "_No significant low issues found._",
    "",
    "## ✅ Tailored Actionable Recommendations",
    "- ✅ Review access controls, logging/monitoring, and dependency hygiene.",
  ].join("\n");
}
