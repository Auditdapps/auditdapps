// src/components/RequireEditor.tsx
import { Navigate } from "react-router-dom";
import { useAccountRole } from "@/hooks/useAccountRole";

export default function RequireEditor({ children }: { children: React.ReactNode }) {
  const { accountRole, loading } = useAccountRole();
  if (loading) return null;

  if (accountRole !== "admin" && accountRole !== "editor") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}