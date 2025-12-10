import React, { useMemo } from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "../../utils/currency";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";

const COLORS = [
  "#0d9488", // Teal 600
  "#059669", // Emerald 600
  "#0891b2", // Cyan 600
  "#2563eb", // Blue 600
  "#7c3aed", // Violet 600
  "#db2777", // Pink 600
];

const CustomTooltip = ({ active, payload, label, userCurrency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 text-xs">
        <p className="font-bold text-gray-900 dark:text-white mb-1">{data.name}</p>
        <div className="space-y-0.5">
          <p className="text-gray-500 dark:text-gray-300">
            Saved: <span className="font-bold text-teal-600 dark:text-teal-400">{formatCurrency(data.current, userCurrency)}</span>
          </p>
          <p className="text-gray-500 dark:text-gray-300">
            Target: <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(data.target, userCurrency)}</span>
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-1">
            {((data.current / data.target) * 100).toFixed(1)}% Completed
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const SavingsCharts = ({ savings, userCurrency }) => {
  const { radialData, pieData, totalSaved } = useMemo(() => {
    // Sort by percentage completion for radial chart
    const sorted = [...savings]
      .map((s) => ({
        name: s.name,
        current: Number(s.current_amount),
        target: Number(s.target_amount),
        fill: "#8884d8", // Placeholder, set below
      }))
      .sort((a, b) => (b.current / b.target) - (a.current / a.target))
      .slice(0, 6); // Top 6

    const radial = sorted.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
    }));

    // Filter out 0 amounts for pie chart
    const pie = savings
      .filter((s) => Number(s.current_amount) > 0)
      .map((s, index) => ({
        name: s.name,
        value: Number(s.current_amount),
        color: COLORS[index % COLORS.length],
      }));

    const total = savings.reduce((sum, s) => sum + Number(s.current_amount), 0);

    return { radialData: radial, pieData: pie, totalSaved: total };
  }, [savings]);

  if (savings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Radial Progress Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-600 dark:text-teal-400">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Goal Progress</h3>
        </div>
        
        <div className="h-[300px] w-full relative">
          {radialData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="100%"
                barSize={20}
                data={radialData}
                startAngle={180}
                endAngle={-180}
              >
                <RadialBar
                  minAngle={15}
                  label={{ position: "insideStart", fill: "#fff", fontSize: 10, fontWeight: "bold" }}
                  background
                  clockWise
                  dataKey="current"
                  cornerRadius={10}
                />
                <Legend
                  iconSize={8}
                  layout="vertical"
                  verticalAlign="middle"
                  wrapperStyle={{
                    right: 0,
                    top: "50%",
                    transform: "translate(0, -50%)",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#374151"
                  }}
                />
                <Tooltip content={<CustomTooltip userCurrency={userCurrency} />} />
              </RadialBarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                <p>No active goals to display</p>
             </div>
          )}
        </div>
      </div>

      {/* Growth Tracker Text Panel */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-center items-center text-center">
         <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 dark:text-teal-400"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
         </div>
         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Growth Tracker</h3>
         <p className="text-gray-500 dark:text-gray-400 max-w-xs">
            Watch your savings grow and track your progress towards your financial goals.
         </p>
      </div>
    </div>
  );
};

export default SavingsCharts;
