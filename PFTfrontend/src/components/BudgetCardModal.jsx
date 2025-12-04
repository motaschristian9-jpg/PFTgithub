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
} from "lucide-react";

import { formatCurrency } from "../utils/currency";
import { useBudgetCardModalLogic } from "../hooks/useBudgetCardModalLogic";

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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
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
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-violet-100 text-violet-600">
                  <PieChart size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    {localBudget.name}
                    {isReadOnly && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full uppercase tracking-wide font-bold">
                        Expired
                      </span>
                    )}
                  </h2>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-sm font-bold text-violet-600 uppercase tracking-wide">
                      {getCategoryName
                        ? getCategoryName(localBudget.category_id)
                        : localBudget.category}
                    </span>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(localBudget.start_date).toLocaleDateString()} -{" "}
                      {new Date(localBudget.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
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
                <button
                  onClick={onClose}
                  className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Left Panel: Budget Details / Edit Form */}
              <div className="w-full lg:w-[480px] bg-gray-50/50 flex flex-col border-r border-gray-100 overflow-y-auto">
                {isEditing ? (
                  <form
                    onSubmit={handleSubmit(handleSaveChanges)}
                    className="p-8 space-y-8 flex-1"
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      <label className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2">
                        Total Budget Limit
                      </label>
                      <div className="flex items-baseline justify-center relative w-full group">
                        <span className="text-4xl font-medium text-violet-400 absolute left-[15%] top-1 transition-colors duration-300">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          {...register("amount", { required: true, min: 0.01 })}
                          className="block w-full text-center text-6xl font-bold bg-transparent border-0 focus:ring-0 p-0 text-gray-900 placeholder-gray-300 tracking-tight outline-none"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                          <FileText size={12} /> Budget Name
                        </label>
                        <input
                          type="text"
                          {...register("name", { required: "Name is required" })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 text-sm font-medium shadow-sm"
                          placeholder="Budget Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                          <Calendar size={12} /> End Date
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
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 text-sm font-medium shadow-sm"
                        />
                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all duration-200 flex items-center justify-center gap-2 text-base transform hover:-translate-y-0.5"
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
              <div className="flex-1 bg-white flex flex-col h-full overflow-hidden border-l border-gray-50">
                <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
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
