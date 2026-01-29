import { Navigate, useLocation } from "react-router-dom";

import type { JSX } from "react";
import { isAuthed } from "./auth";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const loc = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return children;
}
