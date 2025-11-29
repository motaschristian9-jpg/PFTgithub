import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactions";

export const useTransactions = (params = {}, options = {}) => {
  // 1. Memoize params to prevent infinite re-fetching loops
  const queryParams = useMemo(() => {
    const curr = { ...params };
    if (options.fetchAll) {
      delete curr.page;
      delete curr.per_page;
    } else if (!curr.per_page) {
      curr.per_page = 20;
    }
    return curr;
  }, [params, options.fetchAll]);

  return useQuery({
    queryKey: ["transactions", queryParams],
    queryFn: () => fetchTransactions(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // Prevents UI flickering when changing pages
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
      // Invalidate both transactions and budgets to sync UI
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onMutate: async ({ id, data }) => {
      // 1. Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // 2. Snapshot previous data from all transaction queries
      const previousData = queryClient.getQueriesData({
        queryKey: ["transactions"],
      });

      // 3. Optimistically update all matching caches
      queryClient.setQueriesData({ queryKey: ["transactions"] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((t) => (t.id === id ? { ...t, ...data } : t)),
          // Note: Recalculating totals optimistically on Edit is complex/risky
          // We rely on invalidation (onSettled) for exact math
        };
      });

      return { previousData };
    },
    onError: (err, vars, context) => {
      // Rollback
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const previousData = queryClient.getQueriesData({
        queryKey: ["transactions"],
      });

      queryClient.setQueriesData({ queryKey: ["transactions"] }, (old) => {
        if (!old?.data) return old;

        const transactionToDelete = old.data.find((t) => t.id === deletedId);
        if (!transactionToDelete) return old;

        return {
          ...old,
          data: old.data.filter((t) => t.id !== deletedId),
          totals: {
            income:
              transactionToDelete.type === "income"
                ? (old.totals?.income || 0) -
                  parseFloat(transactionToDelete.amount)
                : old.totals?.income || 0,
            expenses:
              transactionToDelete.type === "expense"
                ? (old.totals?.expenses || 0) -
                  parseFloat(transactionToDelete.amount)
                : old.totals?.expenses || 0,
          },
        };
      });

      return { previousData };
    },
    onError: (err, vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
