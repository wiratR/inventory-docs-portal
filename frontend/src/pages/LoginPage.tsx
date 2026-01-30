import { Button, Card, CardBody, Input } from "../components/ui";
import { useEffect, useState } from "react";

import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function LoginPage() {
  const nav = useNavigate();
  const { isAuthed, role, loginWithPassword, redirectPathForRole } = useAuth();
  const { push } = useToast();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed && role) nav(redirectPathForRole(role), { replace: true });
  }, [isAuthed, role, nav, redirectPathForRole]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithPassword(username, password);
      push({ type: "success", message: "Logged in" });
      // redirect จะโดน useEffect จัดให้
    } catch (err: any) {
      push({ type: "error", message: err?.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <div className="text-white text-2xl font-semibold">
            Inventory Docs Portal
          </div>
          <div className="text-white/60 text-sm">
            Sign in to continue
          </div>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-3">
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <Input
                label="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <div className="pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </Button>
              </div>

              <div className="text-xs text-white/50 pt-2">
                Test users: admin/admin123, uploader/uploader123, viewer/viewer123
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
