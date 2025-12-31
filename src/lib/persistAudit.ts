// src/lib/pendingAudit.ts
export type PendingAuditPayload = {
  score: number | null;
  summary_md: string;
  baseline_findings: any[];
  counts: any;
  analytics: any;
  meta: any;
  user_type: string; // "Developer" | "Organization"
};

const KEY = "pending_audit_payload";

export function savePendingAudit(p: PendingAuditPayload) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore quota / SSR issues
  }
}

/**
 * Load whatever we saved pre-auth. You’ll later POST this to Supabase
 * after the user completes registration + email confirmation.
 */
export async function loadAndPersistPendingAudit(): Promise<PendingAuditPayload | null> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // keep it for now; you can decide when to clear
    return parsed as PendingAuditPayload;
  } catch {
    return null;
  }
}

export function clearPendingAudit() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
