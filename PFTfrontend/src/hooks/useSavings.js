import { useQuery } from "@tanstack/react-query";
import { getSavings } from "../api/savings";

export function useSavings(params = {}, options = {}) {
  return useQuery({
    queryKey: ["savings", params],
    queryFn: () => getSavings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
