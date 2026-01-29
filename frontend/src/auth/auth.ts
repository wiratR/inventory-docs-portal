const KEY = "inventory_docs_auth_v1";

export type AuthUser = {
  username: string;
  role: "admin" | "uploader" | "viewer";
};

export type AuthState = {
  token: string;
  user: AuthUser;
};

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function isAuthed(): boolean {
  return !!getAuth()?.token;
}
