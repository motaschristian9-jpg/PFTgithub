import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, iconColorClass }) => {
  // Extract base color from classes
  const getColorTheme = () => {
    if (colorClass.includes("emerald")) return { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-200 dark:text-emerald-900/40" };
    if (colorClass.includes("rose")) return { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-600 dark:text-rose-400", icon: "text-rose-200 dark:text-rose-900/40" };
    if (colorClass.includes("blue")) return { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", icon: "text-blue-200 dark:text-blue-900/40" };
    return { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-300", icon: "text-gray-200 dark:text-gray-700" };
  };

  const theme = getColorTheme();

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 min-w-0">
      {/* Decorative Background */}
      <div
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-bl-full transition-transform group-hover:scale-110 ${theme.bg}`}
      />
      
      {/* Icon */}
      <Icon className={`absolute right-3 top-3 ${theme.icon}`} size={24} />

      <div className="relative z-10">
        <p className="text-xs min-[480px]:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 truncate pr-6">{title}</p>
        <h3 className={`text-lg min-[480px]:text-2xl font-bold tracking-tight ${theme.text} truncate`}>
          {value}
        </h3>
      </div>
    </div>
  );
};

export default function ReportsStats({ stats, userCurrency }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Total Income"
        value={formatCurrency(stats.income, userCurrency)}
        icon={TrendingUp}
        colorClass="text-emerald-600"
        bgClass="bg-emerald-50"
        iconColorClass="text-emerald-600"
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(stats.expenses, userCurrency)}
        icon={TrendingDown}
        colorClass="text-rose-600"
        bgClass="bg-rose-50"
        iconColorClass="text-rose-600"
      />
      <StatCard
        title="Net Balance"
        value={formatCurrency(stats.net, userCurrency)}
        icon={Wallet}
        colorClass={stats.net >= 0 ? "text-blue-600" : "text-rose-600"}
        bgClass="bg-blue-50"
        iconColorClass="text-blue-600"
      />
    </section>
  );
}
