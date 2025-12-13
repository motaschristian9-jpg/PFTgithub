import {
  Target,
  ArrowRight,
  PiggyBank,
  AlertTriangle,
  Clock,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "react-i18next";

export default function ActiveSavingsList({
  savings,
  getProgressInfo,
  handleCardClick,
  userCurrency,
}) {
  const { t } = useTranslation();

  if (savings.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 p-12 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <PiggyBank className="text-gray-300 dark:text-gray-600" size={40} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('app.savings.activeList.emptyTitle')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-xs">
          {t('app.savings.activeList.emptyDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {savings.map((s) => {
        const current = Number(s.current_amount || 0);
        const target = Number(s.target_amount || 0);
        const percent = target > 0 ? (current / target) * 100 : 0;
        const widthPercent = Math.min(percent, 100);
        const progressInfo = getProgressInfo(current, target);

        return (
          <div
            key={s.id}
            className="group relative cursor-pointer"
            onClick={() => handleCardClick(s)}
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 overflow-hidden hover:-translate-y-1">
              {/* Top Progress Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${progressInfo.barColor}`}
              ></div>

              <div className="flex items-start justify-between mb-4 mt-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate uppercase tracking-wider font-medium">
                    {t('app.savings.activeList.target')}: {formatCurrency(target, userCurrency)}
                  </p>
                </div>
                <div className="ml-3">
                    <div
                        className={`w-8 h-8 ${progressInfo.iconBg} rounded-lg flex items-center justify-center ${progressInfo.textClass}`}
                    >
                        <Target size={16} />
                    </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-6 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg w-fit">
                <Calendar size={14} />
                <span className="truncate">
                    {t('app.savings.activeList.created')}: {new Date(s.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('app.savings.activeList.target')}</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {formatCurrency(target, userCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('app.savings.activeList.saved')}</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {formatCurrency(current, userCurrency)}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${progressInfo.barColor}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${progressInfo.colorClass}`}
                  >
                    {progressInfo.label}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {percent.toFixed(0)}%
                  </span>
                </div>
                
                <div className="mt-4 flex justify-end">
                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                        {t('app.savings.activeList.viewDetails')} →
                    </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
