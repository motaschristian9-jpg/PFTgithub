import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import axios from "../api/axios";

const KEYS = {
  transactions: (params) => ["transactions", params],
  allTransactions: ["transactions"],
  budgets: ["budgets"],
  savings: ["savings"],
};

const fetchTransactions = async (params) => {
  const response = await axios.get("/transactions", { params });
  return response.data;
};

const createTransaction = async (data) => {
  const response = await axios.post("/transactions", data);
  return response.data;
};

const updateTransaction = async ({ id, data }) => {
  const response = await axios.put(`/transactions/${id}`, data);
  return response.data;
};

const deleteTransaction = async (id) => {
  const response = await axios.delete(`/transactions/${id}`);
  return response.data;
};

export const useTransactions = (params = {}, options = {}) => {
  return useQuery({
    queryKey: KEYS.transactions(params),
    queryFn: () => fetchTransactions(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

const invalidateFinancialData = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: KEYS.allTransactions });
  queryClient.invalidateQueries({ queryKey: KEYS.budgets });
  queryClient.invalidateQueries({ queryKey: KEYS.savings });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSettled: () => {
      // Always refetch after error or success
      invalidateFinancialData(queryClient);
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransaction,
    onSettled: () => {
      invalidateFinancialData(queryClient);
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSettled: () => {
      invalidateFinancialData(queryClient);
    },
  });
};
