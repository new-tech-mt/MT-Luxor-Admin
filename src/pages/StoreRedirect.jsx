import { Navigate } from "react-router-dom";

export default function StoreRedirect() {
  window.location.href = "/";
  return <Navigate to="/" replace />;
}
