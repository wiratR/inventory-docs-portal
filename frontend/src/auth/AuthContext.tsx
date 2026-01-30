import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../api/api";

export type Role = "admin" | "uploader" | "viewer";

export type AuthUser = {
  id: string;
  username: string;
  role: Role;
};

export type AuthState = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  state: AuthState | null;

  // ✅ ใช้ใน LoginPage
  isAuthed: boolean;
  role: Role | "";

  // permissions
  canUpload: boolean;

  // actions
  loginWithPassword: (username: string, password: string) => Promise<void>;
  logout: () => void;

  // routing helper
  redirectPathForRole: (role: Role) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "invdocs_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  // persist
  useEffect(() => {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  }, [state]);

  // ===== derived =====
  const isAuthed = !!state?.token;
  const role = state?.user?.role ?? "";
  const canUpload = role === "admin" || role === "uploader";

  // ===== actions =====
  const loginWithPassword = async (username: string, password: string) => {
    const res = await apiFetch<AuthState>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setState(res);
  };

  const logout = () => {
    setState(null);
  };

  // ===== routing helper =====
  const redirectPathForRole = (role: Role) => {
    switch (role) {
      case "admin":
      case "uploader":
      case "viewer":
      default:
        return "/documents";
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      isAuthed,
      role,
      canUpload,
      loginWithPassword,
      logout,
      redirectPathForRole,
    }),
    [state, isAuthed, role, canUpload]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
