import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5">{children}</div>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white/85">
      {children}
    </span>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "ghost"
      ? "bg-white/0 hover:bg-white/10 border border-white/10 text-white"
      : "bg-white text-slate-950 hover:bg-white/90";
  return <button className={[base, styles, className || ""].join(" ")} {...props} />;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-xs text-white/70">{label}</div> : null}
      <input
        className={[
          "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none",
          "placeholder:text-white/30 focus:border-white/20 focus:bg-white/10",
          className || "",
        ].join(" ")}
        {...props}
      />
    </label>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-xs text-white/70">{label}</div> : null}
      <select
        className={[
          "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none",
          "focus:border-white/20 focus:bg-white/10",
          className || "",
        ].join(" ")}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
