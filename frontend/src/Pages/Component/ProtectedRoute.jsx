import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }) => {
  const token = sessionStorage.getItem("token");
  const admin = JSON.parse(sessionStorage.getItem("admin"));

  // jika belum login
  if (!token || !admin) {
    return <Navigate to="/" replace />;
  }

  // jika role tidak sesuai
  if (roleRequired && admin.role !== roleRequired) {
    return <Navigate to="/admin/grafik-pengunjung" replace />;
  }

  return children;
};

export default ProtectedRoute;