import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../api/budgets";

export const useBudget = (status = "active", options = {}) => {
  return useQuery({
    queryKey: ["budgets", status],
    queryFn: () => getBudgets({ status }),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true, // Prevents flickering when switching tabs
    select: (data) => {
      const budgets = Array.isArray(data?.data) ? data.data : [];
      return {
        ...data,
        data: budgets,
        totals: {
          totalAmount: budgets.reduce(
            (sum, budget) => sum + parseFloat(budget.amount || 0),
            0
          ),
        },
      };
    },
    ...options,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      // Invalidate all budget lists (active, history, all)
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateBudget(id, data),
    onMutate: async ({ id, data }) => {
      // 1. Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ["budgets"] });

      // 2. Snapshot previous data
      const previousData = queryClient.getQueriesData({
        queryKey: ["budgets"],
      });

      // 3. Optimistically update
      queryClient.setQueriesData({ queryKey: ["budgets"] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((b) => (b.id === id ? { ...b, ...data } : b)),
        };
      });

      return { previousData };
    },
    onError: (err, vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudget,
    onMutate: async (deletedId) => {
      // 1. Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ["budgets"] });

      // 2. Snapshot previous data
      const previousData = queryClient.getQueriesData({
        queryKey: ["budgets"],
      });

      // 3. Optimistically update (Remove item from list)
      queryClient.setQueriesData({ queryKey: ["budgets"] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((b) => b.id !== deletedId),
        };
      });

      return { previousData };
    },
    onError: (err, vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
