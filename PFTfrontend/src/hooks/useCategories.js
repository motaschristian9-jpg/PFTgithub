import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/transactions";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
};
