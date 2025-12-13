import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactions } from "./useTransactions";
import { useUpdateSaving } from "./useSavings";
import { useDataContext } from "../components/DataLoader";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import MySwal, { showSuccess, showError, confirmDelete } from "../utils/swal";
import { useSavingsAlerts } from "./useSavingsAlerts";

import { useTranslation } from "react-i18next";

export const useSavingsCardModalLogic = ({
  isOpen,
  saving,
  onClose,
  onDeleteSaving,
  onDeleteTransaction,
  availableBalance,
  handleCreateWithdrawalTransaction,
  handleCreateContributionTransaction,
}) => {
  const { t } = useTranslation();
  const [localSaving, setLocalSaving] = useState(saving || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const updateSavingMutation = useUpdateSaving();
  const { user } = useDataContext();
  const userCurrency = user?.currency || "USD";
  const currencySymbol = getCurrencySymbol(userCurrency);

  const historyQueryParams = {
    saving_goal_id: localSaving?.id,
    all: true,
    sort_by: "date",
    sort_order: "desc",
  };

  const {
    data: historyDataRaw,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
  } = useTransactions(
    historyQueryParams,
    {
      fetchAll: true,
      enabled: isOpen && !!localSaving?.id,
      staleTime: 0,
      placeholderData: undefined, // Disable keepPreviousData to prevent showing old card's data
    }
  );

  const transactions = historyDataRaw?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      target_amount: "",
      current_amount: "",
      description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && saving) {
      setLocalSaving(saving);
      reset({
        name: saving.name || "",
        target_amount: saving.target_amount?.toString() || "",
        current_amount: saving.current_amount?.toString() || "",
        description: saving.description || "",
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setIsEditing(false);
      setLocalSaving({}); // Clear data on close to prevent ghosts
    }
    return () => {
      document.body.style.overflow = "";
      setIsEditing(false);
      setLocalSaving({}); // Clear data on close to prevent ghosts
    };
  }, [isOpen, saving, reset]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isSaving) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isSaving]);

  const stats = useMemo(() => {
    const target = Number(localSaving.target_amount || 0);
    const current = Number(localSaving.current_amount || 0);
    const remaining = Math.max(target - current, 0);
    const rawPercent = target > 0 ? (current / target) * 100 : 0;
    const isCompleted = localSaving.status === "completed" || current >= target;

    let theme = "emerald";
    if (isCompleted) theme = "green";
    else if (rawPercent > 50) theme = "teal";

    return {
      target,
      current,
      remaining,
      percentage: rawPercent,
      displayPercent: Math.min(rawPercent, 100),
      isCompleted,
      theme,
    };
  }, [localSaving]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date || a.transaction_date || a.created_at);
      const dateB = new Date(b.date || b.transaction_date || b.created_at);
      const timeDiff = dateB - dateA;
      if (timeDiff !== 0) return timeDiff;
      // Handle potential non-numeric IDs (like temp strings)
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return idB - idA;
    });
  }, [transactions]);

  const isReadOnly = stats.isCompleted || localSaving.status === "cancelled";

  const optimisticUpdateGlobal = (newTx) => {
    // Update ALL transaction lists (Dashboard, Transactions Page, etc.)
    // We iterate over all queries that start with ["transactions"]
    queryClient.setQueriesData({ queryKey: ["transactions"] }, (oldData) => {
      if (!oldData) return undefined;

      // Helper to check for duplicates
      const hasDuplicate = (list) => list.some((item) => item.id === newTx.id);

      // Handle paginated responses (Laravel style)
      if (oldData.data && Array.isArray(oldData.data)) {
        if (hasDuplicate(oldData.data)) return oldData;
        return {
          ...oldData,
          data: [newTx, ...oldData.data],
          total: (oldData.total || 0) + 1,
        };
      }

      // Handle simple array responses
      if (Array.isArray(oldData)) {
        if (hasDuplicate(oldData)) return oldData;
        return [newTx, ...oldData];
      }

      return oldData;
    });
  };

  const rollbackOptimisticGlobal = (tempTxId) => {
    // Rollback ALL transaction lists
    queryClient.setQueriesData({ queryKey: ["transactions"] }, (oldData) => {
      if (!oldData) return undefined;

      if (oldData.data && Array.isArray(oldData.data)) {
        return {
          ...oldData,
          data: oldData.data.filter((item) => item.id !== tempTxId),
          total: (oldData.total || 0) - 1,
        };
      }

      if (Array.isArray(oldData)) {
        return oldData.filter((item) => item.id !== tempTxId);
      }

      return oldData;
    });
  };

  const handleSaveChanges = async (data) => {
    setIsSaving(true);
    try {
      await updateSavingMutation.mutateAsync({
        id: localSaving.id,
        data: {
          ...localSaving,
          name: data.name,
          target_amount: parseFloat(data.target_amount),
          current_amount: parseFloat(data.current_amount),
          description: data.description || "",
        },
      });

      setLocalSaving((prev) => ({
        ...prev,
        name: data.name,
        target_amount: parseFloat(data.target_amount),
        current_amount: parseFloat(data.current_amount),
        description: data.description || "",
      }));

      showSuccess(t('app.savings.alerts.saveSuccessTitle'), t('app.savings.alerts.saveSuccessMsg'));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating saving", error);
      showError(t('app.savings.alerts.saveErrorTitle'), t('app.savings.alerts.saveErrorMsg'));
    } finally {
      setIsSaving(false);
    }
  };

  const optimisticUpdateSavingsList = (goalId, newAmount) => {
    // Update the main savings list cache
    queryClient.setQueriesData({ queryKey: ["savings"] }, (oldData) => {
      if (!oldData) return undefined;
      
      const updateItem = (item) => {
        if (item.id === goalId) {
          const target = parseFloat(item.target_amount);
          const current = parseFloat(newAmount);
          return {
            ...item,
            current_amount: newAmount,
            status: current >= target ? 'completed' : 'active'
          };
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

  const { handleQuickContribute, handleQuickWithdraw } = useSavingsAlerts({
    userCurrency,
    stats,
    availableBalance,
    setLocalSaving,
    setIsSaving,
    optimisticUpdateGlobal,
    rollbackOptimisticGlobal,
    optimisticUpdateSavingsList,
    updateSavingMutation,
    handleCreateContributionTransaction,
    handleCreateWithdrawalTransaction,
    localSaving,
    onClose,
  });

  const handleDelete = () => {
    onDeleteSaving(localSaving.id);
  };

  const handleDeleteTx = async (tx) => {
    const result = await confirmDelete(
      t('app.savings.alerts.deleteTxTitle'),
      t('app.savings.alerts.deleteTxMsg'),
      t('app.savings.alerts.deleteTxBtn'),
      t('app.savings.alerts.cancelBtn')
    );

    if (result.isConfirmed && onDeleteTransaction) {
      // Calculate new amount first so it's available for the API call
      const amount = parseFloat(tx.amount);
      const isContribution =
        tx.type === "expense" ||
        tx.description?.toLowerCase().includes("contribution") ||
        tx.name?.toLowerCase().includes("deposit");
        
      let newAmount = stats.current;
      if (isContribution) {
        newAmount = Math.max(0, stats.current - amount);
      } else {
        newAmount = stats.current + amount;
      }

      setLocalSaving((prev) => {
        return { ...prev, current_amount: newAmount };
      });

      queryClient.setQueriesData(
        { queryKey: ["transactions", historyQueryParams] },
        (oldData) => {
          if (!oldData) return undefined;
          const currentList = oldData.data || oldData;
          const newList = currentList.filter((item) => item.id !== tx.id);
          return oldData.data ? { ...oldData, data: newList } : newList;
        }
      );

      try {
        await onDeleteTransaction(tx, localSaving, newAmount);
        queryClient.invalidateQueries(["transactions"]);
        queryClient.invalidateQueries(["savings"]); // This will fetch strict truth
      } catch (error) {
        showError(t('app.savings.alerts.deleteTxErrorTitle'), t('app.savings.alerts.deleteTxErrorMsg'));
        // Should rollback here theoretically, but for now we rely on refetch
      }
    }
  };

  return {
    userCurrency,
    currencySymbol,
    localSaving,
    isEditing,
    setIsEditing,
    isSaving,
    isLoadingHistory,
    sortedTransactions,
    isReadOnly,
    register,
    handleSubmit,
    errors,
    stats,
    handleSaveChanges,
    handleQuickContribute,
    handleQuickWithdraw,
    handleDelete,
    handleDeleteTx,
    isFetchingHistory,
  };
};
