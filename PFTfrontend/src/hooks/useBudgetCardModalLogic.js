import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTransactions } from "./useTransactions";
import { useDataContext } from "../components/DataLoader";
import { getCurrencySymbol } from "../utils/currency";
import { confirmDelete } from "../utils/swal";
import { useQueryClient } from "@tanstack/react-query";

export const useBudgetCardModalLogic = ({
  isOpen,
  budget,
  onClose,
  onEditBudget,
  onDeleteTransaction,
  isReadOnlyProp,
}) => {
  const { user } = useDataContext();
  const queryClient = useQueryClient();
  const userCurrency = user?.currency || "USD";
  const currencySymbol = getCurrencySymbol(userCurrency);

  const [localBudget, setLocalBudget] = useState(budget || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: historyDataRaw, isLoading: isLoadingHistory } = useTransactions(
    {
      budget_id: localBudget?.id,
      all: "true",
      sort_by: "date",
      sort_order: "desc",
    },
    {
      enabled: isOpen && !!localBudget?.id,
      staleTime: 0,
      placeholderData: undefined, // Disable keepPreviousData to prevent ghosting
    }
  );

  const transactions = historyDataRaw?.data || [];
  const isReadOnly = isReadOnlyProp || localBudget.status !== "active";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      amount: "",
      start_date: "",
      end_date: "",
    },
    mode: "onChange",
  });

  const startDateValue = watch("start_date");

  useEffect(() => {
    if (isOpen && budget) {
      setLocalBudget(budget);
      reset({
        name: budget.name || "",
        amount: budget.amount?.toString() || "",
        start_date: budget.start_date || "",
        end_date: budget.end_date || "",
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setIsEditing(false);
      setLocalBudget({}); // Clear data to prevent ghosting
    }
    return () => {
      document.body.style.overflow = "";
      setIsEditing(false);
    };
  }, [isOpen, budget, reset]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isSaving) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isSaving]);

  const stats = useMemo(() => {
    const allocated = Number(localBudget.amount || 0);

    const spentFromHistory = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    const spent = isLoadingHistory
      ? Number(localBudget.total_spent || localBudget.spent || 0)
      : spentFromHistory;

    const remaining = allocated - spent;
    const rawPercent = allocated > 0 ? (spent / allocated) * 100 : 0;
    const isOverspent = rawPercent > 100;

    let theme = "blue";
    if (isOverspent) theme = "red";
    else if (rawPercent > 85) theme = "orange";
    else theme = "emerald";

    return {
      allocated,
      spent,
      remaining,
      percentage: rawPercent,
      displayPercent: Math.min(rawPercent, 100),
      isOverspent,
      theme,
    };
  }, [localBudget, transactions, isLoadingHistory]);

  const optimisticUpdateBudgetList = (updatedBudget) => {
    // Helper to safely update a budget list in the cache
    const updateCache = (queryKey) => {
      queryClient.setQueriesData({ queryKey }, (oldData) => {
        if (!oldData) return undefined;

        const updateItem = (item) => {
          if (item.id === updatedBudget.id) {
            return { ...item, ...updatedBudget };
          }
          return item;
        };

        if (Array.isArray(oldData)) {
          return oldData.map(updateItem);
        }

        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map(updateItem),
          };
        }

        return oldData;
      });
    };

    // Update 'active' budgets (Dashboard/Budget Page) and generic 'budgets'
    updateCache(["budgets", "active"]);
    updateCache(["budgets"]); 
  };

  const handleSaveChanges = async (data) => {
    setIsSaving(true);
    try {
      const updatedData = {
        ...localBudget,
        name: data.name,
        amount: parseFloat(data.amount),
        start_date: data.start_date,
        end_date: data.end_date,
      };

      // Optimistic Update
      setLocalBudget(updatedData);
      optimisticUpdateBudgetList(updatedData);

      await onEditBudget(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating budget", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTx = async (tx) => {
    const result = await confirmDelete(
      "Delete Transaction?",
      "This will remove it from your budget history."
    );

    if (result.isConfirmed && onDeleteTransaction) {
        // Optimistic Update: Calculate new spent amount
        // Note: total_spent might be a string or number depending on backend, we parse safely
        const currentSpent = parseFloat(localBudget.total_spent || localBudget.spent || 0);
        const txAmount = parseFloat(tx.amount);
        const newSpent = Math.max(0, currentSpent - txAmount);

        const updatedBudget = {
            ...localBudget,
            total_spent: newSpent,
            spent: newSpent // Handle both naming conventions
        };

        // Update Local State
        setLocalBudget(updatedBudget);
        
        // Update Global Cache
        optimisticUpdateBudgetList(updatedBudget);

        // Update Transaction List Cache (Remove the deleted tx)
        queryClient.setQueriesData({ queryKey: ["transactions"] }, (oldData) => {
             if (!oldData) return undefined;
             const filterTx = (list) => list.filter(t => t.id !== tx.id);

             if (Array.isArray(oldData)) return filterTx(oldData);
             if (oldData.data && Array.isArray(oldData.data)) {
                 return { ...oldData, data: filterTx(oldData.data) };
             }
             return oldData;
        });

      onDeleteTransaction(tx);
    }
  };

  return {
    userCurrency,
    currencySymbol,
    localBudget,
    isEditing,
    setIsEditing,
    isSaving,
    isLoadingHistory,
    transactions,
    isReadOnly,
    register,
    handleSubmit,
    errors,
    startDateValue,
    stats,
    handleSaveChanges,
    handleDeleteTx,
  };
};
