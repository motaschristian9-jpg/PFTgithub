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

const BudgetHistoryCharts = ({ budgets, userCurrency, getBudgetSpent }) => {
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
      { name: "Under Budget", value: under, color: "#10b981" }, // Emerald-500
      { name: "Over Budget", value: over, color: "#ef4444" },   // Red-500
    ];
  }, [budgets, getBudgetSpent]);

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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-violet-600" />
          Success Rate
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Budgets kept within limit
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
                formatter={(value) => [`${value} Budgets`, ""]}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-900">
                {Math.round((adherenceData[0].value / budgets.length) * 100) || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle size={20} className="text-violet-600" />
          Spending Trend
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Last 10 budgets: Planned vs. Actual
        </p>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, userCurrency, true)}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [formatCurrency(value, userCurrency), ""]}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar dataKey="allocated" name="Limit" fill="#ddd6fe" radius={[4, 4, 0, 0]} barSize={30} />
              <Line 
                type="monotone" 
                dataKey="spent" 
                name="Spent" 
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
