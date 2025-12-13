import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SavingsHeader({ onAddSaving }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t('app.savings.header.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('app.savings.header.subtitle')}
        </p>
      </div>

      <button
        onClick={onAddSaving}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <Plus size={18} />
        <span>{t('app.savings.header.createBtn')}</span>
      </button>
    </div>
  );
}
