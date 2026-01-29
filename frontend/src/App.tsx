import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import DocumentDetailPage from "./pages/DocumentDetailPage";
import DocumentsPage from "./pages/DocumentsPage";
import LoginPage from "./pages/LoginPage";
import RequireAuth from "./auth/RequireAuth";
import UploadPage from "./pages/UploadPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/documents" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/documents"
          element={
            <RequireAuth>
              <DocumentsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/upload"
          element={
            <RequireAuth>
              <UploadPage />
            </RequireAuth>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <RequireAuth>
              <DocumentDetailPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </AppShell>
  );
}
