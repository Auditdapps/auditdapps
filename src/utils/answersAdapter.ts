// Normalizes stored answers (developer + organization) into the deterministic
// `Responses` format that baseline.ts expects.
//
// Works with two common shapes:
// A) Embedded JSON arrays on audit row:
//    audit.meta.developer_responses: Array<{ question: string; options: string[] }>
//    audit.meta.organization_responses: Array<{ question: string; options: string[] }>
// B) Normalized answers table rows:
//    Array<{ question: string; option_value: string; audience?: 'developer'|'organization' }>
//
// You can feed either (or both) into these helpers.

export type EmbeddedQA = Array<{ question: string; options: string[] }>;
export type NormalizedAnswerRow = {
  question: string;
  option_value: string;
  audience?: "developer" | "organization" | null;
};

export type Responses = Record<string, string[]>;

/** Merge multiple Responses into one, concatenating selected options per question. */
export function mergeResponses(...parts: (Responses | null | undefined)[]): Responses {
  const out: Responses = {};
  for (const p of parts) {
    if (!p) continue;
    for (const [q, opts] of Object.entries(p)) {
      out[q] = Array.from(new Set([...(out[q] || []), ...opts]));
    }
  }
  return out;
}

/** From embedded JSON: [{question, options}] → Responses */
export function responsesFromEmbedded(list: EmbeddedQA | null | undefined): Responses {
  const out: Responses = {};
  (list || []).forEach((row) => {
    const q = (row?.question || "").trim();
    if (!q) return;
    const opts = Array.isArray(row?.options) ? row.options.filter(Boolean).map(String) : [];
    if (!opts.length) return;
    out[q] = Array.from(new Set(opts));
  });
  return out;
}

/** From normalized table rows: [{question, option_value}] → Responses */
export function responsesFromRows(rows: NormalizedAnswerRow[] | null | undefined): Responses {
  const out: Responses = {};
  (rows || []).forEach((r) => {
    const q = (r?.question || "").trim();
    const v = (r?.option_value || "").trim();
    if (!q || !v) return;
    out[q] = Array.from(new Set([...(out[q] || []), v]));
  });
  return out;
}

/** Convenience: try multiple locations on the audit row for embedded answers. */
export function responsesFromAuditEmbedded(audit: any): Responses {
  // You can rename these keys to match exactly where you store them.
  const dev = audit?.meta?.developer_responses || audit?.developer_responses || null;
  const org = audit?.meta?.organization_responses || audit?.organization_responses || null;
  const devR = responsesFromEmbedded(dev);
  const orgR = responsesFromEmbedded(org);
  return mergeResponses(devR, orgR);
}
