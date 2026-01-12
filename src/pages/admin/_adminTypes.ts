export type Period = "weekly" | "monthly" | "annual";
export type PlanTier = "free" | "premium";

export type ProfileRow = {
  id: string;
  email: string | null;
  org_name: string | null;
  role: string | null;
  is_admin: boolean | null;
  is_premium: boolean | null;
  premium_expires_at: string | null;
  plan_period: Period | null;
  plan_tier: PlanTier | null;
  stripe_price_id?: string | null;
  stripe_customer_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AuditRow = {
  id: string;
  user_id: string;
  user_type: "Developer" | "Organization";
  status: string | null;
  score: number | null;
  overall_pct: number | null;
  counts: Record<string, unknown> | null;
  created_at: string | null;
  recommendations_md?: string | null;
  analytics?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
  answers?: Record<string, unknown> | null;
  totals?: Record<string, unknown> | null;
  baseline_findings?: Record<string, unknown> | null;
};

export type RecommendationRow = {
  id: string;
  audit_id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "open" | "fixed" | string | null;
  rationale: string | null;
  mitigation: string | null;
  likelihood: string | null;
  weight: number | null;
  created_at: string | null;
};

export type ManualAuditRequestRow = {
  id: string;
  user_id: string | null;
  project: string | null;
  contact: string | null;
  notes: string | null;
  status: string | null;
  created_at: string | null;
};

export type ProductFeedbackRow = {
  id: string;
  created_at: string;
  user_id: string;
  audit_id: string | null;
  surface: string;
  slither_enabled: boolean;
  ai_enabled: boolean;
  app_version: string | null;
  overall_rating: number;
  clarity_rating: number | null;
  would_recommend: boolean;
  outcome: string | null;
  fixed_issue: boolean | null;
  what_fixed: string | null;
  testimonial: string | null;
  consent_public: boolean;
  what_was_helpful: string | null;
  what_was_confusing: string | null;
  what_should_improve: string | null;
};
