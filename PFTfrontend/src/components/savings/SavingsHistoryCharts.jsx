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

const SavingsHistoryCharts = ({ savings, userCurrency }) => {
  // --- 1. Completion Status Data (Pie Chart) ---
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
            { name: "No Data", value: 1, color: "#f3f4f6" }
        ];
    }

    return [
      { name: "Target Met", value: totalTargetMet, color: "#0d9488" }, // Teal-600
      { name: "Surplus (Bonus)", value: totalSurplus, color: "#facc15" },   // Yellow-400
    ];
  }, [savings]);

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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <TrendingUp size={20} className="text-teal-600" />
          Savings Surplus
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Base Goals vs. Bonus Savings
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
              <Tooltip 
                formatter={(value) => [formatCurrency(value, userCurrency), ""]}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-1">Total Saved</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(surplusData.reduce((acc, curr) => acc + curr.value, 0), userCurrency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle size={20} className="text-teal-600" />
          Savings Performance
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Last 10 goals: Target vs. Actual Saved
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
              <Bar dataKey="target" name="Target" fill="#ccfbf1" radius={[4, 4, 0, 0]} barSize={30} />
              <Line 
                type="monotone" 
                dataKey="saved" 
                name="Saved" 
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
