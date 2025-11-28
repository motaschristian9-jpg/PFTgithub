import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgets';

// Hook to fetch budgets based on status (active, history, all)
export const useBudget = (status = "active", options = {}) => {
  return useQuery({
    queryKey: ["budgets", status],
    queryFn: () => getBudgets({ status }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      const budgets = Array.isArray(data?.data) ? data.data : [];
      return {
        ...data,
        data: budgets,
        totals: {
          totalAmount: budgets.reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0),
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
      // Invalidate both lists so the UI updates immediately
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};