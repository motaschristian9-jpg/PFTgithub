import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  LayoutDashboard,
  History,
} from "lucide-react";

import { formatCurrency } from "../utils/currency";
import { useSavingsCardModalLogic } from "../hooks/useSavingsCardModalLogic";
import SavingsEditForm from "./savings/SavingsEditForm";

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
    isFetchingHistory,
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

  const [activeTab, setActiveTab] = useState("overview");



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

  const isDataStale = isOpen && saving && localSaving?.id !== saving.id;

  return createPortal(
    <AnimatePresence>
      {isOpen && !isDataStale && (
        <div className="fixed inset-0 z-[50] flex justify-center items-center p-4">
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={!isSaving ? onClose : undefined}
          />

          <motion.div
            className="relative z-50 w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/20"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 shrink-0">
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shrink-0">
                  {stats.isCompleted ? <Trophy size={28} /> : <PiggyBank size={28} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 truncate">
                    {localSaving.name}
                    {stats.isCompleted && (
                      <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-full uppercase tracking-wide font-bold shrink-0">
                        Completed
                      </span>
                    )}
                  </h2>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1 truncate">
                    <Target size={14} className="shrink-0" /> Target:{" "}
                    {formatCurrency(stats.target, userCurrency)}
                  </p>
                </div>
                {/* Mobile Close Button */}
                <button
                  onClick={onClose}
                  className="sm:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 ml-auto"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {!isEditing && (
                  <>
                    {!stats.isCompleted && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickContribute();
                        }}
                        className="px-4 py-2.5 flex items-center gap-1.5 text-sm font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-xl transition-all duration-200"
                        disabled={isReadOnly}
                      >
                        <Plus size={18} strokeWidth={2.5} />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                          e.stopPropagation();
                          handleQuickWithdraw();
                        }}
                        className="px-4 py-2.5 flex items-center gap-1.5 text-sm font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-all duration-200"
                        disabled={isReadOnly && stats.current === 0}
                      >
                      <Minus size={18} strokeWidth={2.5} />
                      <span className="hidden sm:inline">Withdraw</span>
                    </button>
                    {!stats.isCompleted && (
                      <>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all duration-200"
                          disabled={isReadOnly}
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={handleDelete}
                          className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </>
                )}
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
                {/* Desktop Close Button */}
                <button
                  onClick={onClose}
                  className="hidden sm:block p-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 lg:hidden shrink-0">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "overview"
                    ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-900/10"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <LayoutDashboard size={16} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "history"
                    ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-900/10"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <History size={16} />
                History
              </button>
            </div>

            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Left Panel: Savings Details / Edit Form */}
              <div
                className={`w-full lg:w-[480px] bg-gray-50/50 dark:bg-gray-800/50 flex flex-col border-r border-gray-100 dark:border-gray-800 overflow-y-auto ${
                  activeTab === "overview" ? "block" : "hidden lg:flex"
                }`}
              >
                {isEditing ? (
                  <SavingsEditForm
                    register={register}
                    handleSubmit={handleSubmit}
                    handleSaveChanges={handleSaveChanges}
                    isSaving={isSaving}
                    currencySymbol={currencySymbol}
                  />
                ) : (
                  <div className="p-8 space-y-10">
                    <div className="text-center space-y-3">
                      <p className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        {stats.isCompleted ? "Goal Completed" : "Total Saved"}
                      </p>
                      <div className="text-6xl font-black text-teal-900 dark:text-teal-50 tracking-tighter">
                        {formatCurrency(stats.current, userCurrency)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <span>{formatCurrency(0, userCurrency)}</span>
                        <span>{stats.percentage.toFixed(0)}% reached</span>
                      </div>
                      <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner relative ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                        <div
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${currentTheme.bar}`}
                          style={{ width: `${stats.displayPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-2">
                          <Target size={16} />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            Target
                          </span> 
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(stats.target, userCurrency)}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-2">
                          <TrendingUp size={16} />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            To Go
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                          {formatCurrency(stats.remaining, userCurrency)}
                        </p>
                      </div>
                    </div>

                    {localSaving.description && (
                      <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-900/10 text-teal-900 dark:text-teal-200 text-sm border border-teal-100 dark:border-teal-800/30 leading-relaxed">
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
              <div
                className={`flex-1 bg-white dark:bg-gray-900 flex-col h-full overflow-hidden border-l border-gray-50 dark:border-gray-800 relative ${
                  activeTab === "history" ? "flex" : "hidden lg:flex"
                }`}
              >
                <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-3 text-lg">
                    Contributions and Withdrawal History
                    {filteredTransactions.length > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold">
                        {filteredTransactions.length}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar max-h-[400px] lg:max-h-[500px]">
                  {isLoadingHistory ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 opacity-60">
                      <Loader2 className="animate-spin" size={40} />
                      <p className="text-sm font-medium">Loading history...</p>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4 opacity-60">
                      <div className="p-6 rounded-full bg-gray-50 dark:bg-gray-800">
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
                          className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm group-hover:shadow-md ${
                                isContribution
                                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isContribution ? (
                                <ArrowUpRight size={20} strokeWidth={2.5} />
                              ) : (
                                <ArrowDownLeft size={20} strokeWidth={2.5} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-base">
                                {isContribution ? "Contribution" : "Withdrawal"}
                              </p>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
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
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!tx.pending) handleDeleteTx(tx);
                                }}
                                disabled={tx.pending}
                                  className={`p-2.5 rounded-xl transition-all duration-200 ${
                                    tx.pending
                                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-100"
                                      : "text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
                                  }`}
                                title={
                                  tx.pending
                                    ? "Syncing with server..."
                                    : "Delete Transaction"
                                }
                              >
                                {tx.pending ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <Trash2 size={18} />
                                )}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

