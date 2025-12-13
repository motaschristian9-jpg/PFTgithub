import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency } from "../../utils/currency";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

const BudgetHistoryCharts = ({ budgets, userCurrency, getBudgetSpent }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [effectiveTheme, setEffectiveTheme] = React.useState("light");

  React.useEffect(() => {
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setEffectiveTheme(isDark ? "dark" : "light");
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  const isDark = effectiveTheme === "dark";

  // Colors
  // Colors
  const gridColor = isDark ? "#374151" : "#f3f4f6";
  const axisTextColor = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";
  const tooltipText = isDark ? "#f3f4f6" : "#111827"; // gray-100 : gray-900
  
  // Theme-specific accent for text (Violet)
  const tooltipAccent = isDark ? "#a78bfa" : "#7c3aed"; // violet-400 : violet-600

  // --- 1. Adherence Data (Pie Chart) ---
  const adherenceData = useMemo(() => {
    let under = 0;
    let over = 0;

    budgets.forEach((b) => {
      const spent = getBudgetSpent ? getBudgetSpent(b) : 0;
      const allocated = Number(b.amount);
      if (spent > allocated) {
        over++;
      } else {
        under++;
      }
    });

    return [
      { name: t('app.budgets.charts.underBudget'), value: under, color: "#10b981" }, // Emerald-500
      { name: t('app.budgets.charts.overBudget'), value: over, color: "#ef4444" },   // Red-500
    ];
  }, [budgets, getBudgetSpent, t]);

  // --- 2. Trend Data (Bar + Line Chart) ---
  const trendData = useMemo(() => {
    // Take the last 10 completed budgets (assuming budgets are sorted by date desc)
    // We reverse them to show chronological order (oldest -> newest) on the chart
    return [...budgets]
      .slice(0, 10)
      .reverse()
      .map((b) => ({
        name: b.name,
        allocated: Number(b.amount),
        spent: getBudgetSpent ? getBudgetSpent(b) : 0,
        date: new Date(b.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }));
  }, [budgets, getBudgetSpent]);

  if (budgets.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Adherence Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-violet-600 dark:text-violet-400" />
          {t('app.budgets.charts.successRate')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('app.budgets.charts.successRateDesc')}
        </p>
        
        <div className="flex-1 min-h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={adherenceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {adherenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [t('app.budgets.charts.budgetsCount', { count: value }), ""]}
                contentStyle={{ 
                  backgroundColor: tooltipBg,
                  borderRadius: "12px", 
                  border: `1px solid ${tooltipBorder}`, 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  color: tooltipText
                }}
                itemStyle={{ color: tooltipAccent, fontWeight: 500 }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round((adherenceData[0].value / budgets.length) * 100) || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <AlertCircle size={20} className="text-violet-600 dark:text-violet-400" />
          {t('app.budgets.charts.spendingTrend')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('app.budgets.charts.spendingTrendDesc')}
        </p>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: axisTextColor, fontSize: 12 }}
                dy={10}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: axisTextColor, fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, userCurrency, true)}
              />
              <Tooltip
                cursor={{ fill: isDark ? "#374151" : "#f9fafb", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderRadius: "12px",
                  border: `1px solid ${tooltipBorder}`,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ color: tooltipAccent, fontWeight: 500 }}
                formatter={(value) => [formatCurrency(value, userCurrency), ""]}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar dataKey="allocated" name={t('app.budgets.charts.limit')} fill="#ddd6fe" radius={[4, 4, 0, 0]} barSize={30} />
              <Line 
                type="monotone" 
                dataKey="spent" 
                name={t('app.budgets.charts.spent')} 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BudgetHistoryCharts;
