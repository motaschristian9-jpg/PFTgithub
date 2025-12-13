import { DollarSign, Calendar, Type, Loader2, Save } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BudgetEditForm({
  register,
  handleSubmit,
  handleSaveChanges,
  isSaving,
  currencySymbol,
  startDateValue,
}) {
  const { t } = useTranslation();
  return (
    <form onSubmit={handleSubmit(handleSaveChanges)} className="p-8 space-y-6">
      <div className="space-y-4">
        {/* Amount Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <DollarSign size={12} /> {t('app.budgets.modal.limitLabel')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              {...register("amount", {
                required: t('app.budgets.modal.validation.amountRequired'),
                min: { value: 0.01, message: t('app.budgets.modal.validation.amountMin') },
              })}
              className="block w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 transition-all outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Type size={12} /> {t('app.budgets.modal.nameLabel')}
          </label>
          <input
            type="text"
            {...register("name", { required: t('app.budgets.modal.validation.nameRequired') })}
            className="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 transition-all outline-none text-gray-900 dark:text-white"
          />
        </div>

        {/* Date Fields Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar size={12} /> {t('app.budgets.modal.startDateLabel')}
            </label>
            <input
              type="date"
              {...register("start_date")}
              disabled
              className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar size={12} /> {t('app.budgets.modal.endDateLabel')}
            </label>
            <input
              type="date"
              {...register("end_date", {
                required: t('app.budgets.modal.validation.endDateRequired'),
                validate: (value) =>
                  new Date(value) > new Date(startDateValue) ||
                  t('app.budgets.modal.validation.endDateBeforeStart'),
              })}
              min={new Date().toISOString().split("T")[0]}
              className="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 transition-all outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Type size={12} /> {t('app.budgets.card.note')}
          </label>
          <textarea
            {...register("description")}
            rows="3"
            className="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 transition-all outline-none text-gray-900 dark:text-white resize-none"
            placeholder={t('app.budgets.modal.descriptionPlaceholder')}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-4 px-6 rounded-xl text-white font-bold text-base bg-violet-600 hover:bg-violet-700 transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.98]"
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {t('app.budgets.modal.saving')}
          </>
        ) : (
          <>
            <Save size={20} />
            {t('app.budgets.modal.updateBtn')}
          </>
        )}
      </button>
    </form>
  );
}
