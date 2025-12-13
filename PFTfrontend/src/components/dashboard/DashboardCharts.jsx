import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { formatCurrency } from "../../utils/currency";
import { TrendingUp } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const CustomTooltip = ({ active, payload, label, userCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl z-50">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-gray-600 dark:text-gray-300 capitalize">{entry.name}:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(entry.value, userCurrency)}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const DashboardCharts = ({ data, userCurrency }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <motion.div 
      className="flex h-[400px] flex-col rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('app.dashboard.charts.title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('app.dashboard.charts.subtitle')}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? "#374151" : "#F3F4F6"}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <Tooltip
              content={<CustomTooltip userCurrency={userCurrency} />}
              cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name={t('app.dashboard.charts.income')}
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorIncome)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              name={t('app.dashboard.charts.expense')}
              stroke="#EF4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
            <Area
              type="monotone"
              dataKey="savings"
              name={t('app.dashboard.charts.savings')}
              stroke="#14B8A6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSavings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default DashboardCharts;
