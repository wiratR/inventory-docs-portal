const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export type DocumentDTO = {
  id: string;
  sku: string;
  docType: string;
  version: string;
  title: string;
  fileName: string;
  createdAt: string;
};

export function viewUrl(id: string) {
  return `${BASE}/api/documents/${id}/view`;
}

export function downloadUrl(id: string) {
  return `${BASE}/api/documents/${id}/download`;
}

export async function uploadDocument(form: {
  sku: string;
  docType: string;
  version: string;
  title?: string;
  file: File;
}) {
  const fd = new FormData();
  fd.append("sku", form.sku);
  fd.append("docType", form.docType);
  fd.append("version", form.version);
  if (form.title) fd.append("title", form.title);
  fd.append("file", form.file);

  const res = await fetch(`${BASE}/api/documents`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as DocumentDTO;
}
