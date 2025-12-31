// src/utils/formatPrompt.ts

export type ResponsesMap = Record<string, string[]>;
export type OthersInputMap = Record<string, string>;
export type QuestionItem = { question: string };

/**
 * Build a concise, structured prompt from the self-audit answers.
 */
export function formatAuditResponses(
  responses: ResponsesMap,
  othersInput: OthersInputMap = {},
  userType: string,
  questionsInOrder: QuestionItem[] = []
): string {
  const who = (userType || "user").toLowerCase();

  let prompt =
    `You are a blockchain/smart-contract security expert. A ${who} has completed a self-audit checklist. ` +
    `Based on their answers, provide tailored security recommendations, suggest improvements, and highlight any risks or best practices missed. ` +
    `Here are their answers:\n\n`;

  // Keep a stable order if questionsInOrder is provided
  const orderedEntries: Array<[string, string[] | undefined]> =
    questionsInOrder.length > 0
      ? questionsInOrder.map((q) => [q.question, responses[q.question]])
      : (Object.entries(responses) as Array<[string, string[]]>);

  // Only include questions with at least one answer
  const entries: Array<[string, string[]]> = orderedEntries
    .filter(([, ans]) => Array.isArray(ans) && ans.length > 0)
    .map(([q, ans]) => [q, ans as string[]]);

  for (const [question, answers] of entries) {
    const cleaned = (answers || [])
      .map((ans) => {
        if (ans === "Others") {
          const extra = (othersInput?.[question] || "").trim();
          return extra ? `Others: ${truncate(extra)}` : "Others: Not specified";
        }
        return truncate(String(ans).trim());
      })
      .filter(Boolean);

    if (!cleaned.length) continue;
    prompt += `Q: ${question}\nA: ${cleaned.join(", ")}\n\n`;
  }

  prompt += [
    "Respond in clear, actionable bullet points.",
    "Prioritize by severity (High/Medium/Low) with short justifications.",
    "Include a short 2–3 sentence overview first, and end with 3 quick wins.",
  ].join(" ");

  return prompt;
}

/** Prevent any single answer from being excessively long. */
function truncate(text: string, max = 300): string {
  return text.length <= max ? text : text.slice(0, max) + "…";
}
