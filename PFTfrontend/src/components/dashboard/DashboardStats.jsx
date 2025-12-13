import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { motion } from "framer-motion";

const StatCard = ({ title, amount, icon: Icon, type, currency }) => {
  const getTheme = () => {
    switch (type) {
      case "income":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          text: "text-emerald-600 dark:text-emerald-400",
          iconColor: "text-emerald-200 dark:text-emerald-900/40",
        };
      case "expense":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-600 dark:text-red-400",
          iconColor: "text-red-200 dark:text-red-900/40",
        };
      case "balance":
        return amount >= 0
          ? {
              bg: "bg-blue-50 dark:bg-blue-900/20",
              text: "text-blue-600 dark:text-blue-400",
              iconColor: "text-blue-200 dark:text-blue-900/40",
            }
          : {
              bg: "bg-red-50 dark:bg-red-900/20",
              text: "text-red-600 dark:text-red-400",
              iconColor: "text-red-200 dark:text-red-900/40",
            };
      case "savings":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-900/20",
          text: "text-indigo-600 dark:text-indigo-400",
          iconColor: "text-indigo-200 dark:text-indigo-900/40",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800",
          text: "text-gray-600 dark:text-gray-400",
          iconColor: "text-gray-200 dark:text-gray-700",
        };
    }
  };

  const theme = getTheme();

  return (
    <motion.div 
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {/* Decorative Background */}
      <div
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-bl-full transition-transform group-hover:scale-110 ${theme.bg}`}
      />
      
      {/* Icon */}
      <Icon className={`absolute right-3 top-3 ${theme.iconColor}`} size={24} />

      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold tracking-tight ${theme.text}`}>
          {formatCurrency(amount, currency)}
        </h3>
      </div>
    </motion.div>
  );
};

const DashboardStats = ({ stats, userCurrency }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      initial="hidden"
      animate="visible"
    >
      <StatCard
        title={t('app.dashboard.stats.income')}
        amount={stats.income}
        icon={TrendingUp}
        type="income"
        currency={userCurrency}
      />
      <StatCard
        title={t('app.dashboard.stats.expenses')}
        amount={stats.expenses}
        icon={TrendingDown}
        type="expense"
        currency={userCurrency}
      />
      <StatCard
        title={t('app.dashboard.stats.netBalance')}
        amount={stats.net}
        icon={Wallet}
        type="balance"
        currency={userCurrency}
      />
      <StatCard
        title={t('app.dashboard.stats.totalSavings')}
        amount={stats.totalSavings}
        icon={PiggyBank}
        type="savings"
        currency={userCurrency}
      />
    </motion.div>
  );
};

export default DashboardStats;
