import React from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import { logoutUser } from "../../api/auth.js";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import { useDataContext } from "../../components/DataLoader";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#CD6155",
  "#5DADE2",
  "#58D68D",
  "#F5B041",
  "#DC7633",
];

const Dashboard = () => {
  const location = useLocation();
  // Consume data from DataLoader context
  const { user, transactionsData, categoriesData } = useDataContext();

  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Use the full transactionsData object (including totals, links, meta)
  const transactions = transactionsData || [];

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  // Logout handler
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await logoutUser();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout failed:", error);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  // Removed local loading and error handling as handled globally by DataLoader

  // Aggregate total Income and Expenses for BarChart
  const totalIncome = transactions?.totals?.income || 0;
  const totalExpenses = transactions?.totals?.expenses || 0;

  // Aggregate expenses by category for PieChart
  // Build a map of expense totals by category_id
  const expenseByCategoryMap = {};
  (transactions?.data || []).forEach((t) => {
    if (t.type === "expense" && t.category_id) {
      expenseByCategoryMap[t.category_id] =
        (expenseByCategoryMap[t.category_id] || 0) + parseFloat(t.amount);
    }
  });

  // Build PieChart data showing all expense categories with amounts or zero
  const pieChartData =
    categoriesData?.data
      ?.filter((category) => category.type === "expense")
      .map((category) => ({
        name: category.name,
        value: expenseByCategoryMap[category.id] || 0,
      })) || [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-green-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/30 to-green-200/20 rounded-full blur-2xl"></div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        <Topbar
          toggleMobileMenu={toggleMobileMenu}
          notifications={[]}
          hasUnread={false}
          setHasUnread={() => {}}
          user={user}
          handleLogout={handleLogout}
        />

        <MainView>
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
            {/* Header */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign className="text-white" size={20} />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                      Dashboard
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Welcome back, {user?.name || "User"}! Here's your
                      financial overview.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Transactions Summary cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm">
                        Total Income
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        ${totalIncome.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-200/30 to-red-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-100/50 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <TrendingDown className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm">
                        Total Expenses
                      </h3>
                      <p className="text-2xl font-bold text-red-500">
                        ${totalExpenses.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm">
                        Net Balance
                      </h3>
                      <p
                        className={`text-2xl font-bold ${
                          totalIncome - totalExpenses >= 0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        ${(totalIncome - totalExpenses).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Charts section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Expense Breakdown PieChart */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Expense Breakdown
                </h3>
                {pieChartData.length === 0 ? (
                  <p className="text-gray-500">No expense data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ReTooltip />
                      <ReLegend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Income vs Expense BarChart */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Income vs Expenses
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Income", amount: totalIncome, color: "#82ca9d" },
                      {
                        name: "Expenses",
                        amount: totalExpenses,
                        color: "#ff0000",
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ReTooltip />
                    <ReLegend />
                    <Bar dataKey="amount">
                      {[
                        {
                          name: "Income",
                          amount: totalIncome,
                          color: "#82ca9d",
                        },
                        {
                          name: "Expenses",
                          amount: totalExpenses,
                          color: "#ff0000",
                        },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Savings and Budgets Placeholder Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Savings List Placeholder */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6 lg:p-8 min-h-[200px]">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Savings
                </h3>
                <p className="text-gray-500 italic">
                  No savings data available.
                </p>
              </div>

              {/* Budgets List Placeholder */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6 lg:p-8 min-h-[200px]">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Budgets & Progress
                </h3>
                <p className="text-gray-500 italic">
                  No budgets data available.
                </p>
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
