import { useState, useMemo } from "react";
import {
  Calendar,
  DollarSign,
  Plus,
  PieChart,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import Swal from "sweetalert2";
import { useDataContext } from "../../components/DataLoader.jsx";
import { createBudget, updateBudget, deleteBudget } from "../../api/budgets.js";
import { deleteTransaction } from "../../api/transactions.js";
import BudgetModal from "../../components/BudgetModal.jsx";
import BudgetCardModal from "../../components/BudgetCardModal.jsx";

export default function BudgetPage() {
  const queryClient = useQueryClient();

  // --- UI State ---
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetCardModalOpen, setBudgetCardModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // --- Data Access ---
  const {
    categoriesData,
    user,
    transactionsData,
    activeBudgetsData,
    historyBudgetsData,
  } = useDataContext();

  // FIX: Access arrays directly since DataLoader already extracted/filtered them
  const activeBudgets = useMemo(
    () => activeBudgetsData || [],
    [activeBudgetsData]
  );

  const historyBudgets = useMemo(
    () => historyBudgetsData || [],
    [historyBudgetsData]
  );

  const allTransactions = useMemo(
    () => transactionsData?.data || [],
    [transactionsData]
  );

  // --- OPTIMIZATION: MEMOIZED CALCULATIONS ---

  // 1. Category Map
  const categoryMap = useMemo(() => {
    const map = {};
    if (categoriesData?.data) {
      categoriesData.data.forEach((cat) => {
        map[cat.id] = cat.name;
      });
    }
    return map;
  }, [categoriesData]);

  const getCategoryName = (categoryId) =>
    categoryMap[categoryId] || "Uncategorized";

  // 2. Spending Map (O(n))
  const spendingMap = useMemo(() => {
    const map = {};
    allTransactions.forEach((t) => {
      if (t.type === "expense" && t.budget_id) {
        map[t.budget_id] = (map[t.budget_id] || 0) + parseFloat(t.amount || 0);
      }
    });
    return map;
  }, [allTransactions]);

  const getBudgetSpent = (budgetId) => spendingMap[budgetId] || 0;

  // 3. Overview Statistics
  const budgetStats = useMemo(() => {
    const totalAllocated = activeBudgets.reduce(
      (sum, b) => sum + Number(b.amount),
      0
    );
    const totalSpent = activeBudgets.reduce(
      (sum, b) => sum + (spendingMap[b.id] || 0),
      0
    );

    // Count specific statuses from history + active checks
    const completedCount = historyBudgets.filter(
      (b) => b.status === "completed"
    ).length;

    // Check active budgets that have reached their limit
    const reachedLimitCount =
      activeBudgets.filter((b) => {
        const spent = spendingMap[b.id] || 0;
        return spent >= Number(b.amount);
      }).length + historyBudgets.filter((b) => b.status === "reached").length;

    return {
      totalAllocated,
      totalSpent,
      remaining: totalAllocated - totalSpent,
      completedCount,
      reachedLimitCount,
      activeCount: activeBudgets.length,
    };
  }, [activeBudgets, historyBudgets, spendingMap]);

  // --- HELPERS ---

  const getBudgetTransactions = (budget) => {
    if (!budget) return [];
    return allTransactions
      .filter((t) => t.budget_id == budget.id && t.type === "expense")
      .sort(
        (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
      );
  };

  const getBudgetStatusInfo = (spent, total, dbStatus) => {
    const ratio = total > 0 ? spent / total : 0;

    if (spent > total)
      return {
        label: "Overspent",
        colorClass: "bg-red-100 text-red-700",
        textClass: "text-red-700",
        barColor: "bg-red-600",
      };
    if (ratio >= 1 || dbStatus === "reached")
      return {
        label: "Limit Reached",
        colorClass: "bg-red-50 text-red-600",
        textClass: "text-red-600",
        barColor: "bg-red-500",
      };
    if (dbStatus === "completed")
      return {
        label: "Completed",
        colorClass: "bg-green-100 text-green-700",
        textClass: "text-green-700",
        barColor: "bg-green-500",
      };
    if (dbStatus === "expired")
      return {
        label: "Expired",
        colorClass: "bg-orange-100 text-orange-700",
        textClass: "text-orange-700",
        barColor: "bg-orange-500",
      };

    // Active states
    if (ratio > 0.85)
      return {
        label: "Near Limit",
        colorClass: "bg-yellow-100 text-yellow-700",
        textClass: "text-yellow-700",
        barColor: "bg-yellow-500",
      };

    return {
      label: "Active",
      colorClass: "bg-green-50 text-green-700",
      textClass: "text-green-600",
      barColor: "bg-green-500",
    };
  };

  // --- HANDLERS ---

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  const handleBudgetCardModalOpen = (budget) => {
    const spent = getBudgetSpent(budget.id);
    const remaining = Number(budget.amount) - spent;
    setSelectedBudget({ ...budget, spent, remaining });
    setBudgetCardModalOpen(true);
  };

  const handleDelete = async (budgetIdOrObject) => {
    const id =
      typeof budgetIdOrObject === "object"
        ? budgetIdOrObject.id
        : budgetIdOrObject;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: { container: "swal-z-index-fix" },
    });

    if (result.isConfirmed) {
      try {
        await deleteBudget(id);
        await queryClient.invalidateQueries(["budgets"]);
        if (budgetCardModalOpen) {
          setBudgetCardModalOpen(false);
          setSelectedBudget(null);
        }
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
          customClass: { container: "swal-z-index-fix" },
        });
      } catch (error) {
        Swal.fire("Error", "Failed to delete budget", "error");
      }
    }
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      if (budgetData.id) await updateBudget(budgetData.id, budgetData);
      else await createBudget(budgetData);

      await queryClient.invalidateQueries(["budgets"]);
      setEditingBudget(null);
      setModalOpen(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to save budget",
        customClass: { container: "swal-z-index-fix" },
      });
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      await deleteTransaction(transaction.id);
      await queryClient.invalidateQueries(["transactions"]);
      await queryClient.invalidateQueries(["budgets"]);
      if (selectedBudget) {
        const amount = parseFloat(transaction.amount);
        setSelectedBudget((prev) => ({
          ...prev,
          spent: prev.spent - amount,
          remaining: prev.remaining + amount,
        }));
      }
    } catch (e) {
      Swal.fire("Error", "Failed to delete transaction", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
      <style>{` .swal-z-index-fix { z-index: 10000 !important; } `}</style>

      {/* Background decorations */}
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
            {/* 1. Header & Actions */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                    <Wallet className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      Budgets
                    </h1>
                    <p className="text-gray-500 mt-1">
                      Plan, track, and save for your future
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingBudget(null);
                    setModalOpen(true);
                  }}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-medium"
                >
                  <Plus size={18} />
                  <span>Create Budget</span>
                </button>
              </div>
            </section>

            {/* 2. Overview Stats (Updated Colors) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Allocated (Green) */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Allocated
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${budgetStats.totalAllocated.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <DollarSign size={24} />
                </div>
              </div>

              {/* Total Spent (Red) */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    ${budgetStats.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <TrendingUp size={24} />
                </div>
              </div>

              {/* Status Overview */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Status Check
                  </p>
                  <div className="flex space-x-4 mt-1">
                    <div className="text-center">
                      <span className="block text-xl font-bold text-green-600">
                        {budgetStats.completedCount}
                      </span>
                      <span className="text-[10px] uppercase text-gray-400 font-semibold">
                        Done
                      </span>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                      <span className="block text-xl font-bold text-red-600">
                        {budgetStats.reachedLimitCount}
                      </span>
                      <span className="text-[10px] uppercase text-gray-400 font-semibold">
                        Limit
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </section>

            {/* 3. Active Budgets Grid */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 min-h-[300px]">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">
                    Active Budgets
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {activeBudgets.length} Active
                  </span>
                </div>

                {activeBudgets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <PieChart className="text-green-300" size={40} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      No active budgets
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-xs">
                      Create a budget to start tracking your expenses and save
                      more effectively.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeBudgets.map((b) => {
                      const spent = getBudgetSpent(b.id);
                      const allocated = Number(b.amount);
                      const remaining = allocated - spent;
                      const rawPercent =
                        allocated > 0 ? (spent / allocated) * 100 : 0;
                      const widthPercent = Math.min(rawPercent, 100);
                      const statusInfo = getBudgetStatusInfo(
                        spent,
                        allocated,
                        b.status
                      );

                      return (
                        <div
                          key={b.id}
                          className="group relative cursor-pointer"
                          onClick={() => handleBudgetCardModalOpen(b)}
                        >
                          <div className="relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 overflow-hidden">
                            {/* Top Bar Indicator */}
                            <div
                              className={`absolute top-0 left-0 right-0 h-1.5 ${statusInfo.barColor}`}
                            ></div>

                            <div className="flex items-start justify-between mb-4 mt-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-gray-800 truncate">
                                  {b.name ?? "Unnamed"}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5 truncate uppercase tracking-wider font-medium">
                                  {getCategoryName(b.category_id)}
                                </p>
                              </div>
                              <div className="ml-3">
                                {rawPercent > 100 ? (
                                  <AlertTriangle
                                    className="text-red-500"
                                    size={20}
                                  />
                                ) : (
                                  <Clock
                                    className="text-gray-300 group-hover:text-green-500 transition-colors"
                                    size={20}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Dates */}
                            <div className="flex items-center space-x-3 mb-5 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                              <Calendar size={14} />
                              <span className="truncate">
                                {b.start_date
                                  ? new Date(b.start_date).toLocaleDateString()
                                  : "-"}{" "}
                                —{" "}
                                {b.end_date
                                  ? new Date(b.end_date).toLocaleDateString()
                                  : "-"}
                              </span>
                            </div>

                            {/* Stats Rows */}
                            <div className="space-y-3 mb-5">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Allocated</span>
                                <span className="font-bold text-gray-800">
                                  ${allocated.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Spent</span>
                                <span
                                  className={`font-bold ${statusInfo.textClass}`}
                                >
                                  ${spent.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-100">
                                <span className="text-gray-500">Remaining</span>
                                <span
                                  className={`font-bold ${
                                    remaining < 0
                                      ? "text-red-600"
                                      : "text-gray-800"
                                  }`}
                                >
                                  ${remaining.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                  Progress
                                </span>
                                <span
                                  className={`text-xs font-bold ${statusInfo.textClass}`}
                                >
                                  {rawPercent.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ease-out ${statusInfo.barColor}`}
                                  style={{ width: `${widthPercent}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.colorClass}`}
                              >
                                {statusInfo.label}
                              </span>
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-1.5 bg-gray-50 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50">
                                  <Eye size={16} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* 4. History Table (Desktop) */}
            {historyBudgets.length > 0 && (
              <section className="relative hidden lg:block">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                  <div className="p-6 border-b border-green-100/50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                      Budget History
                    </h3>
                    <span className="text-sm text-gray-500">
                      Past & Completed
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                            Allocated
                          </th>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                            Spent
                          </th>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {historyBudgets.map((b) => {
                          const spent = getBudgetSpent(b.id);
                          const allocated = Number(b.amount);
                          const statusInfo = getBudgetStatusInfo(
                            spent,
                            allocated,
                            b.status
                          );

                          return (
                            <tr
                              key={b.id}
                              className="hover:bg-green-50/30 transition-colors"
                            >
                              <td className="py-4 px-6 text-gray-800 font-medium">
                                {b.name}
                              </td>
                              <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  {getCategoryName(b.category_id)}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-medium text-gray-600">
                                ${allocated.toLocaleString()}
                              </td>
                              <td
                                className={`py-4 px-6 font-bold ${statusInfo.textClass}`}
                              >
                                ${spent.toLocaleString()}
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.colorClass}`}
                                >
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleBudgetCardModalOpen(b)}
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(b.id)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* 5. History Cards (Mobile) */}
            {historyBudgets.length > 0 && (
              <section className="relative lg:hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                  <div className="p-4 border-b border-green-100/50">
                    <h3 className="text-lg font-bold text-gray-800">History</h3>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {historyBudgets.map((b) => {
                      const spent = getBudgetSpent(b.id);
                      const allocated = Number(b.amount);
                      const statusInfo = getBudgetStatusInfo(
                        spent,
                        allocated,
                        b.status
                      );

                      return (
                        <div
                          key={b.id}
                          className="p-4 hover:bg-green-50/30 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-gray-800">
                                {b.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getCategoryName(b.category_id)}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${statusInfo.colorClass}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-gray-500">
                              Allocated:{" "}
                              <span className="text-gray-800 font-medium">
                                ${allocated.toLocaleString()}
                              </span>
                            </span>
                            <span
                              className={`font-bold ${statusInfo.textClass}`}
                            >
                              Spent: ${spent.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              className="text-sm text-blue-600 font-medium hover:underline flex items-center"
                              onClick={() => handleBudgetCardModalOpen(b)}
                            >
                              <Eye size={14} className="mr-1" /> View
                            </button>
                            <button
                              className="text-sm text-red-500 font-medium hover:underline flex items-center"
                              onClick={() => handleDelete(b.id)}
                            >
                              <Trash2 size={14} className="mr-1" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>
        </MainView>
        <Footer />
      </div>

      <BudgetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        editMode={!!editingBudget}
        budget={editingBudget}
        categories={categoriesData?.data ?? []}
        currentBudgets={activeBudgets}
      />

      <BudgetCardModal
        isOpen={budgetCardModalOpen}
        budget={selectedBudget}
        transactions={
          selectedBudget ? getBudgetTransactions(selectedBudget) : []
        }
        onClose={() => {
          setBudgetCardModalOpen(false);
          setSelectedBudget(null);
        }}
        onEditBudget={handleSaveBudget}
        onDeleteTransaction={handleDeleteTransaction}
        onDeleteBudget={handleDelete}
        getCategoryName={getCategoryName}
      />
    </div>
  );
}
