import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import LoadingScreen from "./LoadingScreen.jsx";

const PrivateRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;
