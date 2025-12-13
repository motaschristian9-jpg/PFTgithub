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
import { TrendingUp, AlertCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

const CustomTooltip = ({ active, payload, label, userCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl z-50">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            ></span>
            <span className="text-gray-600 dark:text-gray-300 capitalize">{entry.name}:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
               {typeof entry.value === 'number' ? formatCurrency(entry.value, userCurrency) : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SavingsHistoryCharts = ({ savings, userCurrency }) => {
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
  const gridColor = isDark ? "#374151" : "#f3f4f6";
  const axisTextColor = isDark ? "#9ca3af" : "#6b7280";

  // --- 1. Surplus Analysis Data (Pie Chart) ---
  const surplusData = useMemo(() => {
    let totalTargetMet = 0;
    let totalSurplus = 0;

    savings.forEach((s) => {
      const current = Number(s.current_amount || 0);
      const target = Number(s.target_amount || 0);

      // Amount contributing to the target
      totalTargetMet += Math.min(current, target);

      // Amount exceeding the target
      if (current > target) {
        totalSurplus += (current - target);
      }
    });

    // Handle case where no data
    if (totalTargetMet === 0 && totalSurplus === 0) {
        return [
            { name: t('app.savings.charts.surplus.noData'), value: 1, color: isDark ? "#374151" : "#f3f4f6" }
        ];
    }

    return [
      { name: t('app.savings.charts.surplus.targetMet'), value: totalTargetMet, color: "#0d9488" }, // Teal-600
      { name: t('app.savings.charts.surplus.surplus'), value: totalSurplus, color: "#facc15" },   // Yellow-400
    ];
  }, [savings, isDark, t]);

  // --- 2. Savings Trend Data (Bar + Line Chart) ---
  const trendData = useMemo(() => {
    // Take the last 10 historical savings
    // Assuming savings are sorted by date desc, we reverse for chronological order
    return [...savings]
      .slice(0, 10)
      .reverse()
      .map((s) => ({
        name: s.name,
        target: Number(s.target_amount),
        saved: Number(s.current_amount),
        date: new Date(s.updated_at || s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }));
  }, [savings]);

  if (savings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Surplus Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <TrendingUp size={20} className="text-teal-600 dark:text-teal-400" />
          {t('app.savings.charts.surplus.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('app.savings.charts.surplus.subtitle')}
        </p>
        
        <div className="flex-1 min-h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={surplusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {surplusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip userCurrency={userCurrency} />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider block mb-1">{t('app.savings.charts.surplus.totalSaved')}</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(surplusData.reduce((acc, curr) => (curr.name === t('app.savings.charts.surplus.noData') ? 0 : acc + curr.value), 0), userCurrency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <AlertCircle size={20} className="text-teal-600 dark:text-teal-400" />
          {t('app.savings.charts.trend.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('app.savings.charts.trend.subtitle')}
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
              <Tooltip content={<CustomTooltip userCurrency={userCurrency} />} cursor={{ fill: isDark ? "#374151" : "#f9fafb", opacity: 0.4 }} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar dataKey="target" name={t('app.savings.charts.trend.target')} fill="#ccfbf1" radius={[4, 4, 0, 0]} barSize={30} />
              <Line 
                type="monotone" 
                dataKey="saved" 
                name={t('app.savings.charts.trend.saved')} 
                stroke="#0d9488" 
                strokeWidth={3}
                dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SavingsHistoryCharts;
