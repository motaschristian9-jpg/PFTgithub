import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactions';

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
    queryKey: ['transactions', queryParams],
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
    onMutate: async (newTransaction) => {
      // Cancel any outgoing refetches for all 'transactions' queries regardless of params
      await queryClient.cancelQueries({ queryKey: ['transactions'], exact: false });

      // Snapshot previous queries for rollback
      const previousQueries = queryClient.getQueriesData(['transactions']);

      // Generate temp ID for optimistic update
      const tempId = `temp-${Date.now()}`;

      // Create optimistic transaction
      const optimisticTransaction = {
        ...newTransaction,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: null, // Will be updated when real data comes
      };

      // Optimistically update all matching cached queries
      previousQueries.forEach(([key, old]) => {
        queryClient.setQueryData(key, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: [optimisticTransaction, ...oldData.data],
            totals: {
              income: newTransaction.type === 'income'
                ? (oldData.totals?.income || 0) + parseFloat(newTransaction.amount)
                : oldData.totals?.income || 0,
              expenses: newTransaction.type === 'expense'
                ? (oldData.totals?.expenses || 0) + parseFloat(newTransaction.amount)
                : oldData.totals?.expenses || 0,
            },
          };
        });
      });

      // Return context for rollback
      return { previousQueries, tempId };
    },
    onError: (err, newTransaction, context) => {
      // Rollback on error for all cached queries
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, oldData]) => {
          queryClient.setQueryData(key, oldData);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Replace temp transaction with real data in all matching cached queries
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key]) => {
          queryClient.setQueryData(key, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((transaction) =>
                transaction.id === context.tempId ? data : transaction
              ),
            };
          });
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(['transactions']);

      // Optimistically update to the new value
      queryClient.setQueryData(['transactions'], (old) => {
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
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (deletedTransactionId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData(['transactions']);

      // Optimistically update to the new value
      queryClient.setQueryData(['transactions'], (old) => {
        if (!old) return old;
        const transactionToDelete = old.data.find(t => t.id === deletedTransactionId);
        return {
          ...old,
          data: old.data.filter((transaction) => transaction.id !== deletedTransactionId),
          totals: {
            income: transactionToDelete?.type === 'income'
              ? (old.totals?.income || 0) - parseFloat(transactionToDelete.amount)
              : old.totals?.income || 0,
            expenses: transactionToDelete?.type === 'expense'
              ? (old.totals?.expenses || 0) - parseFloat(transactionToDelete.amount)
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
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

