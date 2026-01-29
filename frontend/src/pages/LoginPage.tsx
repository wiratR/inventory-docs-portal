import { Input, Label } from "../components/Field";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Card from "../components/Card";
import Toast from "../components/Toast";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const { login } = useAuth();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const from = loc?.state?.from || "/documents";

  async function onSubmit() {
    setLoading(true);
    try {
      await login(username.trim(), password);
      nav(from, { replace: true });
    } catch (e: any) {
      setToast(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Toast message={toast} onClose={() => setToast(null)} />
      <Card title="Login">
        <div className="space-y-3">
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
          </div>

          <Button
            disabled={loading}
            onClick={onSubmit}
            className="w-full bg-gray-900 text-white hover:bg-gray-800"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="rounded-lg border bg-gray-50 p-3 text-xs text-gray-600">
            <div className="font-semibold mb-1">Dev accounts</div>
            <div>admin / admin</div>
            <div>uploader / uploader</div>
            <div>viewer / viewer</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
