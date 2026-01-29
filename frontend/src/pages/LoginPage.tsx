// src/pages/LoginPage.tsx
import React, { useState } from "react";

import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function roleRedirect(role: "admin" | "uploader" | "viewer") {
  if (role === "viewer") return "/documents";
  return "/documents"; // admin/uploader ไป documents เหมือนกัน แต่จะเห็นปุ่ม upload
}

export default function LoginPage() {
  const nav = useNavigate();
  const { loginWithPassword } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const resp = await loginWithPassword(username, password);
      nav(roleRedirect(resp.user.role), { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6">
        <h1 className="text-xl font-semibold">Inventory Docs Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-slate-600">Username</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 text-white py-2 font-medium disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
