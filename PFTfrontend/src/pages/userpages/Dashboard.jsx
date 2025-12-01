import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  PlusCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import { useDataContext } from "../../components/DataLoader";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

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
  const { user, transactionsData, activeBudgetsData, savingsData } =
    useDataContext();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const transactions = useMemo(
    () => transactionsData?.data || [],
    [transactionsData]
  );

  // NEW: Get last 5 transactions for the "Recent Activity" panel
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  const activeBudgets = useMemo(
    () => activeBudgetsData || [],
    [activeBudgetsData]
  );

  const savingsList = useMemo(() => savingsData || [], [savingsData]);

  const stats = useMemo(() => {
    const income = transactionsData?.totals?.income || 0;
    const expenses = transactionsData?.totals?.expenses || 0;
    return { income, expenses, net: income - expenses };
  }, [transactionsData]);

  // Bar Chart Data (Kept for quick income/expense comparison)
  const barChartData = useMemo(
    () => [
      { name: "Income", amount: stats.income, color: "#10B981" },
      { name: "Expense", amount: stats.expenses, color: "#EF4444" },
    ],
    [stats]
  );

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
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
        {/* Updated Topbar without handleLogout prop */}
        <Topbar
          toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          notifications={[]}
          user={user}
        />

        <MainView>
          <div className="space-y-6 p-4 sm:p-6 lg:p-0">
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

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between">
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
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-200 to-red-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between">
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
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
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
              </div>
            </section>

            {/* CHANGED SECTION: Replaced Pie Chart with Recent Activity List */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-[380px]">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <Activity size={20} className="text-gray-400" /> Recent
                  Activity
                </h3>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {recentTransactions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <span className="italic">No recent transactions</span>
                    </div>
                  ) : (
                    recentTransactions.map((t, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              t.type === "income"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {t.type === "income" ? (
                              <ArrowUpRight size={18} />
                            ) : (
                              <ArrowDownRight size={18} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700 truncate max-w-[120px] sm:max-w-[180px]">
                              {t.name || t.category_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(t.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`font-bold text-sm ${
                            t.type === "income"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}$
                          {Number(t.amount).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-[380px]">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <TrendingUp size={20} className="text-gray-400" /> Income vs
                  Expenses
                </h3>

                <div className="flex-1 w-full">
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

            {/* Budget Section */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Target size={20} className="text-emerald-600" /> Active
                    Budgets
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
                              Limit: ${Number(budget.amount).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={
                                budget.statusText + " font-bold text-xs"
                              }
                            >
                              {budget.label}
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${budget.statusColor}`}
                            style={{ width: `${budget.widthPercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Spent: ${budget.spent.toLocaleString()}</span>
                          <span
                            className={
                              budget.remaining < 0
                                ? "text-red-500 font-bold"
                                : ""
                            }
                          >
                            {budget.remaining < 0 ? "-" : ""}$
                            {Math.abs(budget.remaining).toLocaleString()} left
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Savings Section */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <PlusCircle size={20} className="text-blue-600" /> Savings
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
