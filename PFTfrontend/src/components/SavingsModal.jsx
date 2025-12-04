import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  PiggyBank,
  Target,
  Check,
  TrendingUp,
  FileText,
} from "lucide-react";

import { formatCurrency } from "../utils/currency";
import { useSavingsModalLogic } from "../hooks/useSavingsModalLogic";

export default function SavingsModal({
  isOpen,
  onClose,
  onSave,
  editMode = false,
  saving = null,
  activeCount = 0,
}) {
  const {
    loading,
    userCurrency,
    currencySymbol,
    register,
    handleSubmit,
    errors,
    watchedTarget,
    watchedCurrent,
    watchedName,
    progressPreview,
    onSubmit,
  } = useSavingsModalLogic({
    isOpen,
    onClose,
    onSave,
    editMode,
    saving,
  });

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[50] flex justify-center items-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/20">
              {/* Header Section */}
              <div className="relative px-8 pt-8 pb-6 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    {editMode ? "Edit Goal" : "New Savings Goal"}
                    {!editMode && (
                      <span className="text-sm font-medium px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
                        {activeCount}/6
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center py-2">
                  <label className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-2">
                    Target Goal Amount
                  </label>
                  <div className="relative w-full flex justify-center items-baseline group">
                    <span className="text-4xl font-medium text-teal-500 absolute left-[15%] sm:left-[20%] top-1 transition-colors duration-300">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...register("target_amount", {
                        required: "Target amount is required",
                        min: { value: 0.01, message: "Target must be > 0" },
                      })}
                      disabled={loading}
                      className="block w-full text-center text-6xl font-bold bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-200 text-gray-900 tracking-tight outline-none"
                      autoFocus
                    />
                  </div>
                  {errors.target_amount && (
                    <p className="text-red-500 text-sm mt-2 font-medium bg-red-50 px-3 py-1 rounded-full">
                      {errors.target_amount.message}
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
                    <Target size={12} /> Goal Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New MacBook, Vacation"
                    {...register("name", { required: "Goal name is required" })}
                    disabled={loading}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-400"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>
                  )}
                </div>

                {editMode && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <TrendingUp size={12} /> Already Saved?{" "}
                      <span className="text-gray-400 font-normal lowercase ml-1">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...register("current_amount", {
                        min: { value: 0, message: "Cannot be negative" },
                      })}
                      disabled={loading}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <FileText size={12} /> Description
                  </label>
                  <textarea
                    rows="2"
                    placeholder="What is this for?"
                    {...register("description")}
                    disabled={loading}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none resize-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                {watchedTarget && watchedName && (
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-teal-800 uppercase">
                        Preview
                      </span>
                      <span className="text-xs font-medium text-teal-600">
                        {progressPreview.toFixed(0)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-teal-200/50 rounded-full h-2 mb-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPreview}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-teal-700 font-medium">
                      <span>{watchedName}</span>
                      <span>
                        <span className="text-teal-700 font-bold">
                          {formatCurrency(
                            parseFloat(watchedCurrent || 0),
                            userCurrency
                          )}
                        </span>{" "}
                        / {formatCurrency(parseFloat(watchedTarget), userCurrency)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-500 shadow-teal-200"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <Check size={24} strokeWidth={3} />
                      {editMode ? "Update Goal" : "Set Goal"}
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
