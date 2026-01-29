import { Link } from "react-router-dom";
// src/pages/ForbiddenPage.tsx
import React from "react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="bg-white rounded-2xl shadow p-6 max-w-sm w-full">
        <div className="text-lg font-semibold">403 Forbidden</div>
        <p className="text-sm text-slate-600 mt-2">You don’t have permission to access this page.</p>
        <Link className="inline-block mt-4 text-sm underline" to="/documents">
          Back to Documents
        </Link>
      </div>
    </div>
  );
}
