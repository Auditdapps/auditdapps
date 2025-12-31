// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { getRole } from "../utils/auth";

type Props = {
  children: React.ReactNode;
  /** If set, admins who hit this route will be redirected here (e.g. "/admin") */
  redirectAdminTo?: string;
};

export default function ProtectedRoute({ children, redirectAdminTo }: Props) {
  const { loading, user } = useUser();
  const role = getRole(user);
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-slate-500">Loading…</div>;
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (redirectAdminTo && role === "admin") {
    return <Navigate to={redirectAdminTo} replace />;
  }

  return <>{children}</>;
}
