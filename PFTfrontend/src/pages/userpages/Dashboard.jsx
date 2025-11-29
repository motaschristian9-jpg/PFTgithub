import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  PiggyBank,
  Target,
  PlusCircle,
} from "lucide-react";
import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import { logoutUser } from "../../api/auth.js";
import Swal from "sweetalert2";
import { useDataContext } from "../../components/DataLoader";

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

// Modern Color Palette
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

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl z-50">
        <p className="text-sm font-bold text-gray-800 mb-1">{label}</p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-blue-600">
            ${Number(payload[0].value).toLocaleString()}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  // 1. Data Context
  const {
    user,
    transactionsData,
    categoriesData,
    activeBudgetsData,
    savingsData,
  } = useDataContext();

  // 2. UI State
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- MEMOIZED CALCULATIONS (Performance) ---

  const transactions = useMemo(
    () => transactionsData?.data || [],
    [transactionsData]
  );
  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData]
  );
  const activeBudgets = useMemo(
    () => activeBudgetsData?.data || [],
    [activeBudgetsData]
  );
  const savingsList = useMemo(() => savingsData?.data || [], [savingsData]);

  // Totals
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      if (t.type === "income") income += amt;
      else if (t.type === "expense") expenses += amt;
    });
    return { income, expenses, net: income - expenses };
  }, [transactions]);

  // Pie Chart Data
  const pieChartData = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      if (t.type === "expense") {
        const catId = t.category_id || "uncategorized";
        map[catId] = (map[catId] || 0) + Number(t.amount || 0);
      }
    });

    const catNameMap = {};
    categories.forEach((c) => (catNameMap[c.id] = c.name));

    return Object.entries(map)
      .map(([catId, value]) => ({
        name: catNameMap[catId] || "Uncategorized",
        value: value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, categories]);

  // Bar Chart Data
  const barChartData = useMemo(
    () => [
      { name: "Income", amount: stats.income, color: "#10B981" },
      { name: "Expense", amount: stats.expenses, color: "#EF4444" },
    ],
    [stats]
  );

  // Budget Progress Data
  const budgetProgressData = useMemo(() => {
    const spendingMap = {};
    transactions.forEach((t) => {
      if (t.type === "expense" && t.budget_id) {
        spendingMap[t.budget_id] =
          (spendingMap[t.budget_id] || 0) + Number(t.amount || 0);
      }
    });

    return activeBudgets.map((b) => {
      const allocated = Number(b.amount || 0);
      const spent = spendingMap[b.id] || 0;
      const remaining = allocated - spent;
      const rawPercent = allocated > 0 ? (spent / allocated) * 100 : 0;

      let statusColor = "bg-emerald-500";
      let statusText = "text-emerald-600";
      let label = "On Track";

      if (rawPercent > 100) {
        statusColor = "bg-red-600";
        statusText = "text-red-600";
        label = "Overspent";
      } else if (rawPercent >= 90) {
        statusColor = "bg-red-500";
        statusText = "text-red-500";
        label = "Near Limit";
      } else if (rawPercent >= 75) {
        statusColor = "bg-amber-500";
        statusText = "text-amber-600";
        label = "Watch";
      }

      return {
        ...b,
        spent,
        remaining,
        percent: rawPercent,
        widthPercent: Math.min(rawPercent, 100),
        statusColor,
        statusText,
        label,
      };
    });
  }, [activeBudgets, transactions]);

  // Savings Data
  const processedSavings = useMemo(() => {
    return savingsList.map((s) => {
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
  }, [savingsList]);

  // --- Handlers ---

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes",
    });

    if (result.isConfirmed) {
      try {
        await logoutUser();
      } catch (e) {
        console.error(e);
      } finally {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-green-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/30 to-green-200/20 rounded-full blur-2xl"></div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => {
          setSidebarOpen((prev) => {
            const newValue = !prev;
            localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
            return newValue;
          });
        }}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex flex-col relative z-10">
        <Topbar
          toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          notifications={[]}
          user={user}
          handleLogout={handleLogout}
        />

        <MainView>
          <div className="space-y-6 p-4 sm:p-6 lg:p-0">
            {/* Header */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                    <DollarSign className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">
                      Overview for{" "}
                      <span className="font-semibold text-green-700">
                        {user?.name || "User"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    ${stats.income.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <TrendingUp size={24} />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    ${stats.expenses.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <TrendingDown size={24} />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Net Balance
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      stats.net >= 0 ? "text-blue-600" : "text-red-500"
                    }`}
                  >
                    ${stats.net.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Wallet size={24} />
                </div>
              </div>
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donut Chart */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <PieIcon size={20} className="text-gray-400" /> Expense
                  Breakdown
                </h3>

                {/* FIX: Explicit height container to prevent Recharts crash */}
                <div className="h-[300px] w-full">
                  {pieChartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <PieIcon size={48} className="opacity-20 mb-2" />
                      <span className="italic">No expense data yet</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                        >
                          {pieChartData.map((entry, index) => (
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

              {/* Bar Chart */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <TrendingUp size={20} className="text-gray-400" /> Income vs
                  Expenses
                </h3>

                {/* FIX: Explicit height container to prevent Recharts crash */}
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
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
                      />
                      <Tooltip
                        content={<CustomTooltip />}
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

            {/* Budget Progress */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-600" />{" "}
                    Budget Goals
                  </h3>
                </div>

                {budgetProgressData.length === 0 ? (
                  <div className="text-center py-8 opacity-60">
                    <p className="text-gray-500 italic">
                      No active budgets. Set limits to track your spending.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgetProgressData.map((budget) => (
                      <div
                        key={budget.id}
                        className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-gray-800 text-base truncate">
                              {budget.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Allocated: $
                              {Number(budget.amount).toLocaleString()}
                            </p>
                          </div>
                          {budget.percent > 100 && (
                            <AlertTriangle
                              className="text-red-500 flex-shrink-0"
                              size={20}
                            />
                          )}
                        </div>

                        <div className="flex justify-between items-center text-xs mb-2 font-medium">
                          <span className={budget.statusText}>
                            {budget.label}
                          </span>
                          <span className="text-gray-600">
                            {budget.percent.toFixed(1)}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${budget.statusColor}`}
                            style={{ width: `${budget.widthPercent}%` }}
                          />
                        </div>

                        <div className="mt-3 text-right">
                          <p
                            className={`text-xs font-semibold ${
                              budget.remaining < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {budget.remaining < 0
                              ? "Overspent: "
                              : "Remaining: "}
                            ${Math.abs(budget.remaining).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Savings Goals */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <PiggyBank size={20} className="text-blue-600" /> Savings
                    Goals
                  </h3>
                </div>

                {processedSavings.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 h-40 bg-blue-50/30 hover:bg-blue-50/60 transition-colors group cursor-pointer">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <PlusCircle className="text-blue-500" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-700">
                          Create Goal
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          Start saving for something special
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {processedSavings.map((s) => (
                      <div
                        key={s.id}
                        className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <Target
                          className="absolute top-3 right-3 text-blue-200"
                          size={24}
                        />

                        <div className="relative z-10">
                          <h4 className="font-bold text-gray-800 text-lg mb-1 truncate">
                            {s.name}
                          </h4>
                          <p className="text-xs text-gray-500 mb-4">
                            Target: ${s.target.toLocaleString()}
                          </p>

                          <div className="flex items-end justify-between mb-2">
                            <div>
                              <span className="text-2xl font-bold text-blue-600">
                                ${s.current.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                              {s.percent.toFixed(0)}%
                            </span>
                          </div>

                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-700 ease-out"
                              style={{ width: `${s.widthPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </MainView>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
