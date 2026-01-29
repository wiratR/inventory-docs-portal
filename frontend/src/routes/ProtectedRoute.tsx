import { Navigate } from "react-router-dom";
// src/routes/ProtectedRoute.tsx
import React from "react";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  if (!state) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireRole({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: Array<"admin" | "uploader" | "viewer">;
}) {
  const { state } = useAuth();
  if (!state) return <Navigate to="/login" replace />;
  if (!allow.includes(state.user.role)) return <Navigate to="/forbidden" replace />;
  return <>{children}</>;
}
