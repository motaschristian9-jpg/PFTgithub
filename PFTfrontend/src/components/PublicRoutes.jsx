import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const PublicRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a loading spinner component
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default PublicRoutes;
