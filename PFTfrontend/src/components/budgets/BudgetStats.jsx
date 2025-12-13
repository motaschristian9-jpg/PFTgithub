import React from "react";
import { Banknote, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "react-i18next";

const StatCard = ({ title, value, icon: Icon, colorClass }) => {
  // Extract base color from classes (e.g., "text-emerald-600" -> "emerald")
  const getColorTheme = () => {
    if (colorClass.includes("emerald") || colorClass.includes("green")) return { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-200 dark:text-emerald-900/40" };
    if (colorClass.includes("violet")) return { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400", icon: "text-violet-200 dark:text-violet-900/40" };
    if (colorClass.includes("red")) return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", icon: "text-red-200 dark:text-red-900/40" };
    if (colorClass.includes("blue")) return { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", icon: "text-blue-200 dark:text-blue-900/40" };
    return { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: "text-gray-200 dark:text-gray-700" };
  };

  const theme = getColorTheme();

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Decorative Background */}
      <div
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-bl-full transition-transform group-hover:scale-110 ${theme.bg}`}
      />
      
      {/* Icon */}
      <Icon className={`absolute right-3 top-3 ${theme.icon}`} size={24} />

      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold tracking-tight ${theme.text}`}>
          {value}
        </h3>
      </div>
    </div>
  );
};

const BudgetStats = ({ stats, activeTab, userCurrency }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title={activeTab === "active" ? t('app.budgets.stats.activeAllocated') : t('app.budgets.stats.historyAllocated')}
        value={formatCurrency(stats.totalAllocated, userCurrency)}
        icon={Banknote}
        colorClass="text-violet-600"
      />
      <StatCard
        title={activeTab === "active" ? t('app.budgets.stats.activeSpent') : t('app.budgets.stats.historySpent')}
        value={formatCurrency(stats.totalSpent, userCurrency)}
        icon={TrendingUp}
        colorClass="text-violet-600"
      />
      <StatCard
        title={activeTab === "active" ? t('app.budgets.stats.activeCount') : t('app.budgets.stats.historyCount')}
        value={stats.count}
        icon={CheckCircle2}
        colorClass="text-violet-600"
      />
    </div>
  );
};

export default BudgetStats;
