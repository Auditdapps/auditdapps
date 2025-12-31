// Keep UI types
export type UiSeverity = "Critical" | "High" | "Medium" | "Low";
export type UiStatus   = "open" | "partial" | "implemented";

// ✅ DB expects Title-Case for severity
export function toDbSeverity(s: any): "Critical" | "High" | "Medium" | "Low" {
  const t = String(s ?? "").toLowerCase();
  if (t.startsWith("crit")) return "Critical";
  if (t.startsWith("hi"))   return "High";
  if (t.startsWith("med"))  return "Medium";
  return "Low";
}

// Your status mapping is fine if DB uses open|in_progress|done.
export function toDbStatus(s: any): "open" | "in_progress" | "done" {
  const t = String(s ?? "").toLowerCase();
  if (t === "implemented" || t === "done")      return "done";
  if (t === "partial" || t === "in_progress")   return "in_progress";
  return "open";
}

// Readers (unchanged – UI wants Title-Case + friendly status)
export function fromDbSeverity(s: any): UiSeverity {
  const t = String(s ?? "").toLowerCase();
  if (t.startsWith("crit")) return "Critical";
  if (t.startsWith("hi"))   return "High";
  if (t.startsWith("med"))  return "Medium";
  return "Low";
}

export function fromDbStatus(s: any): UiStatus {
  const t = String(s ?? "").toLowerCase();
  if (t === "done" || t === "implemented")        return "implemented";
  if (t === "in_progress" || t === "partial")     return "partial";
  return "open";
}
