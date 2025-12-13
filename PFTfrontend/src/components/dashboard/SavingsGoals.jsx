import React from "react";
import { PlusCircle, Target, PiggyBank } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const SavingsGoals = ({ savings, userCurrency }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('app.dashboard.savings.title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('app.dashboard.savings.subtitle')}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
          <Target size={20} />
        </div>
      </div>

      {savings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
          <div className="mb-3 rounded-full bg-gray-100 dark:bg-gray-800 p-3">
            <PiggyBank size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('app.dashboard.savings.noGoals')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savings.map((s) => (
            <div
              key={s.id}
              className="group relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5 shadow-sm transition-all hover:shadow-md"
            >
              {/* Decorative Background */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-bl-full bg-teal-50 dark:bg-teal-900/10 transition-transform group-hover:scale-110" />
              <Target
                className="absolute right-3 top-3 text-teal-200 dark:text-teal-900/30"
                size={24}
              />

              <div className="relative z-10">
                <h4 className="mb-1 truncate text-lg font-bold text-gray-900 dark:text-white">
                  {s.name}
                </h4>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  {t('app.dashboard.savings.target')}: {formatCurrency(s.target, userCurrency)}
                </p>

                <div className="mb-2 flex items-end justify-between">
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {formatCurrency(s.current, userCurrency)}
                  </span>
                  <span className="rounded-lg bg-teal-50 dark:bg-teal-900/20 px-2 py-1 text-xs font-bold text-teal-700 dark:text-teal-300">
                    {s.percent.toFixed(0)}%
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-700 ease-out"
                    style={{ width: `${s.widthPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SavingsGoals;
