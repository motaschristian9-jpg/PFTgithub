import { BarChart as BarIcon, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ReportsHeader({ onExport }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full max-w-full">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
          {t('app.reports.header.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {t('app.reports.header.subtitle')}
        </p>
      </div>

      <button
        onClick={onExport}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <Download size={18} />
        <span>{t('app.reports.header.exportBtn')}</span>
      </button>
    </div>
  );
}
