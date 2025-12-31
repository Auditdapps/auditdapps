// src/lib/pendingAudit.ts

export type PendingAnswers = {
  answers: Record<string, unknown>;
  user_type: "Developer" | "Organization";
};

export type PendingAuditPayload = {
  score: number | null;
  summary_md: string;
  baseline_findings: Array<{ severity?: string; text?: string }>;
  counts: { critical?: number; high?: number; medium?: number; low?: number } | null;
  analytics: any;
  meta: any;
  user_type: "Developer" | "Organization";
};

const PENDING_ANSWERS_KEY = "pending_audit_answers";
const PENDING_AUDIT_PAYLOAD_KEY = "pending_audit_payload";

// ---------- answers (pre-auth) ----------
export function savePendingAnswers(payload: PendingAnswers) {
  localStorage.setItem(PENDING_ANSWERS_KEY, JSON.stringify(payload));
}

export function loadPendingAnswers(): PendingAnswers | null {
  try {
    const raw = localStorage.getItem(PENDING_ANSWERS_KEY);
    return raw ? (JSON.parse(raw) as PendingAnswers) : null;
  } catch {
    return null;
  }
}

export function clearPendingAnswers() {
  localStorage.removeItem(PENDING_ANSWERS_KEY);
}

// ---------- payload (post-generation, used by Pricing/Preview) ----------
export function savePendingAudit(payload: PendingAuditPayload) {
  localStorage.setItem(PENDING_AUDIT_PAYLOAD_KEY, JSON.stringify(payload));
}
export function clearPendingAudit() {
  localStorage.removeItem(PENDING_AUDIT_PAYLOAD_KEY);
}

/**
 * Loads a unified "pending audit" payload from storage.
 * If it only finds legacy guest keys, it will normalize them
 * and persist to `pending_audit_payload` for the rest of the app.
 *
 * Returns the payload or null if nothing is found.
 */
export function loadAndPersistPendingAudit(): PendingAuditPayload | null {
  // 1) If we already have the new payload, return it.
  const rawNew = localStorage.getItem(PENDING_AUDIT_PAYLOAD_KEY);
  if (rawNew) {
    try {
      return JSON.parse(rawNew) as PendingAuditPayload;
    } catch {
      // fall through to migration
    }
  }

  // 2) Migrate from legacy guest keys (used by old preview flow).
  try {
    const rawGuest = localStorage.getItem("guest_audit_result");
    const summaryMd = localStorage.getItem("audit_recommendations") || "";
    if (!rawGuest) return null;

    const guest = JSON.parse(rawGuest) as any;

    const payload: PendingAuditPayload = {
      score: Number.isFinite(Number(guest?.score)) ? Number(guest.score) : null,
      summary_md: String(guest?.summary_md ?? summaryMd ?? ""),
      baseline_findings:
        (guest?.baseline_findings ?? []).map((f: any) => ({
          severity: f?.severity ?? "Medium",
          text: String(f?.text ?? "Security improvement"),
        })) ?? [],
      counts: guest?.counts ?? null,
      analytics: guest?.analytics ?? null,
      meta: guest?.meta ?? null,
      user_type:
        String(guest?.user_type ?? "Organization") === "Developer" ? "Developer" : "Organization",
    };

    // persist new canonical payload
    savePendingAudit(payload);
    return payload;
  } catch {
    return null;
  }
}
