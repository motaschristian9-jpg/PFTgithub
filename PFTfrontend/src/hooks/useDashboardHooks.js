import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// Keeping your imports exactly as they were to ensure path functionality
import {
  fetchTransactions,
  fetchSavings,
  fetchBudgets,
} from "../api/transactions";
import { useAuth } from "./useAuth";

export const useDashboardHooks = () => {
  const { user: profile } = useAuth();

  // 1. Fetching Data
  // We use specific keys to ensure these are cached correctly
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions", "all"], // Added 'all' to differentiate from paginated lists
    queryFn: () => fetchTransactions({ fetchAll: true }), // Ensure we fetch everything for the dashboard
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

  // 2. Optimized Calculations
  // We calculate totals and charts in one pass to avoid looping multiple times
  const stats = useMemo(() => {
    const data = Array.isArray(transactions) ? transactions : [];

    let income = 0;
    let expenses = 0;
    const expenseMap = {};

    // Single loop optimization: Calculate totals and pie chart data simultaneously
    data.forEach((t) => {
      const amount = Number(t.amount || 0);
      const type = t.type?.toLowerCase();

      if (type === "income") {
        income += amount;
      } else if (type === "expense") {
        expenses += amount;

        // Build Pie Chart Data
        const category = t.category || "Other";
        expenseMap[category] = (expenseMap[category] || 0) + amount;
      }
    });

    const expenseDataArray = Object.entries(expenseMap).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      expenseData: expenseDataArray,
    };
  }, [transactions]);

  // 3. Optimized Budget Spending Map (O(n) -> O(1))
  // Pre-calculate spending per budget ID so we don't filter inside the render loop
  const budgetSpentMap = useMemo(() => {
    const map = {};
    const data = Array.isArray(transactions) ? transactions : [];

    data.forEach((t) => {
      if (t.type?.toLowerCase() === "expense" && t.budget_id) {
        map[t.budget_id] = (map[t.budget_id] || 0) + Number(t.amount || 0);
      }
    });
    return map;
  }, [transactions]);

  // Fast lookup function
  const budgetSpent = (budgetId) => budgetSpentMap[budgetId] || 0;

  // 4. Savings Progress Logic
  const savingsProgress = useMemo(() => {
    if (!Array.isArray(savings) || savings.length === 0) return 0;

    const totalProgress = savings.reduce((sum, g) => {
      const currentAmount = Array.isArray(g.contributions)
        ? g.contributions.reduce((s, c) => s + Number(c.amount || 0), 0)
        : 0;

      const percentage =
        g.target_amount > 0 ? (currentAmount / g.target_amount) * 100 : 0;

      return sum + percentage;
    }, 0);

    return Math.round(totalProgress / savings.length);
  }, [savings]);

  // 5. Income vs Expenses Chart Data
  const incomeExpenseData = useMemo(
    () => [
      {
        month: new Date().toLocaleString("default", { month: "short" }),
        income: stats.totalIncome,
        expenses: stats.totalExpenses,
      },
    ],
    [stats.totalIncome, stats.totalExpenses]
  );

  const isLoading = transactionsLoading || savingsLoading || budgetsLoading;

  return {
    profile,
    isLoading,
    transactions,
    savings,
    budgets,
    budgetSpent, // Now uses the fast hash-map lookup
    savingsProgress,
    incomeExpenseData,
    totalIncome: stats.totalIncome,
    totalExpenses: stats.totalExpenses,
    netBalance: stats.netBalance,
    expenseData: stats.expenseData,
  };
};
