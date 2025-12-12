import { createPortal } from "react-dom";
import { Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Calendar,
  Target,
  PieChart,
  Check,
  Clock,
  Type,
  Tag,
} from "lucide-react";

import { useBudgetModalLogic } from "../hooks/useBudgetModalLogic";

export default function BudgetModal({
  isOpen,
  onClose,
  onSave,
  editMode = false,
  budget = null,
  categories = [],
  currentBudgets = [],
}) {
  const {
    loading,
    currencySymbol,
    register,
    handleSubmit,
    control,
    getValues,
    errors,
    sortedCategories,
    durationText,
    onSubmit,
  } = useBudgetModalLogic({
    isOpen,
    onClose,
    onSave,
    editMode,
    budget,
    categories,
  });

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[50] flex justify-center items-center p-4 sm:p-6"
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
            className="relative z-10 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/20">
              {/* Header Section */}
              <div className="relative px-8 pt-8 pb-6 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editMode ? "Edit Budget" : "New Budget"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center py-2">
                  <label className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2">
                    Budget Limit
                  </label>
                  <div className="relative w-full flex justify-center items-baseline group">
                    <span className="text-4xl font-medium text-violet-300 absolute left-[15%] sm:left-[20%] top-1 transition-colors duration-300">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...register("amount", {
                        required: "Amount is required",
                        min: { value: 0.01, message: "Must be greater than 0" },
                      })}
                      disabled={loading}
                      className="block w-full text-center text-6xl font-bold bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-200 dark:placeholder-gray-700 text-gray-900 dark:text-white tracking-tight outline-none"
                      autoFocus
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-2 font-medium bg-red-50 px-3 py-1 rounded-full">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Section */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="px-8 pb-8 space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Type size={12} /> Budget Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Monthly Groceries"
                    {...register("name", {
                      required: "Name is required",
                      maxLength: { value: 100, message: "Max 100 characters" },
                    })}
                    disabled={loading}
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Tag size={12} /> Category
                  </label>
                  <div className="relative">
                    <Controller
                      name="category_id"
                      control={control}
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <select
                          {...field}
                          disabled={loading}
                          className="block w-full pl-4 pr-8 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none appearance-none cursor-pointer text-gray-900 dark:text-white"
                        >
                          <option value="" disabled>
                            Select a category
                          </option>
                          {sortedCategories.map((cat) => {
                            const activeBudget = currentBudgets.find((b) => {
                              const idMatch = b.category_id == cat.id;
                              const budgetEnd = new Date(b.end_date);
                              budgetEnd.setHours(23, 59, 59, 999);
                              const now = new Date();
                              now.setHours(0, 0, 0, 0);
                              return idMatch && budgetEnd >= now;
                            });

                            const isDisabled =
                              activeBudget &&
                              (!editMode || activeBudget.id !== budget?.id);

                            return (
                              <option
                                key={cat.id}
                                value={cat.id}
                                disabled={isDisabled}
                                className={
                                  isDisabled ? "text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-600" : "bg-white dark:bg-gray-800"
                                }
                              >
                                {cat.name} {isDisabled ? "(Active)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <div className="h-4 w-4 border-l-2 border-b-2 border-current transform -rotate-45 translate-y-[-2px]" />
                    </div>
                  </div>
                  {errors.category_id && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.category_id.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Calendar size={12} /> Start Date
                    </label>
                    <input
                      type="date"
                      {...register("start_date")}
                      disabled={true}
                      className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Calendar size={12} /> End Date
                    </label>
                    <input
                      type="date"
                      {...register("end_date", {
                        required: "End date is required",
                        min: {
                          value: new Date().toISOString().split("T")[0],
                          message: "Cannot be in the past",
                        },
                        validate: (value) => {
                          const sDate = getValues("start_date");
                          if (!sDate) return true;
                          return (
                            new Date(value) > new Date(sDate) ||
                            "Must be after start date"
                          );
                        },
                      })}
                      min={new Date().toISOString().split("T")[0]}
                      disabled={loading}
                      className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none text-gray-900 dark:text-white"
                    />
                    {errors.end_date && (
                      <p className="text-red-500 text-xs font-medium">
                        {errors.end_date.message}
                      </p>
                    )}
                  </div>
                </div>

                {durationText && !errors.end_date && (
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 py-2.5 rounded-xl border border-violet-100 dark:border-violet-800">
                    <Clock size={14} />
                    <span>
                      Duration:{" "}
                      <span className="font-bold">{durationText}</span>
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl text-white font-bold text-base transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-violet-600 hover:bg-violet-500"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <Check size={24} strokeWidth={3} />
                      {editMode ? "Update Budget" : "Create Budget"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
