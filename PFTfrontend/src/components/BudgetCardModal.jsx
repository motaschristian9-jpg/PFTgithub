import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useTransactions } from "../hooks/useTransactions.js";
import {
  Edit2,
  X,
  Calendar,
  DollarSign,
  TrendingDown,
  Trash2,
  Loader2,
  AlertTriangle,
  PieChart,
  Clock,
  ArrowRight,
  Check, // Added missing import
} from "lucide-react";

import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import { useDataContext } from "../components/DataLoader.jsx";
import { confirmDelete } from "../utils/swal";

export default function BudgetCardModal({
  isOpen,
  budget,
  onClose,
  onEditBudget,
  onDeleteTransaction,
  onDeleteBudget,
  getCategoryName,
}) {
  const { user } = useDataContext();
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
    }
  );

  const transactions = historyDataRaw?.data || [];

  const isReadOnly = localBudget.status !== "active";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      description: "",
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
        amount: budget.amount?.toString() || "",
        description: budget.description || "",
        start_date: budget.start_date || "",
        end_date: budget.end_date || "",
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setIsEditing(false);
    }
    return () => {
      document.body.style.overflow = "";
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

  const handleSaveChanges = async (data) => {
    setIsSaving(true);
    try {
      await onEditBudget({
        ...localBudget,
        amount: parseFloat(data.amount),
        description: data.description || "",
        start_date: data.start_date,
        end_date: data.end_date,
      });
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
      onDeleteTransaction(tx);
    }
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
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      icon: "bg-orange-100",
      bar: "bg-orange-500",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "bg-red-100",
      bar: "bg-red-500",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "bg-blue-100",
      bar: "bg-blue-500",
    },
  };

  const currentTheme = isEditing ? themeColors.blue : themeColors[stats.theme];

  return createPortal(
    <div
      className="fixed inset-0 z-[50] flex justify-center items-center p-4"
      onClick={!isSaving ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

      <div
        className="relative z-50 w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${currentTheme.icon} ${currentTheme.text}`}
            >
              <PieChart size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {getCategoryName
                  ? getCategoryName(localBudget.category_id)
                  : localBudget.category}
                {isReadOnly && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Expired
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(localBudget.start_date).toLocaleDateString()} -{" "}
                {new Date(localBudget.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Edit Budget"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => onDeleteBudget(localBudget)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete Budget"
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
          <div className="w-full lg:w-[450px] bg-gray-50/50 flex flex-col border-r border-gray-100 overflow-y-auto">
            {isEditing ? (
              <form
                onSubmit={handleSubmit(handleSaveChanges)}
                className="p-6 space-y-6 flex-1"
              >
                <div className="flex flex-col items-center justify-center py-4">
                  <label className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    Total Budget Limit
                  </label>
                  <div className="flex items-baseline justify-center relative w-full">
                    <span className="text-3xl font-medium text-blue-400 absolute left-[15%] top-2">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      {...register("amount", { required: true, min: 0.01 })}
                      className="block w-full text-center text-5xl font-bold bg-transparent border-0 focus:ring-0 p-0 text-gray-800 placeholder-gray-300"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      End Date
                    </label>
                    <input
                      type="date"
                      {...register("end_date", {
                        required: true,
                        validate: (val) =>
                          !startDateValue ||
                          new Date(val) >= new Date(startDateValue) ||
                          "Invalid date",
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
                    {stats.isOverspent ? "Over Budget By" : "Remaining Budget"}
                  </p>
                  <div
                    className={`text-5xl font-black ${currentTheme.text} tracking-tight`}
                  >
                    {formatCurrency(Math.abs(stats.remaining), userCurrency)}
                  </div>
                  {stats.isOverspent && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                      <AlertTriangle size={12} /> Critical
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>{formatCurrency(0, userCurrency)}</span>
                    <span>{stats.percentage.toFixed(0)}% used</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner relative">
                    {stats.isOverspent && (
                      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white z-10"></div>
                    )}
                    <div
                      className={`h-full transition-all duration-700 ease-out rounded-full ${currentTheme.bar}`}
                      style={{ width: `${stats.displayPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <DollarSign size={14} />
                      <span className="text-xs font-bold uppercase">
                        Allocated
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {formatCurrency(stats.allocated, userCurrency)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <TrendingDown size={14} />
                      <span className="text-xs font-bold uppercase">Spent</span>
                    </div>
                    <p
                      className={`text-xl font-bold ${
                        stats.spent > stats.allocated
                          ? "text-red-500"
                          : "text-gray-800"
                      }`}
                    >
                      {formatCurrency(stats.spent, userCurrency)}
                    </p>
                  </div>
                </div>

                {localBudget.description && (
                  <div className="p-4 rounded-xl bg-blue-50/50 text-blue-800 text-sm border border-blue-100">
                    <span className="font-semibold block mb-1 text-xs uppercase opacity-70">
                      Note
                    </span>
                    {localBudget.description}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                Transaction History
                <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs">
                  {transactions.length}
                </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 opacity-60">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-sm font-medium">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 opacity-60">
                  <div className="p-4 rounded-full bg-gray-100">
                    <Clock size={32} />
                  </div>
                  <p className="text-sm font-medium">No transactions yet</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                        <ArrowRight size={16} className="-rotate-45" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {formatCurrency(Number(tx.amount), userCurrency)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.date || tx.transaction_date
                            ? new Date(
                                tx.date || tx.transaction_date
                              ).toLocaleDateString()
                            : "No Date"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {tx.name && (
                        <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[100px]">
                          {tx.name}
                        </span>
                      )}
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
