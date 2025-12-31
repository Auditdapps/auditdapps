// src/utils/scannerPrompt.ts
import { getScannerAnalysis } from "./openaiScanner";

export async function analyzeContract({
  chain,
  address,
  sourceCode,
  compiler,
  contracts,
}: {
  chain: string;
  address: string;
  sourceCode: string;
  compiler: string | null;
  contracts: Array<{ name: string; file?: string }>;
}): Promise<{
  summary_md: string;
  findings: Array<{
    severity: "Critical" | "High" | "Medium" | "Low" | string;
    title: string;
    description: string;
    remediation?: string;
  }>;
  score: number;
}> {
  const rubric = `
You are a senior smart contract security auditor with deep expertise in Solidity, the EVM and DeFi protocols.

The system message already told you the exact JSON shape to return.
Focus now on **content quality**:

- "summary_md":
  - 2–4 short paragraphs.
  - High-level risk posture: how risky is this contract overall and why?
  - Mention major vulnerability themes, notable strengths, and any assumptions.
  - DO NOT enumerate each finding in detail here.
  - DO NOT copy-paste the full text of any finding into the summary.

- "findings":
  - 0–10 items.
  - Each item is a **distinct** issue, not a restatement of the summary.
  - Use severity strictly from: Critical, High, Medium, Low.
  - Group similar sub-issues into a single finding instead of repeating.
  - "description" should focus on concrete impact, affected components and scenarios.
  - "remediation" must contain specific, actionable guidance (code-level ideas, patterns, or controls).

If the contract appears generally safe, it's okay to return an empty "findings": [] but still write a thoughtful summary and a high score.
`.trim();

  const contractsList =
    contracts && contracts.length
      ? contracts
          .map((c) => `- ${c.name}${c.file ? ` (file: ${c.file})` : ""}`)
          .join("\n")
      : "- Not explicitly specified";

  const MAX_SOURCE_CHARS = 160_000;
  const trimmedSource =
    sourceCode.length > MAX_SOURCE_CHARS
      ? sourceCode.slice(0, MAX_SOURCE_CHARS) +
        "\n\n// [truncated for length]"
      : sourceCode;

  const context = [
    `Chain: ${chain}`,
    `Address: ${address}`,
    compiler ? `Compiler: ${compiler}` : "Compiler: unknown",
    "Contracts:",
    contractsList,
  ].join("\n");

  const prompt = `${rubric}

Context:
${context}

Solidity source (may be multi-file JSON from an explorer, shown verbatim below):

\`\`\`solidity
${trimmedSource}
\`\`\`
`;

  const raw = await getScannerAnalysis(prompt);
  console.log("[scannerPrompt] raw from OpenAI:", raw);

  let summary_md = "";
  let findings: any[] = [];
  let score = 0;

  try {
    let jsonText = raw.trim();

    const fencedMatch = jsonText.match(/```json([\s\S]*?)```/i);
    if (fencedMatch && fencedMatch[1]) {
      jsonText = fencedMatch[1].trim();
    }

    const parsed = JSON.parse(jsonText);

    summary_md = String(parsed.summary_md ?? "").trim();
    findings = Array.isArray(parsed.findings) ? parsed.findings : [];
    score = Number(parsed.score ?? 0);
  } catch (err) {
    console.warn(
      "[scannerPrompt] Failed to parse JSON from OpenAI response:",
      err
    );
    summary_md = raw.trim();
    findings = [];
    score = 0;
  }

  if (summary_md) {
    summary_md = summary_md
      .replace(/```[\s\S]*?```/g, "")
      .replace(/^\s*#{1,6}\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const sevMap: Record<string, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  const normFindings = findings.map((f) => {
    const sevRaw = String(f.severity || "").toLowerCase();
    const severity =
      sevMap[sevRaw] ||
      (["critical", "high", "medium", "low"].includes(sevRaw)
        ? sevMap[sevRaw]
        : "Medium");

    return {
      severity,
      title: String(f.title || "Security issue"),
      description: String(
        f.description || f.details || "No description provided."
      ),
      remediation: f.remediation ? String(f.remediation) : undefined,
    };
  });

  const safeScore = Math.max(
    0,
    Math.min(100, Math.round(Number.isFinite(score) ? Number(score) : 0))
  );

  return {
    summary_md: summary_md || "No summary was generated.",
    findings: normFindings,
    score: safeScore,
  };
}
