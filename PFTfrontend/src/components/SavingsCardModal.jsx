import { createPortal } from "react-dom";
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
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Trophy,
  FileText,
} from "lucide-react";

import { formatCurrency } from "../utils/currency";
import { useSavingsCardModalLogic } from "../hooks/useSavingsCardModalLogic";

export default function SavingsCardModal({
  isOpen,
  saving,
  onClose,
  onDeleteSaving,
  onDeleteTransaction,
  availableBalance,
  handleCreateWithdrawalTransaction,
  handleCreateContributionTransaction,
}) {
  const {
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
    stats,
    handleSaveChanges,
    handleQuickContribute,
    handleQuickWithdraw,
    handleDelete,
    handleDeleteTx,
  } = useSavingsCardModalLogic({
    isOpen,
    saving,
    onClose,
    onDeleteSaving,
    onDeleteTransaction,
    availableBalance,
    handleCreateWithdrawalTransaction,
    handleCreateContributionTransaction,
  });

  if (!isOpen) return null;

  const currentTheme = {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    icon: "bg-teal-100",
    bar: "bg-teal-500",
  };

  const filteredTransactions = sortedTransactions.filter((tx) => {
    // Hide parent income transactions (type income but not a withdrawal)
    if (
      tx.type === "income" &&
      !tx.name?.toLowerCase().includes("withdrawal")
    ) {
      return false;
    }
    return true;
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[50] flex justify-center items-center p-4"
      onClick={!isSaving ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300" />

      <div
        className="relative z-50 w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 ring-1 ring-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-teal-100 text-teal-600">
              {stats.isCompleted ? <Trophy size={28} /> : <PiggyBank size={28} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {localSaving.name}
                {stats.isCompleted && (
                  <span className="text-xs bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full uppercase tracking-wide font-bold">
                    Completed
                  </span>
                )}
              </h2>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                <Target size={14} /> Target:{" "}
                {formatCurrency(stats.target, userCurrency)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <>
                <button
                  onClick={handleQuickContribute}
                  className="px-4 py-2.5 flex items-center gap-1.5 text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all duration-200"
                  disabled={isReadOnly}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Add</span>
                </button>
                <button
                  onClick={handleQuickWithdraw}
                  className="px-4 py-2.5 flex items-center gap-1.5 text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all duration-200"
                  disabled={isReadOnly && stats.current === 0}
                >
                  <Minus size={18} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Withdraw</span>
                </button>
                <div className="w-px h-8 bg-gray-200 mx-1"></div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200"
                  disabled={isReadOnly}
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Panel: Savings Details / Edit Form */}
          <div className="w-full lg:w-[480px] bg-gray-50/50 flex flex-col border-r border-gray-100 overflow-y-auto">
            {isEditing ? (
              <form
                onSubmit={handleSubmit(handleSaveChanges)}
                className="p-8 space-y-8 flex-1"
              >
                <div className="flex flex-col items-center justify-center py-6">
                  <label className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-2">
                    Current Saved
                  </label>
                  <div className="flex items-baseline justify-center relative w-full group">
                    <span className="text-4xl font-medium text-teal-400 absolute left-[15%] top-1 transition-colors duration-300">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      {...register("current_amount", {
                        required: true,
                        min: 0,
                      })}
                      className="block w-full text-center text-6xl font-bold bg-transparent border-0 focus:ring-0 p-0 text-gray-900 placeholder-gray-300 tracking-tight outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Target size={12} /> Goal Name
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: true })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-900 text-sm font-medium shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <TrendingUp size={12} /> Target Amount
                    </label>
                    <input
                      type="number"
                      {...register("target_amount", {
                        required: true,
                        min: 0.01,
                      })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-900 text-sm font-medium shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <FileText size={12} /> Description
                    </label>
                    <textarea
                      rows={3}
                      {...register("description")}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none text-gray-900 placeholder:text-gray-400 text-sm font-medium shadow-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-all duration-200 flex items-center justify-center gap-2 text-base transform hover:-translate-y-0.5"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <Check size={20} strokeWidth={3} /> Save Changes
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-8 space-y-10">
                <div className="text-center space-y-3">
                  <p className="text-sm font-bold uppercase tracking-wider text-teal-600">
                    {stats.isCompleted ? "Goal Completed" : "Total Saved"}
                  </p>
                  <div className="text-6xl font-black text-teal-900 tracking-tighter">
                    {formatCurrency(stats.current, userCurrency)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <span>{formatCurrency(0, userCurrency)}</span>
                    <span>{stats.percentage.toFixed(0)}% reached</span>
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner relative ring-1 ring-gray-200/50">
                    <div
                      className={`h-full transition-all duration-1000 ease-out rounded-full ${currentTheme.bar}`}
                      style={{ width: `${stats.displayPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Target size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        Target
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.target, userCurrency)}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <TrendingUp size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        To Go
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-500">
                      {formatCurrency(stats.remaining, userCurrency)}
                    </p>
                  </div>
                </div>

                {localSaving.description && (
                  <div className="p-5 rounded-2xl bg-teal-50/50 text-teal-900 text-sm border border-teal-100 leading-relaxed">
                    <span className="font-bold block mb-2 text-xs uppercase opacity-60 tracking-wider">
                      Note
                    </span>
                    {localSaving.description}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Contribution History */}
          <div className="flex-1 bg-white flex flex-col h-full overflow-hidden border-l border-gray-50">
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-3 text-lg">
                Contributions and Withdrawal History
                {filteredTransactions.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold">
                    {filteredTransactions.length}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-60">
                  <Loader2 className="animate-spin" size={40} />
                  <p className="text-sm font-medium">Loading history...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-60">
                  <div className="p-6 rounded-full bg-gray-50">
                    <Clock size={40} />
                  </div>
                  <p className="text-sm font-medium">No contribution history</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isContribution =
                    tx.type === "expense" ||
                    tx.description?.toLowerCase().includes("contribution") ||
                    tx.name?.toLowerCase().includes("deposit");
                  return (
                    <div
                      key={tx.id}
                      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm group-hover:shadow-md ${
                            isContribution
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {isContribution ? (
                            <ArrowUpRight size={20} strokeWidth={2.5} />
                          ) : (
                            <ArrowDownLeft size={20} strokeWidth={2.5} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">
                            {isContribution ? "Contribution" : "Withdrawal"}
                          </p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">
                            {tx.date || tx.transaction_date
                              ? new Date(
                                  tx.date || tx.transaction_date
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "No Date"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span
                            className={`font-bold text-base block ${
                              isContribution
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {isContribution ? "+" : "-"}
                            {formatCurrency(Number(tx.amount), userCurrency)}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {isContribution ? "Saved" : "Withdrawn"}
                          </span>
                        </div>

                        {!isReadOnly && (
                          <button
                            onClick={() => handleDeleteTx(tx)}
                            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Delete Transaction"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
