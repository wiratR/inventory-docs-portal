// src/pages/DocumentsPage.tsx
import React, { useState } from "react";

import { useAuth } from "../auth/AuthContext";

export default function DocumentsPage() {
  const { state, logout } = useAuth();
  const role = state!.user.role;

  const canUpload = role === "admin" || role === "uploader";

  const [sku, setSku] = useState("");
  const [docType, setDocType] = useState("datasheet");
  const [version, setVersion] = useState("v1");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onUpload() {
    setMsg(null);
    if (!file) return setMsg("Please select file");

    const fd = new FormData();
    fd.append("sku", sku);
    fd.append("docType", docType);
    fd.append("version", version);
    fd.append("file", file);

    const res = await fetch((import.meta.env.VITE_API_BASE ?? "http://localhost:8080") + "/api/documents", {
      method: "POST",
      headers: { Authorization: `Bearer ${state!.token}` },
      body: fd,
    });

    const text = await res.text();
    if (!res.ok) {
      setMsg(`Upload failed: ${text}`);
      return;
    }
    setMsg(`Uploaded: ${text}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-semibold">Documents</div>
            <div className="text-xs text-slate-500">
              {state!.user.username} • role: {role}
            </div>
          </div>
          <button className="text-sm px-3 py-2 rounded-lg border" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* ✅ Upload section: ซ่อนตาม role */}
        {canUpload ? (
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <div className="font-medium">Upload document</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="rounded-lg border px-3 py-2" placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
              <input className="rounded-lg border px-3 py-2" placeholder="docType" value={docType} onChange={(e) => setDocType(e.target.value)} />
              <input className="rounded-lg border px-3 py-2" placeholder="version" value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>

            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <button className="rounded-lg bg-slate-900 text-white px-4 py-2" onClick={onUpload}>
              Upload
            </button>

            {msg && <div className="text-sm text-slate-700 break-all">{msg}</div>}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-4 text-sm text-slate-600">
            You have <b>viewer</b> access. Upload is disabled.
          </div>
        )}

        {/* TODO: list documents table (เมื่อ backend มี GET /documents) */}
        <div className="bg-white rounded-2xl shadow p-4 text-sm text-slate-600">
          Document list coming next (ต้องเพิ่ม endpoint list ใน backend ก่อน)
        </div>
      </main>
    </div>
  );
}
