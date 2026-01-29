import type { AuthUser, LoginResponse } from "../lib/api";
// src/auth/AuthContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

import { login } from "../lib/api";

export type AuthState = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  state: AuthState | null;
  loginWithPassword: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_KEY = "inventory_docs_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState | null>(() => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  });

  const value = useMemo<AuthContextValue>(() => {
    return {
      state,
      loginWithPassword: async (username, password) => {
        const resp = await login(username, password);
        const next: AuthState = { token: resp.token, user: resp.user };
        setState(next);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        return resp;
      },
      logout: () => {
        setState(null);
        localStorage.removeItem(LS_KEY);
      },
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
