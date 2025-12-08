import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { BarChart as BarIcon, PieChart as PieIcon, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#6366F1",
];

const CurrencyInjectedTooltip = ({
  payload,
  label,
  userCurrency,
  isBar = false,
}) => {
  if (payload && payload.length) {
    const item = payload[0];
    const amount = Number(item.value);

    if (isBar) {
      const color =
        item.name === "Income" ? "text-emerald-600" : "text-rose-600";
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl z-50">
          <p className="text-sm font-bold text-gray-800 mb-1">{label}</p>
          <p className={`text-sm font-semibold ${color}`}>
            {formatCurrency(amount, userCurrency)}
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl z-50">
        <p className="text-sm font-bold text-gray-800 mb-1">{label}</p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-emerald-600">
            {formatCurrency(amount, userCurrency)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomTooltip = (props) => (
  <CurrencyInjectedTooltip
    {...props}
    userCurrency={props.userCurrency}
    isBar={false}
  />
);
const CustomBarTooltip = (props) => (
  <CurrencyInjectedTooltip
    {...props}
    userCurrency={props.userCurrency}
    isBar={true}
  />
);

export default function ReportsCharts({
  expenseChartData,
  barChartData,
  savingsMetrics,
  userCurrency,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* 1. Expense Pie Chart */}
      <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <PieIcon size={20} className="text-gray-400" />
            Expense Breakdown
          </h3>
        </div>
        <div className="h-64 sm:h-80 w-full">
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip userCurrency={userCurrency} />}
                />
                <Legend wrapperStyle={{ width: '100%', flexWrap: 'wrap' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <PieIcon size={48} className="mb-2 opacity-20" />
              <p>No expense data available</p>
            </div>
          )}
        </div>
      </section>

      {/* 2. Income vs Expense Bar Chart */}
      <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarIcon size={20} className="text-gray-400" />
            Income vs Expenses
          </h3>
        </div>
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) =>
                  formatCurrency(value, userCurrency, true)
                }
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                content={<CustomBarTooltip userCurrency={userCurrency} />}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. NEW: Savings Performance Focus */}
      <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 lg:col-span-2 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-teal-600" />
            Savings Performance
          </h3>
        </div>
        
        {savingsMetrics && savingsMetrics.hasActivity ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 h-auto sm:h-64">
                {/* Card 1: Total Saved */}
                <div className="bg-teal-50 rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-teal-100 min-w-0">
                    <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-teal-600 uppercase tracking-wider mb-1">Total Saved</p>
                    <p className="text-2xl sm:text-3xl font-black text-teal-900 truncate max-w-full">
                        {formatCurrency(savingsMetrics.totalSaved, userCurrency)}
                    </p>
                    <p className="text-xs text-teal-600/70 mt-2 font-medium">in this period</p>
                </div>

                {/* Card 2: Savings Rate */}
                <div className="bg-indigo-50 rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-indigo-100 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <PieIcon size={24} />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Savings Rate</p>
                    <p className="text-2xl sm:text-3xl font-black text-indigo-900">
                        {savingsMetrics.savingsRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-indigo-600/70 mt-2 font-medium">of total income</p>
                </div>

                {/* Card 3: Top Goal */}
                <div className="bg-rose-50 rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-rose-100 min-w-0">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                        <PieIcon size={24} className="rotate-180" /> 
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-rose-600 uppercase tracking-wider mb-1">Top Goal</p>
                    <p className="text-lg sm:text-xl font-bold text-rose-900 truncate w-full px-2">
                        {savingsMetrics.topGoal ? savingsMetrics.topGoal.name : "N/A"}
                    </p>
                     <p className="text-lg font-bold text-rose-500 mt-1 truncate max-w-full">
                        {savingsMetrics.topGoal ? formatCurrency(savingsMetrics.topGoal.amount, userCurrency) : "-"}
                    </p>
                </div>
            </div>
        ) : (
             <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
               <TrendingUp size={48} className="mb-2 opacity-20" />
               <p className="font-medium">No savings activity in this period</p>
               <p className="text-xs mt-1">Contributions will appear here</p>
             </div>
        )}
      </section>
    </div>
  );
}
