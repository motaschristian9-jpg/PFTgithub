import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  CheckCircle2,
  Wallet,
  Target,
  BarChart as BarIcon,
  Download,
  Calendar,
  PiggyBank,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";
import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import { useDataContext } from "../../components/DataLoader.jsx";
import { exportFullReport } from "../../utils/excelExport.js";

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

const COLORS = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl z-50">
        <p className="text-sm font-bold text-gray-800 mb-1">{label}</p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-emerald-600">
            $
            {Number(payload[0].value).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const color = item.name === "Income" ? "text-emerald-600" : "text-rose-600";
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl z-50">
        <p className="text-sm font-bold text-gray-800 mb-1">{label}</p>
        <p className={`text-sm font-semibold ${color}`}>
          $
          {Number(item.value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Filter State ---
  const [datePreset, setDatePreset] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- Data Access ---
  const {
    user,
    transactionsData,
    activeBudgetsData,
    savingsData,
    categoriesData,
  } = useDataContext();

  // --- Date Logic ---
  useEffect(() => {
    const today = new Date();
    let start = "";
    let end = "";

    if (datePreset === "this_month") {
      start = format(startOfMonth(today), "yyyy-MM-dd");
      end = format(endOfMonth(today), "yyyy-MM-dd");
    } else if (datePreset === "last_month") {
      const lastMonthDate = subMonths(today, 1);
      start = format(startOfMonth(lastMonthDate), "yyyy-MM-dd");
      end = format(endOfMonth(lastMonthDate), "yyyy-MM-dd");
    } else if (datePreset === "all") {
      start = "";
      end = "";
    }

    if (datePreset !== "custom") {
      setStartDate(start);
      setEndDate(end);
    }
  }, [datePreset]);

  // --- 1. Category Lookup Map ---
  const categoryLookup = useMemo(() => {
    const map = {};
    if (categoriesData?.data && Array.isArray(categoriesData.data)) {
      categoriesData.data.forEach((cat) => {
        map[cat.id] = cat.name;
      });
    }
    return map;
  }, [categoriesData]);

  // --- 2. Filter Transactions ---
  const allTransactions = useMemo(
    () => transactionsData?.data || [],
    [transactionsData]
  );

  const filteredTransactions = useMemo(() => {
    // If "All Time" (empty strings), return everything
    if (!startDate && !endDate) return allTransactions;

    return allTransactions.filter((t) => {
      if (!t.date && !t.transaction_date) return false;
      const dateStr = t.date || t.transaction_date;

      const txDate = parseISO(dateStr);
      const start = startDate ? parseISO(startDate) : new Date("1900-01-01");
      const end = endDate ? parseISO(endDate) : new Date("2100-01-01");
      end.setHours(23, 59, 59, 999);

      return isWithinInterval(txDate, { start, end });
    });
  }, [allTransactions, startDate, endDate]);

  // --- 3. Filter Budgets & Savings based on Creation Date ---
  const filteredBudgets = useMemo(() => {
    if (!startDate && !endDate) return activeBudgetsData || [];

    return (activeBudgetsData || []).filter((b) => {
      if (!b.created_at) return true;
      const createdDate = parseISO(b.created_at);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      end.setHours(23, 59, 59, 999);

      return isWithinInterval(createdDate, { start, end });
    });
  }, [activeBudgetsData, startDate, endDate]);

  const filteredSavingsList = useMemo(() => {
    if (!startDate && !endDate) return savingsData || [];

    return (savingsData || []).filter((s) => {
      if (!s.created_at) return true;
      const createdDate = parseISO(s.created_at);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      end.setHours(23, 59, 59, 999);

      return isWithinInterval(createdDate, { start, end });
    });
  }, [savingsData, startDate, endDate]);

  // --- 4. Process Savings Data ---
  const processedSavings = useMemo(() => {
    const list = Array.isArray(filteredSavingsList) ? filteredSavingsList : [];
    return list.map((s) => {
      const current = Number(s.current_amount || 0);
      const target = Number(s.target_amount || 1);
      const percent = (current / target) * 100;
      return {
        ...s,
        current,
        target,
        percent,
        widthPercent: Math.min(percent, 100),
      };
    });
  }, [filteredSavingsList]);

  // --- 5. Statistics Calculation ---
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;

    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      if (t.type === "income") income += amt;
      if (t.type === "expense") expenses += amt;
    });

    const net = income - expenses;

    const totalSavings = processedSavings.reduce(
      (sum, s) => sum + s.current,
      0
    );

    return {
      income,
      expenses,
      net,
      totalSavings,
    };
  }, [filteredTransactions, processedSavings]);

  // --- 6. Chart Data Preparation ---
  const expenseChartData = useMemo(() => {
    const map = {};
    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        const catName = categoryLookup[t.category_id] || "Uncategorized";
        map[catName] = (map[catName] || 0) + Number(t.amount || 0);
      }
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredTransactions, categoryLookup]);

  const barChartData = useMemo(
    () => [
      { name: "Income", amount: stats.income, color: "#10B981" },
      { name: "Expense", amount: stats.expenses, color: "#EF4444" },
    ],
    [stats]
  );

  // --- 7. Budget Compliance ---
  const budgetCompliance = useMemo(() => {
    const spendingMap = {};

    // Spending is calculated from ALL transactions (Total Spending)
    allTransactions.forEach((t) => {
      if (t.type === "expense" && t.budget_id) {
        spendingMap[t.budget_id] =
          (spendingMap[t.budget_id] || 0) + Number(t.amount || 0);
      }
    });

    // Display list is filtered by creation date
    return filteredBudgets
      .map((b) => {
        const allocated = Number(b.amount || 0);
        const spent = spendingMap[b.id] || 0;
        const remaining = allocated - spent;
        const rawPercent = allocated > 0 ? (spent / allocated) * 100 : 0;
        const isOver = spent > allocated;
        const catName = categoryLookup[b.category_id] || "Uncategorized";

        return {
          ...b,
          category: catName,
          spent: spent,
          allocated: allocated,
          remaining: remaining,
          percent: Math.min(rawPercent, 100),
          isOver: isOver,
        };
      })
      .sort((a, b) => a.remaining - b.remaining);
  }, [filteredBudgets, allTransactions, categoryLookup]);

  // --- Handlers ---
  const handleExport = async () => {
    // Create the unified object expected by exportFullReport
    const exportData = {
      income: filteredTransactions.filter((t) => t.type === "income"),
      expenses: filteredTransactions.filter((t) => t.type === "expense"),
      budgets: budgetCompliance,
      savings: processedSavings,
      stats: stats,
      range: {
        from: startDate,
        to: endDate,
        preset: datePreset,
      },
      expenseAllocation: expenseChartData,
    };

    await exportFullReport(exportData);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-emerald-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-emerald-100/30 to-emerald-200/20 rounded-full blur-2xl"></div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex flex-col relative z-10">
        <Topbar
          toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          notifications={[]}
          user={user}
        />

        <MainView>
          <div className="space-y-6 p-4 sm:p-6 lg:p-0">
            {/* 1. Header & Controls */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 p-6 lg:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Title */}
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-2">
                      <BarIcon className="text-white" size={28} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800">
                        Financial Reports
                      </h1>
                      <p className="text-gray-500 mt-1">
                        Analytics for your income, expenses, and budgets.
                      </p>
                    </div>
                  </div>

                  {/* Filters & Export Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <div className="relative">
                      <Calendar
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        value={datePreset}
                        onChange={(e) => setDatePreset(e.target.value)}
                        className="w-full sm:w-40 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="all">All Time</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>

                    {datePreset === "custom" && (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleExport}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      <Download size={16} />
                      Export Excel
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Key Metrics Summary */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Income",
                  value: stats.income,
                  icon: TrendingUp,
                  color: "emerald",
                  iconBg: "bg-emerald-100",
                },
                {
                  label: "Total Expenses",
                  value: stats.expenses,
                  icon: TrendingDown,
                  color: "rose",
                  iconBg: "bg-rose-100",
                },
                {
                  label: "Net Flow",
                  value: stats.net,
                  icon: Wallet,
                  color: stats.net >= 0 ? "blue" : "red",
                  iconBg: "bg-blue-100",
                },
                {
                  label: "Total Savings",
                  value: stats.totalSavings,
                  icon: Target,
                  color: "teal",
                  iconBg: "bg-teal-100",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {metric.label}
                    </p>
                    <p
                      className={`text-2xl font-bold text-${metric.color}-600 mt-1`}
                    >
                      {metric.value.toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                      })}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${metric.iconBg} rounded-xl flex items-center justify-center text-${metric.color}-600`}
                  >
                    <metric.icon size={24} />
                  </div>
                </div>
              ))}
            </section>

            {/* 3. Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Allocation Pie Chart */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <PieIcon size={20} className="text-rose-400" /> Expense
                  Allocation
                </h3>

                <div className="h-[350px] w-full">
                  {expenseChartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <PieIcon size={48} className="opacity-20 mb-2" />
                      <span className="italic">
                        No expense data available for breakdown
                      </span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                        >
                          {expenseChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Income vs Expenses Bar Chart */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <BarIcon size={20} className="text-emerald-400" /> Income vs
                  Expenses Overview
                </h3>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                      barSize={60}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        tickFormatter={(value) =>
                          `$${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        content={<CustomBarTooltip />}
                        cursor={{ fill: "#F3F4F6" }}
                      />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* 4. Budget Compliance Table */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-teal-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-blue-600" /> Budget
                    Compliance (Selected Period)
                  </h3>
                </div>

                <div className="p-0 overflow-x-auto">
                  {budgetCompliance.length === 0 ? (
                    <div className="text-center py-12 opacity-60 text-gray-500 italic">
                      No active budgets available for the selected period.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                          <th className="p-4 font-semibold border-b border-gray-200">
                            Budget Name
                          </th>
                          <th className="p-4 font-semibold border-b border-gray-200">
                            Category
                          </th>
                          <th className="p-4 font-semibold border-b border-gray-200 text-right">
                            Allocated
                          </th>
                          <th className="p-4 font-semibold border-b border-gray-200 text-right">
                            Spent
                          </th>
                          <th className="p-4 font-semibold border-b border-gray-200 text-center">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {budgetCompliance.map((b) => (
                          <tr
                            key={b.id}
                            className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                              b.isOver ? "bg-red-50/30" : ""
                            }`}
                          >
                            <td className="p-4 font-medium text-gray-800">
                              {b.name}
                            </td>
                            <td className="p-4 text-gray-500">{b.category}</td>
                            <td className="p-4 text-right text-gray-600">
                              ${b.allocated.toLocaleString()}
                            </td>
                            <td className="p-4 text-right font-bold text-gray-800">
                              ${b.spent.toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  b.isOver
                                    ? "bg-red-100 text-red-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {b.isOver
                                  ? `Over by $${Math.abs(
                                      b.remaining
                                    ).toLocaleString()}`
                                  : `${b.percent.toFixed(0)}% Used`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>

            {/* 5. Savings Goals Summary */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-300/30 to-indigo-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <PiggyBank size={20} className="text-blue-600" /> Savings
                    Goals Summary
                  </h3>
                </div>

                <div className="p-0 overflow-x-auto">
                  {processedSavings.length === 0 ? (
                    <div className="text-center py-12 opacity-60 text-gray-500 italic">
                      No savings goals found.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                          <th className="p-4 font-semibold border-b border-gray-200">
                            Goal Name
                          </th>
                          <th className="p-4 font-semibold border-b border-gray-200 text-right">
                            Target Amount
                          </th>
                          <th className="p-4 font-semibold border-b border-gray-200 text-right">
                            Current Amount
                          </th>
                          <th className="p-4 font-semibold border-b border-gray-200 w-1/3">
                            Progress
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedSavings.map((s) => (
                          <tr
                            key={s.id}
                            className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="p-4 font-medium text-gray-800">
                              {s.name}
                            </td>
                            <td className="p-4 text-right text-gray-600">
                              ${s.target.toLocaleString()}
                            </td>
                            <td className="p-4 text-right font-bold text-blue-600">
                              ${s.current.toLocaleString()}
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${s.widthPercent}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-blue-700 min-w-[3rem] text-right">
                                  {s.percent.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>
          </div>
        </MainView>
        <Footer />
      </div>
    </div>
  );
}
