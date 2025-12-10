import { useMemo } from "react";
import { getToken } from "../api/axios";
import { useUserContext } from "../context/UserContext";

export const useAuth = () => {
  // Extract setUser from context
  const { user, setUser, isLoading } = useUserContext();

  return useMemo(() => {
    const token = getToken();
    // Derived state: authenticated only if we have both token and user data
    const isAuthenticated = !!token && !!user;

    return {
      isAuthenticated,
      isLoading,
      user,
      setUser, // Expose setUser for optimistic updates
      error: null,
    };
  }, [user, setUser, isLoading]);
};
