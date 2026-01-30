import { API_BASE, apiFetch } from "../api/api";
import { Badge, Button, Card, CardBody, Input, Modal, Select } from "../components/ui";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";

type DocumentItem = {
  id: string;
  sku: string;
  docType: string;
  version: string;
  title: string;
  status: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  createdBy: string;
  createdAt: string;
};

type ListResp = {
  items: DocumentItem[];
  total: number;
  limit: number;
  offset: number;
};

const DOC_TYPES = ["datasheet", "manual", "certificate", "other"];

export default function DocumentsPage() {
  const { state, logout, role, canUpload } = useAuth();
  const { push } = useToast();

  const token = state?.token || "";

  // toolbar
  const [q, setQ] = useState("");
  const [docType, setDocType] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // pagination
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // data
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ListResp | null>(null);

  // upload modal
  const [openUpload, setOpenUpload] = useState(false);
  const [upSku, setUpSku] = useState("");
  const [upDocType, setUpDocType] = useState("datasheet");
  const [upVersion, setUpVersion] = useState("v1");
  const [upTitle, setUpTitle] = useState("");
  const [upFile, setUpFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (docType) p.set("docType", docType);
    p.set("sort", sort);
    p.set("order", order);
    p.set("limit", String(limit));
    p.set("offset", String(offset));
    return p.toString();
  }, [q, docType, sort, order, limit, offset]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<ListResp>(`/api/documents?${queryString}`, {
        method: "GET",
        token,
      });
      setData(res);
    } catch (err: any) {
      if (err?.status === 401) {
        push({ type: "error", message: "Session expired" });
        logout();
        return;
      }
      push({ type: "error", message: err?.message || "Load failed" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const openView = (id: string) => {
  const t = encodeURIComponent(token);
    window.open(
      `${API_BASE}/api/documents/${id}/view?token=${t}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const download = (id: string) => {
    const t = encodeURIComponent(token);
    window.open(
      `${API_BASE}/api/documents/${id}/download?token=${t}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const onUpload = async () => {
    if (!upSku.trim()) return push({ type: "error", message: "SKU is required" });
    if (!upDocType.trim()) return push({ type: "error", message: "DocType is required" });
    if (!upVersion.trim()) return push({ type: "error", message: "Version is required" });
    if (!upFile) return push({ type: "error", message: "File is required" });

    setUploading(true);
    try {
      const form = new FormData();
      form.append("sku", upSku.trim());
      form.append("docType", upDocType.trim());
      form.append("version", upVersion.trim());
      if (upTitle.trim()) form.append("title", upTitle.trim());
      form.append("file", upFile);

      await apiFetch(`/api/documents`, {
        method: "POST",
        body: form,
        token,
      });

      push({ type: "success", message: "Uploaded" });
      setOpenUpload(false);
      setUpSku("");
      setUpDocType("datasheet");
      setUpVersion("v1");
      setUpTitle("");
      setUpFile(null);
      setOffset(0);
      await load();
    } catch (err: any) {
      push({ type: "error", message: err?.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const total = data?.total ?? 0;
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-slate-950">
      {/* top bar */}
      <div className="sticky top-0 z-40 backdrop-blur bg-slate-950/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-white font-semibold">Documents</div>
            <div className="text-white/60 text-xs">
              Role: <span className="text-white/80">{role}</span>
            </div>
          </div>

          {canUpload ? (
            <Button onClick={() => setOpenUpload(true)}>+ Upload</Button>
          ) : (
            <div className="text-xs text-white/50 border border-white/10 rounded-xl px-3 py-2 bg-white/5">
              Viewer can’t upload
            </div>
          )}

          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* toolbar */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <Input
                  label="Search (SKU / Title)"
                  value={q}
                  onChange={(e) => {
                    setOffset(0);
                    setQ(e.target.value);
                  }}
                  placeholder="e.g. ABC123, GRG..."
                />
              </div>

              <div className="md:col-span-3">
                <Select
                  label="Doc Type"
                  value={docType}
                  onChange={(e) => {
                    setOffset(0);
                    setDocType(e.target.value);
                  }}
                >
                  <option value="">All</option>
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="md:col-span-2">
                <Select
                  label="Sort"
                  value={sort}
                  onChange={(e) => {
                    setOffset(0);
                    setSort(e.target.value);
                  }}
                >
                  <option value="createdAt">createdAt</option>
                  <option value="sku">sku</option>
                  <option value="docType">docType</option>
                  <option value="version">version</option>
                  <option value="title">title</option>
                </Select>
              </div>

              <div className="md:col-span-2 flex items-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOffset(0);
                    setOrder(order === "asc" ? "desc" : "asc");
                  }}
                >
                  Order: {order.toUpperCase()}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* table */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white/80 text-sm">{loading ? "Loading..." : `Total: ${total}`}</div>

              <div className="flex items-center gap-2">
                <Select
                  value={String(limit)}
                  onChange={(e) => {
                    setOffset(0);
                    setLimit(Number(e.target.value));
                  }}
                >
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>

                <Badge>
                  Page {page} / {pageCount}
                </Badge>

                <Button
                  variant="ghost"
                  disabled={offset <= 0}
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                >
                  Prev
                </Button>
                <Button
                  variant="ghost"
                  disabled={offset + limit >= total}
                  onClick={() => setOffset(offset + limit)}
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-white/60">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2">SKU</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Version</th>
                    <th className="text-left py-2">Title</th>
                    <th className="text-left py-2">Created</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-white/85">
                  {(data?.items || []).map((d) => (
                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 font-medium">{d.sku}</td>
                      <td className="py-2">
                        <Badge>{d.docType}</Badge>
                      </td>
                      <td className="py-2">{d.version}</td>
                      <td className="py-2">
                        <div className="max-w-[480px] truncate" title={d.title}>
                          {d.title}
                        </div>
                        <div className="text-xs text-white/50 truncate" title={d.fileName}>
                          {d.fileName} • {Math.round(d.fileSize / 1024)} KB
                        </div>
                      </td>
                      <td className="py-2 text-white/70">{new Date(d.createdAt).toLocaleString()}</td>
                      <td className="py-2">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => openView(d.id)}>
                            View
                          </Button>
                          <Button variant="ghost" onClick={() => download(d.id)}>
                            Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && (data?.items?.length || 0) === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-white/50">
                        No documents found
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* upload modal */}
      <Modal open={openUpload} title="Upload Document" onClose={() => setOpenUpload(false)}>
        {!canUpload ? (
          <div className="text-white/70">Forbidden (role: viewer)</div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="SKU" value={upSku} onChange={(e) => setUpSku(e.target.value)} />
              <Select label="Doc Type" value={upDocType} onChange={(e) => setUpDocType(e.target.value)}>
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              <Input label="Version" value={upVersion} onChange={(e) => setUpVersion(e.target.value)} />
              <Input label="Title (optional)" value={upTitle} onChange={(e) => setUpTitle(e.target.value)} />
            </div>

            <div>
              <div className="mb-1 text-xs text-white/70">File</div>
              <input
                type="file"
                onChange={(e) => setUpFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-white/80 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white file:hover:bg-white/15"
              />
              {upFile ? (
                <div className="mt-1 text-xs text-white/50">
                  Selected: {upFile.name} ({Math.round(upFile.size / 1024)} KB)
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setOpenUpload(false)}>
                Cancel
              </Button>
              <Button onClick={onUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
