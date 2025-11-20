import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return !!token;
};

export default function PublicRoutes() {
  return !isAuthenticated() ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
