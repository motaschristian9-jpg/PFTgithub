import { Banknote, Target, Award, Trophy } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, iconColorClass }) => {
  // Extract base color from classes
  const getColorTheme = () => {
    if (colorClass.includes("emerald") || colorClass.includes("green")) return { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-200 dark:text-emerald-900/40" };
    if (colorClass.includes("teal")) return { bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-600 dark:text-teal-400", icon: "text-teal-200 dark:text-teal-900/40" };
    if (colorClass.includes("blue")) return { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", icon: "text-blue-200 dark:text-blue-900/40" };
    if (colorClass.includes("purple")) return { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", icon: "text-purple-200 dark:text-purple-900/40" };
    if (colorClass.includes("red")) return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", icon: "text-red-200 dark:text-red-900/40" };
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

export default function SavingsStats({ stats, userCurrency }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Total Saved"
        value={formatCurrency(stats.totalSaved, userCurrency)}
        icon={Banknote}
        colorClass="text-teal-600"
        bgClass="bg-teal-50"
        iconColorClass="text-teal-600"
      />
      <StatCard
        title="Top Goal"
        value={stats.topGoal ? stats.topGoal.name : "N/A"}
        icon={Trophy}
        colorClass="text-emerald-600"
        bgClass="bg-emerald-50"
        iconColorClass="text-emerald-600"
      />
      <StatCard
        title="Remaining"
        value={formatCurrency(stats.totalRemaining, userCurrency)}
        icon={Award}
        colorClass="text-teal-600"
        bgClass="bg-teal-50"
        iconColorClass="text-teal-600"
      />
    </section>
  );
}
