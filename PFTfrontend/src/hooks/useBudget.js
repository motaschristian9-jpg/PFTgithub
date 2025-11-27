import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgets';

export const useBudget = (status = "active", options = {}) => {
  return useQuery({
    queryKey: ["budgets", status],
    queryFn: () => getBudgets({ status }),
    staleTime: 5 * 60 * 1000,
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
    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: ["budgets"] });

      const previousBudgets = queryClient.getQueriesData(["budgets"]);
      const tempId = `temp-${Date.now()}`;
      const optimisticBudget = {
        ...newBudget,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      previousBudgets.forEach(([key, old]) => {
        if (!old) return;
        queryClient.setQueryData(key, {
          ...old,
          data: [optimisticBudget, ...old.data],
          totals: {
            totalAmount: (old.totals?.totalAmount || 0) + parseFloat(newBudget.amount || 0),
          },
        });
      });

      return { previousBudgets, tempId };
    },
    onError: (err, newBudget, context) => {
      if (context?.previousBudgets) {
        context.previousBudgets.forEach(([key, old]) => {
          queryClient.setQueryData(key, old);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      if (context?.previousBudgets) {
        context.previousBudgets.forEach(([key, old]) => {
          queryClient.setQueryData(key, {
            ...old,
            data: old.data.map((budget) => (budget.id === context.tempId ? data : budget)),
          });
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBudget(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['budgets'] });
      const previousBudgets = queryClient.getQueriesData(['budgets']);

      previousBudgets.forEach(([key, old]) => {
        if (!old) return;
        queryClient.setQueryData(key, {
          ...old,
          data: old.data.map((budget) =>
            budget.id === id ? { ...budget, ...data } : budget
          ),
          totals: {
            totalAmount: old.totals?.totalAmount || 0,
          },
        });
      });

      return { previousBudgets };
    },
    onError: (err, variables, context) => {
      if (context?.previousBudgets) {
        context.previousBudgets.forEach(([key, old]) => {
          queryClient.setQueryData(key, old);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onMutate: async (deletedBudgetId) => {
      await queryClient.cancelQueries({ queryKey: ['budgets'] });
      const previousBudgets = queryClient.getQueriesData(['budgets']);

      previousBudgets.forEach(([key, old]) => {
        if (!old) return;
        const budgetToDelete = old.data.find(b => b.id === deletedBudgetId);
        queryClient.setQueryData(key, {
          ...old,
          data: old.data.filter(b => b.id !== deletedBudgetId),
          totals: {
            totalAmount: budgetToDelete
              ? (old.totals?.totalAmount || 0) - parseFloat(budgetToDelete.amount || 0)
              : old.totals?.totalAmount || 0,
          },
        });
      });

      return { previousBudgets };
    },
    onError: (err, deletedBudgetId, context) => {
      if (context?.previousBudgets) {
        context.previousBudgets.forEach(([key, old]) => {
          queryClient.setQueryData(key, old);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};
