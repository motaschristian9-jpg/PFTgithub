import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactions } from "../hooks/useTransactions.js";
import {
  Edit2,
  X,
  Target,
  TrendingUp,
  Trash2,
  Loader2,
  Check,
  PiggyBank,
  Clock,
  Trophy,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
// CORRECTED IMPORT PATH
import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import { useDataContext } from "./DataLoader.jsx";

export default function SavingsCardModal({
  isOpen,
  saving,
  onClose,
  onEditSaving,
  onDeleteSaving,
  onDeleteTransaction,
  availableBalance,
  handleCreateWithdrawalTransaction,
  handleCreateContributionTransaction,
}) {
  const [localSaving, setLocalSaving] = useState(saving || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { user } = useDataContext(); // Access user for currency code
  const userCurrency = user?.currency || "USD";
  const currencySymbol = getCurrencySymbol(userCurrency);

  // --- FETCH HISTORY ---
  // Use custom hook with fetchAll to get full history for this goal
  const { data: historyDataRaw, isLoading: isLoadingHistory } = useTransactions(
    {
      saving_goal_id: localSaving?.id,
      all: true,
      sort_by: "date",
      sort_order: "desc",
    },
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
      setIsEditing(false); // Ensure editing is off on close
    };
  }, [isOpen, saving, reset]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isSaving) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isSaving]);

  // --- STATS CALCULATION ---
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

  // --- FILTER & SORT TRANSACTIONS ---
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

  // --- ACTIONS ---

  const handleSaveChanges = async (data) => {
    setIsSaving(true);
    try {
      await onEditSaving({
        ...localSaving,
        name: data.name,
        target_amount: parseFloat(data.target_amount),
        current_amount: parseFloat(data.current_amount),
        description: data.description || "",
      });

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Goal updated successfully.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { container: "swal-z-index-fix" },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating saving", error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- RESTORED CUSTOM SWAL FOR CONTRIBUTION (WITH CURRENCY) ---
  const handleQuickContribute = () => {
    const formattedAvailableBalance = formatCurrency(
      availableBalance ?? 0,
      userCurrency
    );

    Swal.fire({
      title: "Add Contribution",
      html: `
        <input id="swal-amount" type="number" step="0.01" class="swal2-input custom-swal-input" placeholder="Amount to add (e.g., 50.00)">
        <div class="text-sm text-gray-500 mt-2">Available Net Balance: ${formattedAvailableBalance}</div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Contribute",
      customClass: {
        container: "swal-z-index-fix",
        confirmButton:
          "bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-colors",
        cancelButton:
          "text-gray-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-xl transition-colors",
        popup: "rounded-3xl shadow-2xl",
        input: "custom-swal-input",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const amount = parseFloat(document.getElementById("swal-amount").value);
        if (isNaN(amount) || amount <= 0) {
          Swal.showValidationMessage(
            "Please enter a valid amount greater than zero."
          );
          return false;
        }
        if (availableBalance !== undefined && amount > availableBalance) {
          Swal.showValidationMessage(
            `Insufficient funds. You only have ${formattedAvailableBalance} available.`
          );
          return false;
        }
        return amount;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const amountToAdd = result.value;
        setIsSaving(true);
        try {
          const newCurrentAmount = stats.current + amountToAdd;

          await onEditSaving({
            ...localSaving,
            current_amount: newCurrentAmount,
          });

          if (handleCreateContributionTransaction) {
            await handleCreateContributionTransaction(
              amountToAdd,
              localSaving.name
            );
          }

          Swal.fire({
            icon: "success",
            title: "Contribution Added!",
            text: `${formatCurrency(amountToAdd, userCurrency)} added to ${
              localSaving.name
            }.`,
            timer: 1500,
            showConfirmButton: false,
            customClass: { container: "swal-z-index-fix" },
          });

          // Invalidate to refresh history
          queryClient.invalidateQueries(["transactions"]);

          setLocalSaving((prev) => ({
            ...prev,
            current_amount: newCurrentAmount.toString(),
          }));
        } catch (error) {
          console.error("Error adding contribution", error);
          Swal.fire({
            icon: "error",
            title: "Failed to Contribute",
            text: "An error occurred.",
            customClass: { container: "swal-z-index-fix" },
          });
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  // --- RESTORED CUSTOM SWAL FOR WITHDRAWAL (WITH CURRENCY) ---
  const handleQuickWithdraw = () => {
    const formattedCurrent = formatCurrency(stats.current, userCurrency);

    Swal.fire({
      title: "Withdraw Funds",
      html: `
        <input id="swal-withdraw-amount" type="number" step="0.01" class="swal2-input custom-swal-input" placeholder="Amount to withdraw">
        <div class="text-sm text-gray-500 mt-2">Available to Withdraw: ${formattedCurrent}</div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Withdraw",
      customClass: {
        container: "swal-z-index-fix",
        confirmButton:
          "bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-colors",
        cancelButton:
          "text-gray-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-xl transition-colors",
        popup: "rounded-3xl shadow-2xl",
        input: "custom-swal-input",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const amount = parseFloat(
          document.getElementById("swal-withdraw-amount").value
        );
        if (isNaN(amount) || amount <= 0) {
          Swal.showValidationMessage(
            "Please enter a valid amount greater than zero."
          );
          return false;
        }
        if (amount > stats.current) {
          Swal.showValidationMessage(
            "You cannot withdraw more than you have saved."
          );
          return false;
        }
        return amount;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const amountToWithdraw = result.value;
        setIsSaving(true);
        try {
          const newCurrentAmount = Math.max(
            0,
            stats.current - amountToWithdraw
          );

          await onEditSaving({
            ...localSaving,
            current_amount: newCurrentAmount,
          });

          if (handleCreateWithdrawalTransaction) {
            await handleCreateWithdrawalTransaction(
              amountToWithdraw,
              localSaving.name
            );
          }

          Swal.fire({
            icon: "success",
            title: "Withdrawn!",
            text: `${formatCurrency(
              amountToWithdraw,
              userCurrency
            )} withdrawn from ${localSaving.name}.`,
            timer: 1500,
            showConfirmButton: false,
            customClass: { container: "swal-z-index-fix" },
          });

          // Invalidate to refresh history
          queryClient.invalidateQueries(["transactions"]);

          setLocalSaving((prev) => ({
            ...prev,
            current_amount: newCurrentAmount.toString(),
          }));
        } catch (error) {
          console.error("Error withdrawing", error);
          Swal.fire({
            icon: "error",
            title: "Failed to Withdraw",
            text: "An error occurred.",
            customClass: { container: "swal-z-index-fix" },
          });
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Delete Goal?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
      customClass: { container: "swal-z-index-fix" },
    }).then((result) => {
      if (result.isConfirmed) onDeleteSaving(localSaving.id);
    });
  };

  const handleDeleteTx = (tx) => {
    Swal.fire({
      title: "Delete Transaction?",
      text: "This will revert the balance impact on this goal.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
      customClass: { container: "swal-z-index-fix" },
    }).then(async (result) => {
      if (result.isConfirmed && onDeleteTransaction) {
        const amount = parseFloat(tx.amount);
        const isContribution =
          tx.type === "expense" ||
          tx.description?.toLowerCase().includes("contribution") ||
          tx.name?.toLowerCase().includes("deposit");

        // Calculate new balance based on what we are deleting
        let newAmount = stats.current;
        if (isContribution) {
          // If we delete a contribution, reduce balance
          newAmount = Math.max(0, stats.current - amount);
        } else {
          // If we delete a withdrawal, add back to balance
          newAmount = stats.current + amount;
        }

        // Optimistic Update
        setLocalSaving((prev) => ({ ...prev, current_amount: newAmount }));

        // Call Parent
        await onDeleteTransaction(tx, localSaving, newAmount);

        // Refresh history
        queryClient.invalidateQueries(["transactions"]);
      }
    });
  };

  if (!isOpen) return null;

  const themeColors = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "bg-emerald-100",
      bar: "bg-emerald-500",
    },
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
      icon: "bg-teal-100",
      bar: "bg-teal-500",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
      icon: "bg-green-100",
      bar: "bg-green-600",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "bg-blue-100",
      bar: "bg-blue-500",
    },
  };

  const currentTheme = isEditing
    ? themeColors.blue
    : themeColors[stats.theme] || themeColors.emerald;

  return createPortal(
    <div
      className="fixed inset-0 z-[50] flex justify-center items-center p-4"
      onClick={!isSaving ? onClose : undefined}
    >
      <style>{`
        .swal-z-index-fix { z-index: 10000 !important; } 
        .custom-swal-input { height: 40px; margin: 5px 0 10px 0; border-radius: 8px; border: 1px solid #ccc; font-size: 16px; padding: 0 10px; box-shadow: none; width: calc(100% - 20px); box-sizing: border-box; } 
      `}</style>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

      <div
        className="relative z-50 w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${currentTheme.icon} ${currentTheme.text}`}
            >
              {stats.isCompleted ? (
                <Trophy size={24} />
              ) : (
                <PiggyBank size={24} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {localSaving.name}
                {stats.isCompleted && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Completed
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Target size={12} /> Target:{" "}
                {formatCurrency(stats.target, userCurrency)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={handleQuickContribute}
                  className="px-3 py-2 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  disabled={isReadOnly}
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add</span>
                </button>
                <button
                  onClick={handleQuickWithdraw}
                  className="px-3 py-2 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  disabled={isReadOnly && stats.current === 0}
                >
                  <Minus size={18} />
                  <span className="hidden sm:inline">Withdraw</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  disabled={isReadOnly}
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* LEFT PANEL */}
          <div className="w-full lg:w-[450px] bg-gray-50/50 flex flex-col border-r border-gray-100 overflow-y-auto">
            {isEditing ? (
              <form
                onSubmit={handleSubmit(handleSaveChanges)}
                className="p-6 space-y-6 flex-1"
              >
                {/* Form fields */}
                <div className="flex flex-col items-center justify-center py-4">
                  <label className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    Current Saved
                  </label>
                  <div className="flex items-baseline justify-center relative w-full">
                    <span className="text-3xl font-medium text-blue-400 absolute left-[15%] top-2">
                      {/* CURRENCY APPLIED */}
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      {...register("current_amount", {
                        required: true,
                        min: 0,
                      })}
                      className="block w-full text-center text-5xl font-bold bg-transparent border-0 focus:ring-0 p-0 text-gray-800 placeholder-gray-300"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Goal Name
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: true })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Target Amount
                    </label>
                    <input
                      type="number"
                      {...register("target_amount", {
                        required: true,
                        min: 0.01,
                      })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      {...register("description")}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Check size={18} /> Save Changes
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-6 space-y-8">
                <div className="text-center space-y-2">
                  <p
                    className={`text-sm font-bold uppercase tracking-wider ${currentTheme.text}`}
                  >
                    Total Saved
                  </p>
                  <div
                    className={`text-5xl font-black ${currentTheme.text} tracking-tight`}
                  >
                    {/* CURRENCY APPLIED */}
                    {formatCurrency(stats.current, userCurrency)}
                  </div>
                  {stats.isCompleted && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold animate-pulse">
                      <Trophy size={12} /> Goal Reached!
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    {/* CURRENCY APPLIED */}
                    <span>{formatCurrency(0, userCurrency)}</span>
                    <span>{stats.percentage.toFixed(0)}% reached</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner relative">
                    <div
                      className={`h-full transition-all duration-700 ease-out rounded-full ${currentTheme.bar}`}
                      style={{ width: `${stats.displayPercent}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Target size={14} />
                      <span className="text-xs font-bold uppercase">
                        Target
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {/* CURRENCY APPLIED */}
                      {formatCurrency(stats.target, userCurrency)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <TrendingUp size={14} />
                      <span className="text-xs font-bold uppercase">To Go</span>
                    </div>
                    <p className="text-xl font-bold text-gray-500">
                      {/* CURRENCY APPLIED */}
                      {formatCurrency(stats.remaining, userCurrency)}
                    </p>
                  </div>
                </div>
                {localSaving.description && (
                  <div className="p-4 rounded-xl bg-emerald-50/50 text-emerald-800 text-sm border border-emerald-100">
                    <span className="font-semibold block mb-1 text-xs uppercase opacity-70">
                      Motivation
                    </span>
                    {localSaving.description}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: HISTORY */}
          <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                Contribution History{" "}
                {sortedTransactions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs">
                    {sortedTransactions.length}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 opacity-60">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-sm font-medium">Loading history...</p>
                </div>
              ) : sortedTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 opacity-60">
                  <div className="p-4 rounded-full bg-gray-100">
                    <Clock size={32} />
                  </div>
                  <p className="text-sm font-medium">No contribution history</p>
                </div>
              ) : (
                sortedTransactions.map((tx) => {
                  const isContribution =
                    tx.type === "expense" ||
                    tx.description?.toLowerCase().includes("contribution") ||
                    tx.name?.toLowerCase().includes("deposit");
                  return (
                    <div
                      key={tx.id}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            isContribution
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {isContribution ? (
                            <ArrowUpRight size={18} strokeWidth={2.5} />
                          ) : (
                            <ArrowDownLeft size={18} strokeWidth={2.5} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {isContribution ? "Contribution" : "Withdrawal"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tx.date
                              ? new Date(tx.date).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "No Date"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span
                            className={`font-bold text-sm block ${
                              isContribution
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {isContribution ? "+" : "-"}
                            {/* CURRENCY APPLIED */}
                            {formatCurrency(Number(tx.amount), userCurrency)}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                            {isContribution ? "Saved" : "Withdrawn"}
                          </span>
                        </div>

                        {/* Delete Button */}
                        {!isReadOnly && (
                          <button
                            onClick={() => handleDeleteTx(tx)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Transaction"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t border-gray-50 bg-gray-50/20 text-center">
              <p className="text-xs text-gray-400">
                Transactions shown are specific to this goal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
