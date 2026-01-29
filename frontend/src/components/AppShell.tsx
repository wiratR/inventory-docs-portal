import { Link } from "react-router-dom";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex justify-between">
          <Link to="/documents" className="font-semibold">
            Inventory Docs Portal
          </Link>
          <Link to="/upload" className="text-sm border rounded px-3 py-1">
            Upload
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
