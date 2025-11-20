import { useQuery } from "@tanstack/react-query";
import { fetchTransactions, fetchSavings, fetchBudgets } from "../api/transactions";
import { useAuth } from "./useAuth";

export const useDashboardHooks = () => {
  const { user: profile } = useAuth();

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
    staleTime: 5 * 60 * 1000,
  });

  const { data: savings = [], isLoading: savingsLoading } = useQuery({
    queryKey: ["savings"],
    queryFn: fetchSavings,
    staleTime: 5 * 60 * 1000,
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: fetchBudgets,
    staleTime: 5 * 60 * 1000,
  });

  // Compute totals
  const totalIncome = transactions
    .filter((t) => t.type?.toLowerCase() === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpenses;

  // Savings progress (assuming overall progress, or average)
  const savingsProgress = savings.length > 0
    ? Math.round(
        savings.reduce((sum, g) => {
          const currentAmount = Array.isArray(g.contributions)
            ? g.contributions.reduce((s, c) => s + Number(c.amount || 0), 0)
            : 0;
          return sum + (g.target_amount > 0 ? (currentAmount / g.target_amount) * 100 : 0);
        }, 0) / savings.length
      )
    : 0;

  // Expense data for pie chart (group by category)
  const expenseData = transactions
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((acc, t) => {
      const category = t.category || "Other";
      acc[category] = (acc[category] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const expenseDataArray = Object.entries(expenseData).map(([name, value]) => ({
    name,
    value,
  }));

  // Income vs Expenses data (monthly, assuming current month)
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const incomeExpenseData = [
    {
      month: new Date().toLocaleString("default", { month: "short" }),
      income: totalIncome,
      expenses: totalExpenses,
    },
  ];

  // Budget spent function
  const budgetSpent = (budgetId) => {
    return transactions
      .filter((t) => t.budget_id === budgetId && t.type?.toLowerCase() === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  };

  const isLoading = transactionsLoading || savingsLoading || budgetsLoading;

  return {
    profile,
    totalIncome,
    totalExpenses,
    netBalance,
    savingsProgress,
    expenseData: expenseDataArray,
    incomeExpenseData,
    transactions,
    savings,
    budgets,
    budgetSpent,
    isLoading,
  };
};
