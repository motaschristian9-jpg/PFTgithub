import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Check,
  FileText,
  LayoutDashboard,
  History,
  Tag,
} from "lucide-react";

import { formatCurrency } from "../utils/currency";
import { useTranslation } from "react-i18next";
import { useBudgetCardModalLogic } from "../hooks/useBudgetCardModalLogic";
import BudgetEditForm from "./budgets/BudgetEditForm";

export default function BudgetCardModal({
  isOpen,
  budget,
  onClose,
  onEditBudget,
  onDeleteTransaction,
  onDeleteBudget,
  getCategoryName,
  isReadOnly: isReadOnlyProp,
}) {
  const {
    userCurrency,
    currencySymbol,
    localBudget,
    isEditing,
    setIsEditing,
    isSaving,
    isLoadingHistory: transactionsLoading,
    transactions: historyTransactions,
    isReadOnly,
    register,
    handleSubmit,
    errors,
    startDateValue,
    stats,
    handleSaveChanges,
    handleDeleteTx,
  } = useBudgetCardModalLogic({
    isOpen,
    budget,
    onClose,
    onEditBudget,
    onDeleteTransaction,
    isReadOnlyProp,
  });

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setActiveTab("overview");
  }, [isOpen]);

  const { t } = useTranslation();

  const isDataStale = isOpen && budget && localBudget?.id !== budget.id;

  if (!isOpen || !budget) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && !isDataStale && (
        <div
          className="fixed inset-0 z-[50] flex justify-center items-center p-4"
          onClick={!isSaving ? onClose : undefined}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="relative z-50 w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/20"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 shrink-0">
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 shrink-0">
                  <PieChart size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 truncate">
                    {localBudget.name}
                    {/* Status Badge */}
                    {isReadOnly && (
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          localBudget.status === "completed"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {localBudget.status === "completed" ? (
                           <Check size={12} />
                        ) : (
                           <AlertTriangle size={12} />
                        )}
                        {localBudget.status === "completed"
                          ? t("app.budgets.statusLabels.completed")
                          : t("app.budgets.card.expired")}
                      </div>
                    )}
                  </h2>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide truncate">
                      {getCategoryName
                        ? getCategoryName(localBudget.category_id)
                        : localBudget.category}
                    </span>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                      <Calendar size={14} className="shrink-0" />
                      {new Date(localBudget.start_date).toLocaleDateString()} -{" "}
                      {new Date(localBudget.end_date).toLocaleDateString()}
                    </p>
                  </div>
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
                {!isReadOnly && !isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-all duration-200"
                      title="Edit Budget"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(localBudget)}
                      className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                      title="Delete Budget"
                    >
                      <Trash2 size={20} />
                    </button>
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

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 lg:hidden">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === "overview"
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard size={16} />
                {t('app.budgets.card.overview')}
                {activeTab === "overview" && (
                  <motion.div
                    layoutId="activeBudgetTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400"
                  />
                )}
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === "history"
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <History size={16} />
                {t('app.budgets.card.history')}
                {activeTab === "history" && (
                  <motion.div
                    layoutId="activeBudgetTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400"
                  />
                )}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Left Panel: Budget Details / Edit Form */}
              <div
                className={`w-full lg:w-[480px] bg-gray-50/50 dark:bg-gray-800/50 flex flex-col border-r border-gray-100 dark:border-gray-800 overflow-y-auto ${
                  activeTab === "overview" ? "block" : "hidden lg:flex"
                }`}
              >
                {isEditing ? (
                  <BudgetEditForm
                    register={register}
                    handleSubmit={handleSubmit}
                    handleSaveChanges={handleSaveChanges}
                    isSaving={isSaving}
                    currencySymbol={currencySymbol}
                    startDateValue={startDateValue}
                  />
                ) : (
                  <div className="p-8 space-y-10">
                    <div className="text-center space-y-3">
                      <p className="text-sm font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                        {stats.isOverspent ? t('app.budgets.card.overBudgetBy') : t('app.budgets.card.remainingBudget')}
                      </p>
                      <div className={`text-6xl font-black tracking-tighter ${stats.isOverspent ? "text-red-600 dark:text-red-400" : "text-violet-900 dark:text-violet-300"}`}>
                        {formatCurrency(Math.abs(stats.remaining), userCurrency)}
                      </div>
                      {stats.isOverspent && (
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/30">
                          <AlertTriangle size={14} /> {t('app.budgets.card.criticalOverspend')}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <span>{formatCurrency(0, userCurrency)}</span>
                        <span>{stats.percentage.toFixed(0)}% used</span>
                      </div>
                      <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner relative ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                        {stats.isOverspent && (
                          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white z-10"></div>
                        )}
                        <div
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${
                            stats.isOverspent ? "bg-red-500" : "bg-violet-500"
                          }`}
                          style={{ width: `${stats.displayPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-2">
                          <DollarSign size={16} />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {t('app.budgets.card.allocated')}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(stats.allocated, userCurrency)}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-2">
                          <TrendingDown size={16} />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {t('app.budgets.card.spent')}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(stats.spent, userCurrency)}
                        </p>
                      </div>
                    </div>

                    {localBudget.description && (
                      <div className="p-5 rounded-2xl bg-violet-50/50 dark:bg-violet-900/10 text-violet-900 dark:text-violet-100 text-sm border border-violet-100 dark:border-violet-800/30 leading-relaxed">
                        <span className="font-bold block mb-2 text-xs uppercase opacity-60 tracking-wider">
                          {t('app.budgets.card.note')}
                        </span>
                        {localBudget.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Panel: Transaction History */}
              <div
                className={`flex-1 bg-white dark:bg-gray-900 flex-col h-full overflow-hidden border-l border-gray-50 dark:border-gray-800 ${
                  activeTab === "history" ? "flex" : "hidden lg:flex"
                }`}
              >
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  <div className="h-full flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <History size={20} className="text-violet-500" />
                      {t('app.budgets.card.historyTitle')}
                    </h3>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                      {transactionsLoading ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                           {t('app.budgets.card.loadingHistory')}
                        </div>
                      ) : historyTransactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                           {t('app.budgets.card.noTransactions')}
                        </div>
                      ) : (
                        historyTransactions.map((tx) => (
                          <div key={tx.id} className="group relative flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                  {tx.category ? (
                                    <span className="text-xl">{tx.category.icon}</span>
                                  ) : (
                                    <Tag size={16} className="text-gray-400" />
                                  )}
                               </div>
                               <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                     {tx.description || tx.category?.name || "Untitled"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                     {new Date(tx.date).toLocaleDateString() || t('app.budgets.card.noDate')}
                                  </p>
                               </div>
                             </div>

                             <div className="flex items-center gap-4">
                               <span className="font-bold text-gray-900 dark:text-white">
                                  {formatCurrency(tx.amount, userCurrency)}
                               </span>

                               <button
                                 onClick={() => onDeleteTransaction(tx)}
                                 className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                 title={t('app.budgets.card.deleteTransaction')}
                               >
                                  <Trash2 size={14} />
                               </button>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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
