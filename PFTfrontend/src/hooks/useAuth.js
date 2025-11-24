import { useContext } from "react";
import { getToken } from "../api/axios";
import { useUserContext } from "../context/UserContext";

export const useAuth = () => {
  const token = getToken();
  const { user, isLoading } = useUserContext();

  const isAuthenticated = !!token && !!user;

  return {
    isAuthenticated,
    isLoading, // Reflect loading state from user context
    user,
    error: null,
  };
};
