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
    onSuccess: () => {
      invalidateFinancialData(queryClient);
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransaction,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: KEYS.allTransactions });

      const previousTransactions = queryClient.getQueryData(
        KEYS.allTransactions
      );

      queryClient.setQueriesData(
        { queryKey: KEYS.allTransactions },
        (oldData) => {
          if (!oldData) return oldData;

          if (oldData.data) {
            return {
              ...oldData,
              data: oldData.data.map((item) =>
                item.id === id ? { ...item, ...data } : item
              ),
            };
          }

          return Array.isArray(oldData)
            ? oldData.map((item) =>
                item.id === id ? { ...item, ...data } : item
              )
            : oldData;
        }
      );

      return { previousTransactions };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData(
          { queryKey: KEYS.allTransactions },
          context.previousTransactions
        );
      }
    },
    onSettled: () => {
      invalidateFinancialData(queryClient);
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEYS.allTransactions });

      const previousTransactions = queryClient.getQueryData(
        KEYS.allTransactions
      );

      queryClient.setQueriesData(
        { queryKey: KEYS.allTransactions },
        (oldData) => {
          if (!oldData) return oldData;

          if (oldData.data) {
            return {
              ...oldData,
              data: oldData.data.filter((item) => item.id !== id),
            };
          }

          return Array.isArray(oldData)
            ? oldData.filter((item) => item.id !== id)
            : oldData;
        }
      );

      return { previousTransactions };
    },
    onError: (err, id, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData(
          { queryKey: KEYS.allTransactions },
          context.previousTransactions
        );
      }
    },
    onSettled: () => {
      invalidateFinancialData(queryClient);
    },
  });
};
