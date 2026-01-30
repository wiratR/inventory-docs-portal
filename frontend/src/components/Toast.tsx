import React, { createContext, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: string; type: ToastType; message: string };

type ToastCtx = {
  push: (t: { type: ToastType; message: string }) => void;
};

const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = (t: { type: ToastType; message: string }) => {
    const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
    const item: ToastItem = { id, ...t };
    setItems((p) => [...p, item]);
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 2800);
  };

  const value = useMemo(() => ({ push }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[9999] space-y-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-2xl px-4 py-3 shadow-lg border text-sm",
              "bg-slate-950/90 backdrop-blur border-white/10 text-white",
              t.type === "success" ? "ring-1 ring-emerald-500/30" : "",
              t.type === "error" ? "ring-1 ring-rose-500/30" : "",
              t.type === "info" ? "ring-1 ring-sky-500/30" : "",
            ].join(" ")}
          >
            <div className="font-medium capitalize">{t.type}</div>
            <div className="text-white/75">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
