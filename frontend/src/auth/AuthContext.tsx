import React, { createContext, useContext, useMemo, useState } from "react";
import { clearAuth, getAuth, setAuth } from "./auth";

import type { AuthState } from "./auth";

type AuthCtx = {
  auth: AuthState | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<AuthState | null>(getAuth());

  const api = useMemo<AuthCtx>(
    () => ({
      auth,
      login: async (username: string, password: string) => {
        // ✅ DEV LOGIN: กำหนด rule ง่าย ๆ
        // - admin/admin -> admin
        // - uploader/uploader -> uploader
        // - viewer/viewer -> viewer
        // - อย่างอื่นไม่ให้ผ่าน
        const pair = `${username}:${password}`;
        if (
          pair !== "admin:admin" &&
          pair !== "uploader:uploader" &&
          pair !== "viewer:viewer"
        ) {
          throw new Error("Invalid username or password (dev mode)");
        }

        const role =
          username === "admin"
            ? "admin"
            : username === "uploader"
            ? "uploader"
            : "viewer";

        const state: AuthState = {
          token: "dev-token-" + Date.now(),
          user: { username, role },
        };

        setAuth(state);
        setAuthState(state);
      },
      logout: () => {
        clearAuth();
        setAuthState(null);
      },
    }),
    [auth]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
