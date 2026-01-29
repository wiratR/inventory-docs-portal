// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export type AuthUser = { id: string; username: string; role: "admin" | "uploader" | "viewer" };
export type LoginResponse = { token: string; user: AuthUser };

export async function apiFetch<T>(path: string, opts: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      ...(opts.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}
