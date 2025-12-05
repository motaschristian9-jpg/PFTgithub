import { createPortal } from "react-dom";
import { Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Calendar,
  FileText,
  CreditCard,
  PieChart,
  TrendingUp,
  Wallet,
  Check,
  ArrowRightLeft,
  DollarSign,
  Tag,
  Type,
} from "lucide-react";

import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import { useTransactionModalLogic } from "../hooks/useTransactionModalLogic";

const TypeTabs = ({ type, setType, editMode }) => (
  <div className="flex p-1 bg-gray-100/80 rounded-lg mb-4 relative w-full max-w-[200px] mx-auto">
    {(!editMode || type === "income") && (
      <button
        type="button"
        disabled={editMode}
        onClick={() => setType("income")}
        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
          type === "income"
            ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
            : "text-gray-500 hover:text-gray-700"
        } ${editMode ? "cursor-not-allowed opacity-100 w-full" : ""}`}
      >
        <TrendingUp size={14} />
        Income
      </button>
    )}
    {(!editMode || type === "expense") && (
      <button
        type="button"
        disabled={editMode}
        onClick={() => setType("expense")}
        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
          type === "expense"
            ? "bg-white text-rose-600 shadow-sm ring-1 ring-black/5"
            : "text-gray-500 hover:text-gray-700"
        } ${editMode ? "cursor-not-allowed opacity-100 w-full" : ""}`}
      >
        <CreditCard size={14} />
        Expense
      </button>
    )}
  </div>
);

