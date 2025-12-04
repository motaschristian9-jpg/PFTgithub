import { useState, useEffect, useMemo } from "react";
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

  const { data: historyDataRaw, isLoading: isLoadingHistory } = useTransactions(
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
      return b.id - a.id;
    });
  }, [transactions]);

  const isReadOnly = stats.isCompleted || localSaving.status === "cancelled";

  const optimisticUpdateHistory = (newTx) => {
    queryClient.setQueriesData(
      { queryKey: ["transactions", historyQueryParams] },
      (oldData) => {
        if (!oldData) return undefined;
        const currentList = oldData.data || oldData;
        const newList = [newTx, ...currentList];
        return oldData.data ? { ...oldData, data: newList } : newList;
      }
    );
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

  const handleQuickContribute = () => {
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

        optimisticUpdateHistory({
          id: `temp-${Date.now()}`,
          amount: amountToAdd,
          type: "expense",
          date: todayStr,
          name: `Deposit: ${localSaving.name}`,
          description: "Contribution (Pending...)",
          saving_goal_id: localSaving.id,
          category_id: 0,
        });

        try {
          await updateSavingMutation.mutateAsync({
            id: localSaving.id,
            data: { ...localSaving, current_amount: newCurrentAmount },
          });

          if (handleCreateContributionTransaction) {
            await handleCreateContributionTransaction(
              amountToAdd,
              localSaving.name,
              localSaving.id
            );
          }

          showSuccess(
            "Contribution Added!",
            `${formatCurrency(amountToAdd, userCurrency)} added to ${
              localSaving.name
            }.`
          );

          queryClient.invalidateQueries(["transactions"]);
        } catch (error) {
          console.error("Error adding contribution", error);
          showError("Error", "Failed to add contribution.");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleQuickWithdraw = () => {
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

        optimisticUpdateHistory({
          id: `temp-${Date.now()}`,
          amount: amountToWithdraw,
          type: "income",
          date: todayStr,
          name: `Withdrawal: ${localSaving.name}`,
          description: "Withdrawal (Pending...)",
          saving_goal_id: localSaving.id,
          category_id: 0,
        });

        try {
          await updateSavingMutation.mutateAsync({
            id: localSaving.id,
            data: { ...localSaving, current_amount: newCurrentAmount },
          });

          if (handleCreateWithdrawalTransaction) {
            await handleCreateWithdrawalTransaction(
              amountToWithdraw,
              localSaving.name,
              localSaving.id
            );
          }

          showSuccess(
            "Withdrawn!",
            `${formatCurrency(amountToWithdraw, userCurrency)} withdrawn from ${
              localSaving.name
            }.`
          );

          queryClient.invalidateQueries(["transactions"]);
        } catch (error) {
          console.error("Error withdrawing", error);
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
  };
};
