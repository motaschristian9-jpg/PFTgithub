import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../api/fetch";
import { getToken } from "../api/axios"; // Import getToken

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchProfile,
    enabled: !!getToken(), // Only fetch if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useAuth = () => {
  const token = getToken();
  const { data: user, isLoading, error } = useUser();

  const isAuthenticated = !!token && !!user && !error;

  return {
    isAuthenticated,
    isLoading: isLoading && !!token, // Only show loading if we have a token
    user,
    error,
  };
};
