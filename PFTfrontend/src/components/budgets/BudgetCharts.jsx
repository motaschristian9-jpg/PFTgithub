import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "../../utils/currency";
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
              {formatCurrency(entry.value, userCurrency)}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BudgetCharts = ({ budgets, userCurrency, getBudgetSpent }) => {
  const { t } = useTranslation();
  // Aggregate totals for all active budgets
  const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => {
    const spent = getBudgetSpent ? getBudgetSpent(b) : (b.transactions?.reduce((tSum, t) => tSum + Number(t.amount), 0) || 0);
    return sum + spent;
  }, 0);

  const data = [
    {
      name: t('app.budgets.charts.totalActiveBudgets'),
      allocated: totalAllocated,
      spent: totalSpent,
    },
  ];

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('app.budgets.charts.budgetVsSpent')}
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, userCurrency, true)}
              />
              <Tooltip
                cursor={{ fill: "#9ca3af", opacity: 0.1 }}
                content={<CustomTooltip userCurrency={userCurrency} />}
              />
              <Bar dataKey="allocated" name={t('app.budgets.charts.allocated')} fill="#ddd6fe" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name={t('app.budgets.charts.spent')} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-center items-center text-center">
         <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
         </div>
         <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('app.budgets.charts.spendingOverview')}</h3>
         <p className="text-gray-500 dark:text-gray-400 max-w-xs">
            {t('app.budgets.charts.spendingOverviewDesc')}
         </p>
      </div>
    </div>
  );
};

export default BudgetCharts;
