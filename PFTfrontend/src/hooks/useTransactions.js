import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios"; // Assumes your custom axios instance is here

// API Call
const fetchTransactions = async (params) => {
  const response = await axios.get("/transactions", { params });
  return response.data;
};

// Hook
export const useTransactions = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => fetchTransactions(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Mutations
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      axios.post("/transactions", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["budgets"]);
      queryClient.invalidateQueries(["savings"]);
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      axios.put(`/transactions/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["budgets"]);
      queryClient.invalidateQueries(["savings"]);
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      axios.delete(`/transactions/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["budgets"]);
      queryClient.invalidateQueries(["savings"]);
    },
  });
};
