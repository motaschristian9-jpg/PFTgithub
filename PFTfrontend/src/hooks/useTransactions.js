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
    onMutate: async (newData) => {
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: KEYS.allTransactions });
      await queryClient.cancelQueries({ queryKey: ["budgets", "active"] });
      await queryClient.cancelQueries({ queryKey: ["savings", "active"] });

      // 2. Snapshot previous values
      const previousTransactions = queryClient.getQueryData(KEYS.allTransactions);
      const previousBudgets = queryClient.getQueryData(["budgets", "active"]);
      const previousSavings = queryClient.getQueryData(["savings", "active"]);

      // 3. Optimistically update Transactions
      queryClient.setQueriesData({ queryKey: KEYS.allTransactions }, (old) => {
        const optimisticTx = {
          id: `temp-${Date.now()}`,
          ...newData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (!old) return { data: [optimisticTx] };

        if (old.data && Array.isArray(old.data)) {
          const newTotals = { ...old.totals };
          if (newData.type === 'income') {
            newTotals.income = (parseFloat(newTotals.income || 0) + parseFloat(newData.amount)).toString();
          } else if (newData.type === 'expense') {
            newTotals.expenses = (parseFloat(newTotals.expenses || 0) + parseFloat(newData.amount)).toString();
          }

          return {
            ...old,
            data: [optimisticTx, ...old.data],
            totals: newTotals,
          };
        }

        return Array.isArray(old) ? [optimisticTx, ...old] : [optimisticTx];
      });

      // 4. Optimistically update Budgets
      if (newData.budget_id && newData.type === 'expense') {
        queryClient.setQueriesData({ queryKey: ["budgets", "active"] }, (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map(b => {
              if (b.id == newData.budget_id) {
                const currentSpent = parseFloat(b.transactions_sum_amount || b.total_spent || 0);
                return {
                  ...b,
                  transactions_sum_amount: currentSpent + parseFloat(newData.amount)
                };
              }
              return b;
            })
          };
        });
      }

      // 5. Optimistically update Savings
      if (newData.saving_goal_id) {
        queryClient.setQueriesData({ queryKey: ["savings", "active"] }, (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map(s => {
              if (s.id == newData.saving_goal_id) {
                const currentAmount = parseFloat(s.current_amount || 0);
                const change = parseFloat(newData.amount);
                // Expense (Deposit) -> Increase; Income (Withdrawal) -> Decrease
                const newAmount = newData.type === 'expense' 
                  ? currentAmount + change 
                  : currentAmount - change;
                
                return {
                  ...s,
                  current_amount: newAmount
                };
              }
              return s;
            })
          };
        });
      }

      return { previousTransactions, previousBudgets, previousSavings };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData({ queryKey: KEYS.allTransactions }, context.previousTransactions);
      }
      if (context?.previousBudgets) {
        queryClient.setQueriesData({ queryKey: ["budgets", "active"] }, context.previousBudgets);
      }
      if (context?.previousSavings) {
        queryClient.setQueriesData({ queryKey: ["savings", "active"] }, context.previousSavings);
      }
    },
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
    onMutate: async ({ id, data }) => {
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: KEYS.allTransactions });
      await queryClient.cancelQueries({ queryKey: ["budgets", "active"] });
      // We don't optimistically update savings on edit yet as the modal doesn't support editing savings allocation directly

      // 2. Snapshot previous values
      const previousTransactions = queryClient.getQueryData(KEYS.allTransactions);
      const previousBudgets = queryClient.getQueryData(["budgets", "active"]);

      // 3. Find the old transaction
      let oldTx = null;
      if (previousTransactions?.data) {
        oldTx = previousTransactions.data.find((t) => t.id === id);
      } else if (Array.isArray(previousTransactions)) {
        oldTx = previousTransactions.find((t) => t.id === id);
      }

      // 4. Optimistically update Transactions
      queryClient.setQueriesData({ queryKey: KEYS.allTransactions }, (oldData) => {
        if (!oldData) return oldData;
        const updater = (item) => item.id === id ? { ...item, ...data } : item;
        
        if (oldData.data) {
          return { ...oldData, data: oldData.data.map(updater) };
        }
        return Array.isArray(oldData) ? oldData.map(updater) : oldData;
      });

      // 5. Optimistically update Budgets
      if (oldTx) {
        queryClient.setQueriesData({ queryKey: ["budgets", "active"] }, (old) => {
          if (!old || !old.data) return old;
          
          return {
            ...old,
            data: old.data.map(b => {
              let newSpent = parseFloat(b.transactions_sum_amount || b.total_spent || 0);
              let changed = false;

              // Reverse old transaction effect
              if (oldTx.budget_id == b.id && oldTx.type === 'expense') {
                newSpent -= parseFloat(oldTx.amount);
                changed = true;
              }

              // Apply new transaction effect
              // Use data.budget_id if present, otherwise fall back to oldTx.budget_id (unless explicitly nullified)
              const targetBudgetId = data.budget_id !== undefined ? data.budget_id : oldTx.budget_id;
              const targetType = data.type || oldTx.type;
              const targetAmount = data.amount !== undefined ? data.amount : oldTx.amount;

              if (targetBudgetId == b.id && targetType === 'expense') {
                newSpent += parseFloat(targetAmount);
                changed = true;
              }

              if (changed) {
                return {
                  ...b,
                  transactions_sum_amount: Math.max(0, newSpent)
                };
              }
              return b;
            })
          };
        });
      }

      return { previousTransactions, previousBudgets };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData({ queryKey: KEYS.allTransactions }, context.previousTransactions);
      }
      if (context?.previousBudgets) {
        queryClient.setQueriesData({ queryKey: ["budgets", "active"] }, context.previousBudgets);
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
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: KEYS.allTransactions });
      await queryClient.cancelQueries({ queryKey: ["budgets", "active"] });
      await queryClient.cancelQueries({ queryKey: ["savings", "active"] });

      // 2. Snapshot previous values
      const previousTransactions = queryClient.getQueryData(KEYS.allTransactions);
      const previousBudgets = queryClient.getQueryData(["budgets", "active"]);
      const previousSavings = queryClient.getQueryData(["savings", "active"]);

      // 3. Find the transaction to be deleted
      let deletedTx = null;
      if (previousTransactions?.data) {
        deletedTx = previousTransactions.data.find((t) => t.id === id);
      } else if (Array.isArray(previousTransactions)) {
        deletedTx = previousTransactions.find((t) => t.id === id);
      }

      // 4. Optimistically update Transactions
      queryClient.setQueriesData({ queryKey: KEYS.allTransactions }, (oldData) => {
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
      });

      // 5. Optimistically update Budgets & Savings if we found the tx
      if (deletedTx) {
        // Update Budgets
        if (deletedTx.budget_id && deletedTx.type === 'expense') {
          queryClient.setQueriesData({ queryKey: ["budgets", "active"] }, (old) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: old.data.map(b => {
                if (b.id == deletedTx.budget_id) {
                  const currentSpent = parseFloat(b.transactions_sum_amount || b.total_spent || 0);
                  return {
                    ...b,
                    transactions_sum_amount: Math.max(0, currentSpent - parseFloat(deletedTx.amount))
                  };
                }
                return b;
              })
            };
          });
        }

        // Update Savings
        if (deletedTx.saving_goal_id) {
          queryClient.setQueriesData({ queryKey: ["savings", "active"] }, (old) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: old.data.map(s => {
                if (s.id == deletedTx.saving_goal_id) {
                  const currentAmount = parseFloat(s.current_amount || 0);
                  const change = parseFloat(deletedTx.amount);
                  // Reversing the effect:
                  // If it was Expense (Deposit), we subtract (Undo deposit)
                  // If it was Income (Withdrawal), we add (Undo withdrawal)
                  const newAmount = deletedTx.type === 'expense'
                    ? Math.max(0, currentAmount - change)
                    : currentAmount + change;
                  
                  return {
                    ...s,
                    current_amount: newAmount
                  };
                }
                return s;
              })
            };
          });
        }
      }

      return { previousTransactions, previousBudgets, previousSavings };
    },
    onError: (err, id, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData({ queryKey: KEYS.allTransactions }, context.previousTransactions);
      }
      if (context?.previousBudgets) {
        queryClient.setQueriesData({ queryKey: ["budgets", "active"] }, context.previousBudgets);
      }
      if (context?.previousSavings) {
        queryClient.setQueriesData({ queryKey: ["savings", "active"] }, context.previousSavings);
      }
    },
    onSettled: () => {
      invalidateFinancialData(queryClient);
    },
  });
};
