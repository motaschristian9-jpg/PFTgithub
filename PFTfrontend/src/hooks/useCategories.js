import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/categories";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Optimization: Don't auto-refetch static data on window focus to save bandwidth
    refetchOnWindowFocus: false,
    // Reliability: Retry twice if the request fails before throwing an error
    retry: 2,
  });
};
