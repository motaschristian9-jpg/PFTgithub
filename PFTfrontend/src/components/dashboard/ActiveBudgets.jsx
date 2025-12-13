import React from "react";
import { Target, Wallet } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const ActiveBudgets = ({ budgets, userCurrency }) => {
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('app.dashboard.budgets.title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('app.dashboard.budgets.subtitle')}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
          <Wallet size={20} />
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
          <div className="mb-3 rounded-full bg-gray-100 dark:bg-gray-800 p-3">
            <Wallet size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('app.dashboard.budgets.noBudgets')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="group relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5 shadow-sm transition-all hover:shadow-md"
            >
              {/* Decorative Background */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-bl-full bg-violet-50 dark:bg-violet-900/10 transition-transform group-hover:scale-110" />
              <Target
                className="absolute right-3 top-3 text-violet-200 dark:text-violet-900/30"
                size={24}
              />

              <div className="relative z-10">
                <h4 className="mb-1 truncate text-lg font-bold text-gray-900 dark:text-white pr-8">
                  {budget.name}
                </h4>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  {t('app.dashboard.budgets.limit')}: {formatCurrency(Number(budget.amount), userCurrency)}
                </p>

                <div className="mb-2 flex items-end justify-between">
                  <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {formatCurrency(budget.spent, userCurrency).replace(/^-/, "")}
                  </span>
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-bold ${
                      budget.remaining < 0
                        ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        : "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                    }`}
                  >
                    {budget.percent.toFixed(0)}%
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      budget.remaining < 0 ? "bg-red-500" : "bg-violet-500"
                    }`}
                    style={{ width: `${budget.widthPercent}%` }}
                  />
                </div>
                
                <div className="mt-2 text-xs font-medium text-gray-400 dark:text-gray-500 text-right">
                    {budget.remaining < 0 ? (
                        <span className="text-red-500 dark:text-red-400">{t('app.dashboard.budgets.overBy')} {formatCurrency(Math.abs(budget.remaining), userCurrency)}</span>
                    ) : (
                        <span>{formatCurrency(budget.remaining, userCurrency)} {t('app.dashboard.budgets.left')}</span>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ActiveBudgets;
