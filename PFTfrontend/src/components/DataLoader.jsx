import React, { createContext, useContext, useMemo } from "react";
import LoadingScreen from "./LoadingScreen.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useTransactions } from "../hooks/useTransactions.js";
import { useCategories } from "../hooks/useCategories.js";
import { useBudget } from "../hooks/useBudget.js";

const DataContext = createContext(null);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

const DataLoader = ({ children }) => {
  // 1. Data Fetching
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
  } = useBudget();
  const {
    data: activeBudgetsData,
    isLoading: activeLoading,
    error: activeError,
  } = useBudget("active");
  const {
    data: historyBudgetsData,
    isLoading: historyLoading,
    error: historyError,
  } = useBudget("history");

  // 2. Logic Consolidation
  const isLoading =
    userLoading ||
    transLoading ||
    catsLoading ||
    budgetsLoading ||
    activeLoading ||
    historyLoading;

  // specificError allows us to catch the first error that occurs
  const error =
    userError ||
    transError ||
    catsError ||
    budgetsError ||
    activeError ||
    historyError;

  // 3. Performance: Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      transactionsData,
      categoriesData,
      budgetsData,
      activeBudgetsData,
      historyBudgetsData,
    }),
    [
      user,
      transactionsData,
      categoriesData,
      budgetsData,
      activeBudgetsData,
      historyBudgetsData,
    ]
  );

  // 4. Render Views
  if (isLoading) {
    return <LoadingScreen />;
  }

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
