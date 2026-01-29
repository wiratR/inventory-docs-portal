import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { auth, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-full bg-brand-soft">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-brand text-white flex items-center justify-center font-bold">
              ID
            </div>
            <div className="font-semibold text-lg">Inventory Docs Portal</div>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              Documents
            </NavLink>

            {auth?.user.role !== "viewer" && (
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm ${
                    isActive
                      ? "bg-brand text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                Upload
              </NavLink>
            )}

            <div className="ml-4 flex items-center gap-2">
              <div className="text-xs text-gray-500">
                {auth?.user.username} ({auth?.user.role})
              </div>
              <button
                onClick={() => {
                  logout();
                  nav("/login");
                }}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
