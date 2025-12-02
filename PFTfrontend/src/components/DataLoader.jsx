import React, { createContext, useContext, useMemo } from "react";
import LoadingScreen from "./LoadingScreen.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useTransactions } from "../hooks/useTransactions.js";
import { useCategories } from "../hooks/useCategories.js";
import { useActiveBudgets } from "../hooks/useBudget.js";
import { useActiveSavings } from "../hooks/useSavings.js";

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

  console.log(transactionsData);

  const {
    data: categoriesData,
    isLoading: catsLoading,
    error: catsError,
  } = useCategories();

  const {
    data: activeBudgetsDataRaw,
    isLoading: budgetsLoading,
    error: budgetsError,
  } = useActiveBudgets();

  // Changed to only fetch active savings globally
  const {
    data: activeSavingsDataRaw,
    isLoading: savingsLoading,
    error: savingsError,
  } = useActiveSavings();

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

    const budgetsList = getList(activeBudgetsDataRaw);
    const savingsList = getList(activeSavingsDataRaw);

    const activeBudgetsData = budgetsList;
    const historyBudgetsData = [];

    const activeSavingsData = savingsList;
    const historySavingsData = [];

    return {
      user,
      transactionsData,
      categoriesData,
      activeBudgetsData,
      historyBudgetsData,
      activeSavingsData,
      historySavingsData,
    };
  }, [
    user,
    transactionsData,
    categoriesData,
    activeBudgetsDataRaw,
    activeSavingsDataRaw,
  ]);

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
