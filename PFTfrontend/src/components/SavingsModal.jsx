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
import { useTranslation } from "react-i18next";

export default function SavingsModal({
  isOpen,
  onClose,
  onSave,
  editMode = false,
  saving = null,
  activeCount = 0,
}) {
  const { t } = useTranslation();
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
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/20">
              {/* Header Section */}
              <div className="relative px-8 pt-8 pb-6 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    {editMode ? t('app.savings.modal.titleEdit') : t('app.savings.modal.titleNew')}
                    {!editMode && (
                      <span className="text-sm font-medium px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30">
                        {activeCount}/6
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center py-2">
                  <label className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-2">
                    {t('app.savings.modal.targetLabel')}
                  </label>
                  <div className="relative w-full flex justify-center items-baseline group">
                    <span className="text-4xl font-medium text-teal-500 dark:text-teal-400 absolute left-[15%] sm:left-[20%] top-1 transition-colors duration-300">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      placeholder={t('app.savings.modal.targetPlaceholder')}
                      step="0.01"
                      {...register("target_amount", {
                        required: t('app.savings.modal.targetRequired'),
                        min: { value: 0.01, message: t('app.savings.modal.targetMin') },
                      })}
                      disabled={loading}
                      className="block w-full text-center text-6xl font-bold bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-200 dark:placeholder-gray-700 text-gray-900 dark:text-white tracking-tight outline-none"
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
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
                    <Target size={12} /> {t('app.savings.modal.nameLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('app.savings.modal.namePlaceholder')}
                    {...register("name", { required: t('app.savings.modal.nameRequired') })}
                    disabled={loading}
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>
                  )}
                </div>

                {editMode && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
                      <TrendingUp size={12} /> {t('app.savings.modal.alreadySavedLabel')}{" "}
                      <span className="text-gray-400 font-normal lowercase ml-1">
                        {t('app.savings.modal.alreadySavedOptional')}
                      </span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...register("current_amount", {
                        min: { value: 0, message: t('app.savings.modal.currentMin') },
                      })}
                      disabled={loading}
                      className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
                    <FileText size={12} /> {t('app.savings.modal.descriptionLabel')}
                  </label>
                  <textarea
                    rows="2"
                    placeholder={t('app.savings.modal.descriptionPlaceholder')}
                    {...register("description")}
                    disabled={loading}
                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>

                {watchedTarget && watchedName && (
                  <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/30 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase">
                        {t('app.savings.modal.preview')}
                      </span>
                      <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                        {progressPreview.toFixed(0)}% {t('app.savings.modal.complete')}
                      </span>
                    </div>
                    <div className="w-full bg-teal-200/50 dark:bg-teal-900/40 rounded-full h-2 mb-2">
                      <div
                        className="bg-teal-500 dark:bg-teal-400 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPreview}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-teal-700 dark:text-teal-300 font-medium">
                      <span>{watchedName}</span>
                      <span>
                        <span className="text-teal-700 dark:text-teal-300 font-bold">
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
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-500 shadow-teal-200 dark:shadow-teal-900/20"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <Check size={24} strokeWidth={3} />
                      {editMode ? t('app.savings.modal.saveBtn.update') : t('app.savings.modal.saveBtn.create')}
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
