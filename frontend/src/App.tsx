import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DocumentsPage from "./pages/DocumentsPage";
import LoginPage from "./pages/LoginPage";
import React from "react";
import { useAuth } from "./auth/AuthContext";

function Protected({ children }: { children: React.ReactElement }) {
  const { state } = useAuth();
  if (!state?.token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/documents"
          element={
            <Protected>
              <DocumentsPage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/documents" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