const BudgetStatusCard = ({ budget, userCurrency }) => {
  if (!budget) return null;

  const spent = budget.spent || 0;
  const allocated = parseFloat(budget.amount);
  const remaining = allocated - spent;
  const percentage = Math.min((spent / allocated) * 100, 100);
  const isOver = remaining < 0;

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-1.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white rounded-md shadow-sm text-violet-600">
            <PieChart size={14} />
          </div>
          <span className="font-semibold text-gray-700 text-xs">
            {budget.name}
          </span>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
            isOver
              ? "bg-red-50 text-red-700 border-red-100"
              : "bg-violet-50 text-violet-700 border-violet-100"
          }`}
        >
          {isOver ? "Over" : "On Track"}
        </span>
      </div>

      <div className="relative z-10">
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-1">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver ? "bg-red-500" : "bg-violet-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400">
            {formatCurrency(spent, userCurrency)} spent
          </span>
          <span
            className={`font-semibold ${
              isOver ? "text-red-600" : "text-violet-600"
            }`}
          >
            {formatCurrency(remaining, userCurrency)} left
          </span>
        </div>
      </div>
    </div>
  );
};

const SavingsSection = ({
  register,
  saveToSavings,
  setSaveToSavings,
  savingsGoals,
  watch,
  userCurrency,
}) => {
  const selectedGoalId = watch("savingsGoalId");
  const selectedGoal = savingsGoals.find((g) => g.id == selectedGoalId);
  const currencySymbol = getCurrencySymbol(userCurrency);

  return (
    <div
      className={`border rounded-xl transition-all duration-300 overflow-hidden ${
        saveToSavings
          ? "border-teal-200 bg-teal-50/30"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <label className="flex items-center justify-between p-3 cursor-pointer select-none">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              saveToSavings
                ? "bg-teal-100 text-teal-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <Wallet size={16} />
          </div>
          <div>
            <p className="font-semibold text-xs text-gray-800">
              Allocate to Savings
            </p>
          </div>
        </div>
        <div
          className={`w-9 h-5 flex items-center rounded-full p-0.5 duration-300 ease-in-out ${
            saveToSavings ? "bg-teal-500" : "bg-gray-200"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${
              saveToSavings ? "translate-x-4" : ""
            }`}
          ></div>
        </div>
        <input
          type="checkbox"
          checked={saveToSavings}
          onChange={(e) => setSaveToSavings(e.target.checked)}
          className="hidden"
        />
      </label>

      {saveToSavings && (
        <div className="px-3 pb-3 pt-0 space-y-3 animate-in slide-in-from-top-2">
          <div className="h-px bg-teal-100 w-full" />
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">
              Select Goal
            </label>
            <div className="relative">
              <select
                {...register("savingsGoalId", {
                  required: saveToSavings ? "Please select a goal" : false,
                })}
                className="block w-full px-2 py-2 bg-white border border-teal-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:border-transparent outline-none appearance-none"
              >
                <option value="">Choose a goal...</option>
                {savingsGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-teal-600">
                <ArrowRightLeft size={12} className="rotate-90" />
              </div>
            </div>

            {selectedGoal && (
              <div className="flex justify-between items-center text-[10px] bg-white/50 p-1.5 rounded border border-teal-100 mt-1">
                <span className="text-teal-700">Progress:</span>
                <span className="font-bold text-teal-800">
                  {formatCurrency(Number(selectedGoal.current_amount), userCurrency)} 
                  <span className="text-teal-400 mx-1">/</span>
                  {formatCurrency(Number(selectedGoal.target_amount), userCurrency)}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">
                Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                {...register("savingsAmount")}
                placeholder="0.00"
                disabled={!!watch("savingsPercentage")}
                className={`block w-full px-2 py-2 border border-teal-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 outline-none ${
                  watch("savingsPercentage")
                    ? "bg-gray-100 cursor-not-allowed text-gray-400"
                    : "bg-white"
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">
                Percent (%)
              </label>
              <input
                type="number"
                step="1"
                {...register("savingsPercentage")}
                placeholder="10"
                disabled={!!watch("savingsAmount")}
                className={`block w-full px-2 py-2 border border-teal-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 outline-none ${
                  watch("savingsAmount")
                    ? "bg-gray-100 cursor-not-allowed text-gray-400"
                    : "bg-white"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TransactionModal({
  isOpen,
  onClose,
  onTransactionAdded,
  editMode = false,
  transactionToEdit = null,
}) {
  const {
    type,
    setType,
    loading,
    saveToSavings,
    setSaveToSavings,
    userCurrency,
    currencySymbol,
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    errors,
    savingsGoals,
    sortedCategories,
    budgetStatus,
    todayString,
    onSubmit,
    validateAmount,
  } = useTransactionModalLogic({
    isOpen,
    onClose,
    onTransactionAdded,
    editMode,
    transactionToEdit,
  });

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[50] flex justify-center items-end sm:items-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="relative z-10 w-full sm:max-w-md flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-white rounded-t-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/20 flex flex-col">
              {/* Header Section - Fixed */}
              <div className="relative px-6 pt-6 pb-4 bg-white shrink-0 z-20">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editMode ? "Edit Transaction" : "New Transaction"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {!editMode && (
                  <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg flex items-start gap-2">
                    <div className="mt-0.5 text-blue-500">
                      <Loader2 size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                    <p className="text-[10px] text-blue-600 leading-tight">
                      <strong>Note:</strong> Transactions can only be edited within 1 hour of creation.
                    </p>
                  </div>
                )}

                <TypeTabs type={type} setType={setType} editMode={editMode} />

                <div className="flex flex-col items-center justify-center py-1">
                  <div className="relative w-full flex justify-center items-baseline group">
                    <span
                      className="text-3xl font-medium absolute left-[15%] sm:left-[20%] top-1 transition-colors duration-300 text-gray-400"
                    >
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("amount", {
                        required: "Required",
                        validate: validateAmount,
                      })}
                      className="block w-full text-center text-5xl font-bold bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-200 tracking-tight outline-none text-gray-900"
                      autoFocus
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Section - Scrollable */}
              <div className="overflow-y-auto px-6 pb-6 space-y-4 custom-scrollbar">
                <form
                  id="transaction-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Calendar size={10} /> Date
                      </label>
                      <input
                        type="date"
                        max={todayString}
                        {...register("transaction_date", {
                          required: "Required",
                          validate: (value) => {
                            if (budgetStatus) {
                              const d = new Date(value);
                              d.setHours(0, 0, 0, 0);
                              const start = new Date(budgetStatus.start_date);
                              start.setHours(0, 0, 0, 0);
                              const end = new Date(budgetStatus.end_date);
                              end.setHours(23, 59, 59, 999);
                              return d >= start || "Date before budget start";
                            }
                            return true;
                          },
                        })}
                        className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-700"
                      />
                      {errors.transaction_date && (
                        <p className="text-red-500 text-[10px] font-medium">
                          {errors.transaction_date.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Tag size={10} /> Category
                      </label>
                      <div className="relative">
                        <Controller
                          name="category"
                          control={control}
                          rules={{ required: "Required" }}
                          render={({ field }) => (
                            <select
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                trigger("transaction_date");
                              }}
                              className="block w-full pl-3 pr-7 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer text-gray-700"
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              {sortedCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400">
                          <div className="h-3 w-3 border-l-2 border-b-2 border-current transform -rotate-45 translate-y-[-2px]" />
                        </div>
                      </div>
                      {errors.category && (
                        <p className="text-red-500 text-[10px] font-medium">
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Type size={10} /> Description
                    </label>
                    <input
                      type="text"
                      placeholder="What is this for?"
                      {...register("name", { required: "Name is required" })}
                      className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-400"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[10px] font-medium">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="relative group">
                    <FileText
                      size={14}
                      className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                    />
                    <textarea
                      placeholder="Add a note (optional)"
                      rows={2}
                      {...register("description")}
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none text-gray-700"
                    />
                  </div>

                  <BudgetStatusCard
                    budget={budgetStatus}
                    userCurrency={userCurrency}
                  />

                  {type === "income" && (
                    <SavingsSection
                      register={register}
                      saveToSavings={saveToSavings}
                      setSaveToSavings={setSaveToSavings}
                      savingsGoals={savingsGoals}
                      watch={watch}
                      userCurrency={userCurrency}
                    />
                  )}
                </form>
              </div>

              {/* Footer Section - Fixed */}
              <div className="p-6 pt-2 bg-white border-t border-gray-50 shrink-0 z-20">
                <button
                  type="submit"
                  form="transaction-form"
                  disabled={loading}
                  className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 shadow-blue-200"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Check size={20} strokeWidth={3} />
                      {editMode ? "Save Changes" : "Add Transaction"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
