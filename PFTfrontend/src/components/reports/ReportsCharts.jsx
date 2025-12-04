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
} from "recharts";
import { BarChart as BarIcon, PieChart as PieIcon } from "lucide-react";
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
  userCurrency,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <PieIcon size={20} className="text-gray-400" />
            Expense Breakdown
          </h3>
        </div>
        <div className="h-80">
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
                <Legend />
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

      <section className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarIcon size={20} className="text-gray-400" />
            Income vs Expenses
          </h3>
        </div>
        <div className="h-80">
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
                  formatCurrency(value, userCurrency).split(".")[0]
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
    </div>
  );
}
