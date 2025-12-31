// src/routes/RequirePremium.tsx
import { Navigate, useLocation } from "react-router-dom";

type Plan = "free" | "one-time" | "premium";

export function RequirePremium({
  children,
  plan,
}: {
  children: JSX.Element;
  plan: Plan;
}) {
  const location = useLocation();

  if (plan === "premium" || plan === "one-time") {
    return children;
  }

  const next = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/pricing?next=${next}`} replace />;
}
