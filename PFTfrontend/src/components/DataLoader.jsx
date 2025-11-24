import React, { createContext, useContext } from "react";
import LoadingScreen from "./LoadingScreen.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useTransactions } from "../hooks/useTransactions.js";
import { useCategories } from "../hooks/useCategories.js";

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
  // Fetch all transactions for sharing; parameterized fetch still done in TransactionsPage for filters.
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useTransactions({}, { fetchAll: true });
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();

  if (userLoading || transactionsLoading || categoriesLoading) {
    return <LoadingScreen />;
  }

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Authentication error: {userError.message}</p>
      </div>
    );
  }

  if (transactionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Transactions error: {transactionsError.message}</p>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Categories error: {categoriesError.message}</p>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ user, transactionsData, categoriesData }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataLoader;
