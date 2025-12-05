import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactions } from "./useTransactions";
import { useUpdateSaving } from "./useSavings";
import { useDataContext } from "../components/DataLoader";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import MySwal, { showSuccess, showError, confirmDelete } from "../utils/swal";

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
    }
    return () => {
      document.body.style.overflow = "";
      setIsEditing(false);
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

      showSuccess("Saved!", "Goal updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating saving", error);
      showError("Error", "Failed to update goal.");
    } finally {
      setIsSaving(false);
    }
  };

  const isSwalOpen = useRef(false);
  
  const handleQuickContribute = () => {
    if (isSwalOpen.current) return;
    isSwalOpen.current = true;

    const formattedAvailableBalance = formatCurrency(
      availableBalance ?? 0,
      userCurrency
    );

    MySwal.fire({
      title: "Add Contribution",
      html: `
        <input id="swal-amount" type="number" step="0.01" class="swal2-input custom-swal-input" placeholder="Amount to add (e.g., 50.00)">
        <div class="text-sm text-gray-500 mt-2">Available Net Balance: ${formattedAvailableBalance}</div>
        <div class="text-xs text-emerald-600 font-medium mt-1">(Recorded as Expense)</div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Contribute",
      customClass: {
        container: "z-[10000]",
        confirmButton:
          "bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-colors mx-2",
        cancelButton:
          "text-gray-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-xl transition-colors mx-2",
        popup: "rounded-2xl shadow-2xl border border-gray-100 p-6",
        input:
          "h-10 mt-2 mb-4 rounded-lg border border-gray-300 text-base px-3 w-full box-border",
      },
      buttonsStyling: false,
      didClose: () => {
        isSwalOpen.current = false;
      },
      preConfirm: () => {
        const amount = parseFloat(document.getElementById("swal-amount").value);
        if (isNaN(amount) || amount <= 0) {
          MySwal.showValidationMessage("Please enter a valid amount.");
          return false;
        }
        if (availableBalance !== undefined && amount > availableBalance) {
          MySwal.showValidationMessage(
            `Insufficient funds. Available: ${formattedAvailableBalance}`
          );
          return false;
        }
        return amount;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const amountToAdd = result.value;
        setIsSaving(true);

        const newCurrentAmount = stats.current + amountToAdd;
        const todayStr = new Date().toISOString();

        setLocalSaving((prev) => ({
          ...prev,
          current_amount: newCurrentAmount.toString(),
        }));

        const tempTxId = Date.now();
        const tempTransaction = {
          id: tempTxId,
          amount: amountToAdd,
          name: `Deposit: ${localSaving.name}`,
          description: `Funds transferred to savings goal: ${localSaving.name}`,
          date: new Date().toISOString(),
          type: "expense",
          pending: true,
        };

        // 1. Optimistic Update
        optimisticUpdateGlobal(tempTransaction);

        try {
          // 2. Parallel execution
          const [updateResponse, transactionResult] = await Promise.all([
            updateSavingMutation.mutateAsync({
              id: localSaving.id,
              data: { ...localSaving, current_amount: newCurrentAmount },
            }),
            handleCreateContributionTransaction
              ? handleCreateContributionTransaction(
                  amountToAdd,
                  localSaving.name,
                  localSaving.id
                )
              : Promise.resolve(null),
          ]);

          // 3. Confirm Update (Replace temp with real if needed, or just let invalidation handle it)
          // Since we invalidate queries, the real data will eventually replace the temp one.
          // But to be clean, we could swap them. For now, invalidation is safe.

          showSuccess(
            "Contribution Added!",
            `${formatCurrency(amountToAdd, userCurrency)} added to ${
              localSaving.name
            }.`
          );
        } catch (error) {
          console.error("Error adding contribution", error);
          // 4. Rollback on Error
          rollbackOptimisticGlobal(tempTxId);
          showError("Error", "Failed to add contribution.");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleQuickWithdraw = () => {
    if (isSwalOpen.current) return;
    isSwalOpen.current = true;

    const formattedCurrent = formatCurrency(stats.current, userCurrency);

    MySwal.fire({
      title: "Withdraw Funds",
      html: `
        <input id="swal-withdraw-amount" type="number" step="0.01" class="swal2-input custom-swal-input" placeholder="Amount to withdraw">
        <div class="text-sm text-gray-500 mt-2">Available to Withdraw: ${formattedCurrent}</div>
        <div class="text-xs text-rose-600 font-medium mt-1">(Recorded as Income)</div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Withdraw",
      customClass: {
        container: "z-[10000]",
        confirmButton:
          "bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-colors mx-2",
        cancelButton:
          "text-gray-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-xl transition-colors mx-2",
        popup: "rounded-2xl shadow-2xl border border-gray-100 p-6",
        input:
          "h-10 mt-2 mb-4 rounded-lg border border-gray-300 text-base px-3 w-full box-border",
      },
      buttonsStyling: false,
      didClose: () => {
        isSwalOpen.current = false;
      },
      preConfirm: () => {
        const amount = parseFloat(
          document.getElementById("swal-withdraw-amount").value
        );
        if (isNaN(amount) || amount <= 0) {
          MySwal.showValidationMessage("Please enter a valid amount.");
          return false;
        }
        if (amount > stats.current) {
          MySwal.showValidationMessage("Cannot withdraw more than saved.");
          return false;
        }
        return amount;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const amountToWithdraw = result.value;
        setIsSaving(true);

        const newCurrentAmount = Math.max(0, stats.current - amountToWithdraw);
        const todayStr = new Date().toISOString();

        setLocalSaving((prev) => ({
          ...prev,
          current_amount: newCurrentAmount.toString(),
        }));

        const tempTxId = Date.now();
        const tempTransaction = {
          id: tempTxId,
          amount: amountToWithdraw,
          name: `Withdrawal: ${localSaving.name}`,
          description: `Funds moved from savings goal: ${localSaving.name}`,
          date: new Date().toISOString(),
          type: "income",
          pending: true,
        };

        // 1. Optimistic Update
        optimisticUpdateGlobal(tempTransaction);

        try {
          // 2. Parallel execution
          const [response, transactionResult] = await Promise.all([
            updateSavingMutation.mutateAsync({
              id: localSaving.id,
              data: { ...localSaving, current_amount: newCurrentAmount },
            }),
            handleCreateWithdrawalTransaction
              ? handleCreateWithdrawalTransaction(
                  amountToWithdraw,
                  localSaving.name,
                  localSaving.id
                )
              : Promise.resolve(null),
          ]);

          const wasDeleted = response?.deleted;

          // 3. Confirm Update (Replace temp with real if needed, or just let invalidation handle it)
          // Since we invalidate queries, the real data will eventually replace the temp one.

          if (wasDeleted) {
            showSuccess(
              "Withdrawn & Deleted",
              `${formatCurrency(
                amountToWithdraw,
                userCurrency
              )} withdrawn. Goal deleted as it is empty.`
            );
            onClose();
          } else {
            showSuccess(
              "Withdrawn!",
              `${formatCurrency(
                amountToWithdraw,
                userCurrency
              )} withdrawn from ${localSaving.name}.`
            );
          }
        } catch (error) {
          console.error("Error withdrawing", error);
          // 4. Rollback on Error
          rollbackOptimisticGlobal(tempTxId);
          showError("Error", "Failed to withdraw funds.");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleDelete = () => {
    onDeleteSaving(localSaving.id);
  };

  const handleDeleteTx = async (tx) => {
    const result = await confirmDelete(
      "Delete Transaction?",
      "This will revert the balance impact on this goal."
    );

    if (result.isConfirmed && onDeleteTransaction) {
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

      setLocalSaving((prev) => ({ ...prev, current_amount: newAmount }));

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
      } catch (error) {
        showError("Error", "Failed to update balance after deletion.");
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
