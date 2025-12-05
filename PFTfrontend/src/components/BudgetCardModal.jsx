import { useState } from "react";
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
} from "lucide-react";

import { formatCurrency } from "../utils/currency";
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
  } = useBudgetCardModalLogic({
    isOpen,
    budget,
    onClose,
    onEditBudget,
    onDeleteTransaction,
    isReadOnlyProp,
  });

  const [activeTab, setActiveTab] = useState("overview");

  const isDataStale = isOpen && budget && localBudget?.id !== budget.id;

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
            className="relative z-50 w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/20"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shrink-0">
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-violet-100 text-violet-600 shrink-0">
                  <PieChart size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3 truncate">
                    {localBudget.name}
                    {isReadOnly && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full uppercase tracking-wide font-bold shrink-0">
                        Expired
                      </span>
                    )}
                  </h2>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-sm font-bold text-violet-600 uppercase tracking-wide truncate">
                      {getCategoryName
                        ? getCategoryName(localBudget.category_id)
                        : localBudget.category}
                    </span>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 truncate">
                      <Calendar size={14} className="shrink-0" />
                      {new Date(localBudget.start_date).toLocaleDateString()} -{" "}
                      {new Date(localBudget.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* Mobile Close Button */}
                <button
                  onClick={onClose}
                  className="sm:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 ml-auto"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {!isReadOnly && !isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2.5 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all duration-200"
                      title="Edit Budget"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(localBudget)}
                      className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      title="Delete Budget"
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
                {/* Desktop Close Button */}
                <button
                  onClick={onClose}
                  className="hidden sm:block p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="flex border-b border-gray-100 lg:hidden shrink-0">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "overview"
                    ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <LayoutDashboard size={16} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "history"
                    ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <History size={16} />
                History
              </button>
            </div>

            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Left Panel: Budget Details / Edit Form */}
              <div
                className={`w-full lg:w-[480px] bg-gray-50/50 flex flex-col border-r border-gray-100 overflow-y-auto ${
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
                      <p className="text-sm font-bold uppercase tracking-wider text-violet-600">
                        {stats.isOverspent ? "Over Budget By" : "Remaining Budget"}
                      </p>
                      <div className={`text-6xl font-black tracking-tighter ${stats.isOverspent ? "text-red-600" : "text-violet-900"}`}>
                        {formatCurrency(Math.abs(stats.remaining), userCurrency)}
                      </div>
                      {stats.isOverspent && (
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                          <AlertTriangle size={14} /> Critical Overspend
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                        <span>{formatCurrency(0, userCurrency)}</span>
                        <span>{stats.percentage.toFixed(0)}% used</span>
                      </div>
                      <div className="h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner relative ring-1 ring-gray-200/50">
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
                      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <DollarSign size={16} />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            Allocated
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stats.allocated, userCurrency)}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <TrendingDown size={16} />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            Spent
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stats.spent, userCurrency)}
                        </p>
                      </div>
                    </div>

                    {localBudget.description && (
                      <div className="p-5 rounded-2xl bg-violet-50/50 text-violet-900 text-sm border border-violet-100 leading-relaxed">
                        <span className="font-bold block mb-2 text-xs uppercase opacity-60 tracking-wider">
                          Note
                        </span>
                        {localBudget.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Panel: Transaction History */}
              <div
                className={`flex-1 bg-white flex-col h-full overflow-hidden border-l border-gray-50 ${
                  activeTab === "history" ? "flex" : "hidden lg:flex"
                }`}
              >
                <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-gray-800 flex items-center gap-3 text-lg">
                    Transaction History
                    <span className="px-2.5 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold">
                      {transactions.length}
                    </span>
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {isLoadingHistory ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-60">
                      <Loader2 className="animate-spin" size={40} />
                      <p className="text-sm font-medium">Loading transactions...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-60">
                      <div className="p-6 rounded-full bg-gray-50">
                        <Clock size={40} />
                      </div>
                      <p className="text-sm font-medium">No transactions yet</p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shadow-sm group-hover:bg-white group-hover:shadow-md transition-all duration-200">
                            <ArrowRight size={20} className="-rotate-45" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base">
                              {formatCurrency(Number(tx.amount), userCurrency)}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">
                              {tx.date || tx.transaction_date
                                ? new Date(
                                    tx.date || tx.transaction_date
                                  ).toLocaleDateString()
                                : "No Date"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {tx.name && (
                            <span className="text-sm font-medium text-gray-500 hidden sm:block truncate max-w-[120px]">
                              {tx.name}
                            </span>
                          )}
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
                    ))
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
