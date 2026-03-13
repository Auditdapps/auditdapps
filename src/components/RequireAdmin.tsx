// src/components/RequireAdmin.tsx
import { Navigate } from "react-router-dom";
import { useAccountRole } from "@/hooks/useAccountRole";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { accountRole, loading } = useAccountRole();
  if (loading) return null;

  if (accountRole !== "admin") return <Navigate to="/admin/posts" replace />;
  return <>{children}</>;
}