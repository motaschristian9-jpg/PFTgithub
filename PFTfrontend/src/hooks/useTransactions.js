import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import axios from "../api/axios";
import { useAuth } from "./useAuth";

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

const createBulkTransactions = async ({ transactions }) => {
    const response = await axios.post("/transactions/bulk", { transactions });
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

const invalidateFinancialData = (queryClient, userId) => {
  queryClient.invalidateQueries({ queryKey: KEYS.allTransactions });
  queryClient.invalidateQueries({ queryKey: KEYS.budgets });
  // Explicitly invalidate active budgets so progress bars update instantly
  queryClient.invalidateQueries({ queryKey: ["budgets", "active"] });
  queryClient.invalidateQueries({ queryKey: KEYS.savings });
  
  // Invalidate notifications to show instant alerts for budget/savings events
  if (userId) {
      // REMOVED IMMEDIATE INVALIDATION TO PREVENT RACE CONDITION
      // queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      
      // Double check in case of delayed backend events
      setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      }, 2000);
  } else {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createTransaction,
    onMutate: async (newTransaction) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: KEYS.allTransactions });

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData({ queryKey: KEYS.allTransactions });

      // Optimistically update
      // Logic mirrors useSavingsCardModalLogic's optimisticUpdateGlobal
      queryClient.setQueriesData({ queryKey: KEYS.allTransactions }, (oldData) => {
        if (!oldData) return undefined;
        
        // Create a temporary transaction object
        const tempTx = {
            ...newTransaction,
            id: Date.now(), // Temporary ID
            pending: true,
            created_at: new Date().toISOString(),
        };

        const hasDuplicate = (list) => list.some((item) => item.id === tempTx.id);

        if (oldData.data && Array.isArray(oldData.data)) {
            if (hasDuplicate(oldData.data)) return oldData;
            return {
                ...oldData,
                data: [tempTx, ...oldData.data],
                total: (oldData.total || 0) + 1,
            };
        }

        if (Array.isArray(oldData)) {
             if (hasDuplicate(oldData)) return oldData;
             return [tempTx, ...oldData];
        }

        return oldData;
      });
      
      // --- OPTIMISTIC NOTIFICATION LOGIC ---
      // Check if this transaction pushes a budget to 100%
      let activeBudgetsList = [];
      
      // 1. Try "active" budgets key (used by Dashboard/BudgetPage)
      const activeBudgetsQuery = queryClient.getQueryData(["budgets", "active"]);
      if (activeBudgetsQuery?.data) {
          activeBudgetsList = activeBudgetsQuery.data;
      } else {
          // 2. Fallback: Try "all" budgets key (raw list or wrapped)
          const allBudgetsQuery = queryClient.getQueryData(["budgets"]);
          if (Array.isArray(allBudgetsQuery)) {
               // Assuming raw array
               activeBudgetsList = allBudgetsQuery.filter(b => b.status === "active");
          } else if (allBudgetsQuery?.data && Array.isArray(allBudgetsQuery.data)) {
               // Assuming wrapped in data object
               activeBudgetsList = allBudgetsQuery.data.filter(b => b.status === "active");
          }
      }

      if (activeBudgetsList.length > 0 && user?.id) {
          const budget = activeBudgetsList.find(b => b.category_id == newTransaction.category_id);
          
          if (budget) {
              const currentSpent = parseFloat(budget.spent || budget.total_spent || 0); // Handle different field names
              const limit = parseFloat(budget.amount || 0);
              const txAmount = parseFloat(newTransaction.amount || 0);
              const newTotal = currentSpent + txAmount;
              
              const isExpense = newTransaction.type === 'expense';
              
              // Only trigger if it IS an expense for that budget
              // Note: Double check if budget.category_id matching implies expense type. Usually yes.
              
              if (newTotal >= limit && currentSpent < limit) {
                  // Predict that backend will trigger "Budget Reached"
                  const tempNotification = {
                      id: `temp-notify-${Date.now()}`,
                      created_at: new Date().toISOString(),
                      timestamp: new Date().toISOString(), // Topbar uses timestamp
                      read_at: null,
                      // Flattened properties for Topbar
                      type: "budget-error", // Mapped type
                      title: "Budget Limit Reached",
                      message: `You have reached 100% of your allocated amount for ${budget.name}`,
                      data: {
                          type: "budget_reached",
                          title: "Budget Limit Reached",
                          message: `You have reached 100% of your allocated amount for ${budget.name}`,
                          budget_id: budget.id
                      }
                  };
                  
                  // Inject into Notification Cache
                  queryClient.setQueryData(["notifications", user.id], (old) => {
                      if (!old) return [tempNotification];
                      return [tempNotification, ...old];
                  });
              }
          }
      }
      // -------------------------------------
      
      // --- OPTIMISTIC SAVINGS LOGIC ---
      if (newTransaction.saving_goal_id && user?.id) {
          let activeSavingsList = [];
          
          // 1. Try "active" savings key
          const activeSavingsQuery = queryClient.getQueryData(["savings", "active"]);
          if (activeSavingsQuery?.data) {
                activeSavingsList = activeSavingsQuery.data;
          } else {
              // 2. Fallback: Try "all" or specific savings key strategies if needed
              // For now, checking the main "savings" key if it exists in a list format
              const allSavingsQuery = queryClient.getQueryData(["savings"]);
               if (Array.isArray(allSavingsQuery)) {
                   activeSavingsList = allSavingsQuery.filter(s => s.status === "active");
               } else if (allSavingsQuery?.data && Array.isArray(allSavingsQuery.data)) {
                   activeSavingsList = allSavingsQuery.data.filter(s => s.status === "active");
               }
          }

          const savingGoal = activeSavingsList.find(s => s.id == newTransaction.saving_goal_id);

          if (savingGoal) {
              const currentAmount = parseFloat(savingGoal.current_amount || 0);
              const targetAmount = parseFloat(savingGoal.target_amount || 0);
              const txAmount = parseFloat(newTransaction.amount || 0);
              
              // Determine direction based on type or existing logic
              // Savings contributions are usually "expenses" from the wallet's perspective 
              // BUT they add to the saving's current_amount.
              // Withdrawals are "income" to wallet, subtract from saving.
              // Logic relies on how `useCreateTransaction` is called. 
              // If it's a contribution call, it ADDS. 
              
              // We need to know if it is a contribution or withdrawal.
              // Hook usage in `useSavingsCardModalLogic`:
              // Contribution -> type: "expense"
              // Withdrawal -> type: "income"
              
              let newAmount = currentAmount;
              if (newTransaction.type === "expense") {
                 newAmount += txAmount;
              } else if (newTransaction.type === "income") {
                 newAmount -= txAmount;
              }

              // Check for completion (Hitting 100% or more)
              if (newAmount >= targetAmount && currentAmount < targetAmount) {
                  const tempSavingNotification = {
                      id: `temp-notify-saving-${Date.now()}`,
                      created_at: new Date().toISOString(),
                      timestamp: new Date().toISOString(),
                      read_at: null,
                      type: "savings-success",
                      title: "Goal Reached! 🎉",
                      message: `Congratulations! You have reached your savings goal for ${savingGoal.name}`,
                      data: {
                          type: "saving_completed",
                          title: "Goal Reached! 🎉",
                          message: `Congratulations! You have reached your savings goal for ${savingGoal.name}`,
                          saving_id: savingGoal.id
                      }
                  };

                  queryClient.setQueryData(["notifications", user.id], (old) => {
                      if (!old) return [tempSavingNotification];
                      return [tempSavingNotification, ...old];
                  });
              }
          }
      }
      // -------------------------------------

      // Return context with the previous transactions
      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          { queryKey: KEYS.allTransactions },
          context.previousTransactions
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to get real IDs and calculated totals
      invalidateFinancialData(queryClient, user?.id);
    },
  });
};

export const useBulkCreateTransactions = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: createBulkTransactions,
         onSettled: () => {
            invalidateFinancialData(queryClient, user?.id);
        },
    });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: updateTransaction,
    onSettled: () => {
      invalidateFinancialData(queryClient, user?.id);
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteTransaction,
    onSettled: () => {
      invalidateFinancialData(queryClient, user?.id);
    },
  });
};
