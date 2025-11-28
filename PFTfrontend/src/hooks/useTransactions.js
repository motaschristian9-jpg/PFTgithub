import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactions";

export const useTransactions = (params = {}, options = {}) => {
  // options can contain: { fetchAll: boolean } to fetch all transactions without pagination
  const queryParams = { ...params };
  if (options.fetchAll) {
    // Remove pagination params to fetch all transactions
    delete queryParams.page;
    delete queryParams.per_page;
  } else {
    // Default per_page if not provided
    if (!queryParams.per_page) {
      queryParams.per_page = 20;
    }
  }

  return useQuery({
    queryKey: ["transactions", queryParams],
    queryFn: () => fetchTransactions(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => ({
      ...data,
      totals: {
        income: parseFloat(data.totals?.income || 0),
        expenses: parseFloat(data.totals?.expenses || 0),
      },
    }),
    ...options,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // 1. Refetch Transactions (so the new expense appears in the list)
      queryClient.invalidateQueries(["transactions"]);

      // 2. Refetch Budgets (so the progress bars and "Remaining" amounts update)
      queryClient.invalidateQueries(["budgets"]);
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(["transactions"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["transactions"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((transaction) =>
            transaction.id === id ? { ...transaction, ...data } : transaction
          ),
          totals: {
            income: old.totals?.income || 0,
            expenses: old.totals?.expenses || 0,
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousTransactions };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions"],
          context.previousTransactions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (deletedTransactionId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(["transactions"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["transactions"], (old) => {
        if (!old) return old;
        const transactionToDelete = old.data.find(
          (t) => t.id === deletedTransactionId
        );
        return {
          ...old,
          data: old.data.filter(
            (transaction) => transaction.id !== deletedTransactionId
          ),
          totals: {
            income:
              transactionToDelete?.type === "income"
                ? (old.totals?.income || 0) -
                  parseFloat(transactionToDelete.amount)
                : old.totals?.income || 0,
            expenses:
              transactionToDelete?.type === "expense"
                ? (old.totals?.expenses || 0) -
                  parseFloat(transactionToDelete.amount)
                : old.totals?.expenses || 0,
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousTransactions };
    },
    onError: (err, deletedTransactionId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions"],
          context.previousTransactions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
