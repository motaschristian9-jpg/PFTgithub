import { Loader2, Check, Target, TrendingUp, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SavingsEditForm({
  register,
  handleSubmit,
  handleSaveChanges,
  isSaving,
  currencySymbol,
}) {
  const { t } = useTranslation();
  return (
    <form onSubmit={handleSubmit(handleSaveChanges)} className="p-8 space-y-8 flex-1">
      <div className="flex flex-col items-center justify-center py-6">
        <label className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-2">
          {t('app.savings.modal.currentSaved')}
        </label>
        <div className="flex items-baseline justify-center relative w-full group">
          <span className="text-4xl font-medium text-teal-400 dark:text-teal-400/80 absolute left-[15%] top-1 transition-colors duration-300">
            {currencySymbol}
          </span>
          <input
            type="number"
            {...register("current_amount", {
              required: true,
              min: 0,
            })}
            className="block w-full text-center text-6xl font-bold bg-transparent border-0 focus:ring-0 p-0 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 tracking-tight outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={true}
          />
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
            <Target size={12} /> {t('app.savings.modal.nameLabel')}
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-900 dark:text-white text-sm font-medium shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
            <TrendingUp size={12} /> {t('app.savings.modal.targetLabel')}
          </label>
          <input
            type="number"
            {...register("target_amount", {
              required: true,
              min: 0.01,
            })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-900 dark:text-white text-sm font-medium shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
            <FileText size={12} /> {t('app.savings.modal.descriptionLabel')}
          </label>
          <textarea
            rows={3}
            {...register("description")}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm font-medium shadow-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-200 dark:shadow-teal-900/20 transition-all duration-200 flex items-center justify-center gap-2 text-base transform hover:-translate-y-0.5"
      >
        {isSaving ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <>
            <Check size={20} strokeWidth={3} /> {t('app.savings.modal.saveChanges')}
          </>
        )}
      </button>
    </form>
  );
}
