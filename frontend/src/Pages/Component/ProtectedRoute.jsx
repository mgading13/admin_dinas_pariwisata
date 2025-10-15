import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token"); // token dari hasil login

  if (!token) {
    // Jika belum login, redirect ke halaman login
    return <Navigate to="/" replace />;
  }

  // Jika sudah login, tampilkan halaman anaknya (misalnya Dashboard)
  return children;
}

export default ProtectedRoute;
