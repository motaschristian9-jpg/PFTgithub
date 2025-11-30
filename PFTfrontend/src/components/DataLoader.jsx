import React, { createContext, useContext, useMemo, useEffect } from "react";
import LoadingScreen from "./LoadingScreen.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useTransactions } from "../hooks/useTransactions.js";
import { useCategories } from "../hooks/useCategories.js";
import { useBudget } from "../hooks/useBudget.js";
import { useSavings } from "../hooks/useSavings.js";

const DataContext = createContext(null);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

const DataLoader = ({ children }) => {
  const { user, isLoading: userLoading, error: userError } = useAuth();

  const {
    data: transactionsData,
    isLoading: transLoading,
    error: transError,
  } = useTransactions({}, { fetchAll: true });

  const {
    data: categoriesData,
    isLoading: catsLoading,
    error: catsError,
  } = useCategories();

  // Budget Hooks
  const {
    data: budgetsData,
    isLoading: budgetsLoading,
    error: budgetsError,
  } = useBudget("all");

  // Savings Hooks
  const {
    data: savingsData,
    isLoading: savingsLoading,
    error: savingsError,
  } = useSavings("all");

  const isLoading =
    userLoading ||
    transLoading ||
    catsLoading ||
    budgetsLoading ||
    savingsLoading;

  const error =
    userError || transError || catsError || budgetsError || savingsError;

  const contextValue = useMemo(() => {
    const getList = (source) => {
      if (!source) return [];
      if (Array.isArray(source)) return source;
      if (source.data && Array.isArray(source.data)) return source.data;
      return [];
    };

    const budgetsList = getList(budgetsData);
    const savingsList = getList(savingsData);

    // Filter Budgets
    const filterActiveBudgets = (items) =>
      items.filter((item) => item.status === "active");
    const filterHistoryBudgets = (items) =>
      items.filter((item) => item.status !== "active");

    const activeBudgetsData = filterActiveBudgets(budgetsList);
    const historyBudgetsData = filterHistoryBudgets(budgetsList);

    // Filter Savings
    const filterActiveSavings = (items) =>
      items.filter((item) => item.status === "active");

    // FIX: Added 'reached' to the filter so it appears in history
    const filterHistorySavings = (items) =>
      items.filter(
        (item) =>
          item.status === "completed" ||
          item.status === "cancelled" ||
          item.status === "reached"
      );

    const activeSavingsData = filterActiveSavings(savingsList);
    const historySavingsData = filterHistorySavings(savingsList);

    return {
      user,
      transactionsData,
      categoriesData,
      budgetsData: budgetsList,
      activeBudgetsData,
      historyBudgetsData,
      savingsData: savingsList,
      activeSavingsData,
      historySavingsData,
    };
  }, [user, transactionsData, categoriesData, budgetsData, savingsData]);

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Unable to Load Data
          </h2>
          <p className="text-gray-600">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export default DataLoader;
