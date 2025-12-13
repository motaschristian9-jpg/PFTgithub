import React from "react";
import { Activity, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const RecentTransactions = ({ transactions, userCurrency }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      className="flex h-[400px] flex-col rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('app.dashboard.recentActivity.title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('app.dashboard.recentActivity.subtitle')}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
          <Activity size={20} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {transactions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <Activity size={32} className="mb-2 opacity-20" />
            <span className="text-sm">{t('app.dashboard.recentActivity.noTransactions')}</span>
          </div>
        ) : (
          transactions.map((t, index) => (
            <div
              key={index}
              className={`group flex items-center justify-between rounded-xl p-3 transition-all ${
                t.pending ? "bg-gray-50/50 dark:bg-gray-800/50" : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    t.pending
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                      : t.type === "income"
                      ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/40"
                      : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/40"
                  }`}
                >
                  {t.pending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : t.type === "income" ? (
                    <ArrowUpRight size={18} />
                  ) : (
                    <ArrowDownRight size={18} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                    {t.name || t.category_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.pending
                      ? t('app.dashboard.recentActivity.syncing')
                      : new Date(t.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-bold ${
                  t.pending
                    ? "text-gray-400 dark:text-gray-500"
                    : t.type === "income"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {formatCurrency(Number(t.amount), userCurrency).replace(
                  /^-/,
                  ""
                )}
              </p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default RecentTransactions;
