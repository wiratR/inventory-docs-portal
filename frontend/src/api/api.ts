// src/api/api.ts

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8080";

export type ApiOptions = {
  method?: string;
  token?: string;
  body?: any;
  headers?: Record<string, string>;
};

/**
 * JSON / FormData API fetch
 */
export async function apiFetch<T>(
  path: string,
  opt: ApiOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    ...(opt.headers || {}),
  };

  // 🔐 Bearer token
  if (opt.token) {
    headers["Authorization"] = `Bearer ${opt.token}`;
  }

  const isForm =
    typeof FormData !== "undefined" && opt.body instanceof FormData;

  // ⚠️ อย่าตั้ง Content-Type เองถ้าเป็น FormData
  if (!isForm && opt.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const body =
    isForm
      ? opt.body
      : opt.body !== undefined
      ? typeof opt.body === "string"
        ? opt.body
        : JSON.stringify(opt.body)
      : undefined;

  const res = await fetch(url, {
    method: opt.method || "GET",
    headers,
    body,
    credentials: "omit", // เราใช้ JWT ไม่ใช้ cookie
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    const err: any = new Error(msg || res.statusText);
    err.status = res.status;
    throw err;
  }

  // ถ้าไม่มี body (204)
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

/**
 * 🔽 สำหรับ View / Download file (Blob)
 * ใช้คู่กับ URL.createObjectURL(blob)
 */
export async function apiFetchBlob(
  path: string,
  opt: ApiOptions = {}
): Promise<Blob> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    ...(opt.headers || {}),
  };

  if (opt.token) {
    headers["Authorization"] = `Bearer ${opt.token}`;
  }

  const res = await fetch(url, {
    method: opt.method || "GET",
    headers,
    credentials: "omit",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    const err: any = new Error(msg || res.statusText);
    err.status = res.status;
    throw err;
  }

  return await res.blob();
}
