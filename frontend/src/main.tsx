import "./index.css";

import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import React from "react";
import ReactDOM from "react-dom/client";
import { ToastProvider } from "./components/Toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
