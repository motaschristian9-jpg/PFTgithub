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
  History,
  LayoutGrid,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import BudgetModal from "../../components/BudgetModal.jsx";
import BudgetCardModal from "../../components/BudgetCardModal.jsx";

import { useDataContext } from "../../components/DataLoader.jsx";
import {
  useBudgetHistory,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "../../hooks/useBudget.js";
import {
  useDeleteTransaction,
  useUpdateTransaction,
} from "../../hooks/useTransactions.js";

// --- Custom Alerts & Utils ---
import { confirmDelete, showSuccess, showError } from "../../utils/swal";
import { formatCurrency } from "../../utils/currency";

export default function BudgetPage() {
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetCardModalOpen, setBudgetCardModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // --- Search & Filter State ---
  const [activeTab, setActiveTab] = useState("active");
  const [historyPage, setHistoryPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  // --- Data Context ---
  const { categoriesData, user, transactionsData, activeBudgetsData } =
    useDataContext();

  const userCurrency = user?.currency || "USD";

  const historyFilters = useMemo(
    () => ({
      search,
      categoryId,
      sortBy,
      sortDir,
    }),
    [search, categoryId, sortBy, sortDir]
  );

  const { data: historyBudgetsRaw, isLoading: historyLoading } =
    useBudgetHistory(historyPage, historyFilters);

  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  // --- Process Data ---

  // 1. Active Budgets (Client-side filtering from Context Data)
  const activeBudgets = useMemo(() => {
    let result = activeBudgetsData || [];

    if (search) {
      result = result.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    result = [...result].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "amount") {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (sortBy === "created_at" || sortBy === "end_date") {
        valA = new Date(valA);
        valB = new Date(valB);
      } else if (sortBy === "name") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [activeBudgetsData, search, sortBy, sortDir]);

  // 2. History Budgets (Server-side pagination)
  const historyBudgets = useMemo(
    () => historyBudgetsRaw?.data || [],
    [historyBudgetsRaw]
  );

  // 3. Transactions (From Context)
  const allTransactions = useMemo(
    () => transactionsData?.data || [],
    [transactionsData]
  );

  const getCategoryName = (catId) => {
    const cat = categoriesData?.data?.find((c) => c.id === catId);
    return cat ? cat.name : "Uncategorized";
  };

  // Fallback spending map using client-side data
  const spendingMap = useMemo(() => {
    const map = {};
    allTransactions.forEach((t) => {
      if (t.type === "expense" && t.budget_id) {
        map[t.budget_id] = (map[t.budget_id] || 0) + parseFloat(t.amount || 0);
      }
    });
    return map;
  }, [allTransactions]);

  const getBudgetSpent = (budget) => {
    // 1. Priority: Backend Sum (from withSum query)
    if (
      budget.transactions_sum_amount !== undefined &&
      budget.transactions_sum_amount !== null
    ) {
      return parseFloat(budget.transactions_sum_amount);
    }
    if (budget.total_spent !== undefined && budget.total_spent !== null) {
      return parseFloat(budget.total_spent);
    }

    // 2. Fallback: Client-side Map
    if (spendingMap[budget.id] !== undefined) {
      return spendingMap[budget.id];
    }

    return 0;
  };

  // --- Stats Calculation ---
  const budgetStats = useMemo(() => {
    const listToCalculate =
      activeTab === "active" ? activeBudgets : historyBudgets;

    const totalAllocated = listToCalculate.reduce(
      (sum, b) => sum + Number(b.amount),
      0
    );

    const totalSpent = listToCalculate.reduce(
      (sum, b) => sum + getBudgetSpent(b),
      0
    );

    return {
      totalAllocated,
      totalSpent,
      count: listToCalculate.length,
    };
  }, [activeTab, activeBudgets, historyBudgets, spendingMap]);

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

  const handleBudgetCardModalOpen = (budget) => {
    const spent = getBudgetSpent(budget);
    const remaining = Number(budget.amount) - spent;
    setSelectedBudget({ ...budget, spent, remaining });
    setBudgetCardModalOpen(true);
  };

  // ===========================================================
  // HANDLE DELETE LOGIC (Optimized & Consistent)
  // ===========================================================
  const handleDelete = async (budgetIdOrObject) => {
    const id =
      typeof budgetIdOrObject === "object"
        ? budgetIdOrObject.id
        : budgetIdOrObject;

    // Check for attached transactions
    const linkedTransactions = allTransactions.filter(
      (t) => t.budget_id == id && t.type === "expense"
    );
    const hasTransactions = linkedTransactions.length > 0;

    // Build Custom Alert Props
    let title = "Delete Budget?";
    let text = "This action cannot be undone.";

    if (hasTransactions) {
      title = "Delete & Preserve History?";
      text = `This budget has ${linkedTransactions.length} transaction(s). They will be unlinked but kept in your history.`;
    }

    // 1. Custom Confirmation
    const result = await confirmDelete(title, text);

    if (result.isConfirmed) {
      try {
        // 2. Unlink Transactions (if any)
        if (hasTransactions) {
          const unlinkPromises = linkedTransactions.map((tx) => {
            const cleanPayload = {
              name: tx.name,
              amount: tx.amount,
              type: tx.type,
              date: tx.date || tx.transaction_date,
              category_id: tx.category_id,
              description: tx.description,
              budget_id: null, // Force Null
            };

            return updateTransactionMutation.mutateAsync({
              id: tx.id,
              data: cleanPayload,
            });
          });
          await Promise.all(unlinkPromises);
        }

        // 3. Delete Budget
        await deleteBudgetMutation.mutateAsync(id);

        // 4. Cleanup UI
        if (budgetCardModalOpen) {
          setBudgetCardModalOpen(false);
          setSelectedBudget(null);
        }

        // 5. Success Message
        showSuccess("Deleted!", "Budget deleted successfully.");
      } catch (error) {
        console.error("Delete failed", error);
        showError("Error", "Failed to delete budget.");
      }
    }
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      if (budgetData.id) {
        // UPDATE
        const response = await updateBudgetMutation.mutateAsync({
          id: budgetData.id,
          data: budgetData,
        });

        if (selectedBudget && selectedBudget.id === budgetData.id) {
          const updatedBudget = response.data || response;
          setSelectedBudget((prev) => ({
            ...prev,
            ...updatedBudget,
            remaining: Number(updatedBudget.amount) - prev.spent,
          }));
        }
      } else {
        // CREATE
        await createBudgetMutation.mutateAsync(budgetData);
      }

      setEditingBudget(null);
      setModalOpen(false);
      showSuccess(
        budgetData.id ? "Updated!" : "Created!",
        "Budget saved successfully."
      );
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save budget";
      showError("Error", msg);
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      await deleteTransactionMutation.mutateAsync(transaction.id);

      if (selectedBudget) {
        const amount = parseFloat(transaction.amount);
        setSelectedBudget((prev) => ({
          ...prev,
          spent: prev.spent - amount,
          remaining: prev.remaining + amount,
        }));
      }
      showSuccess("Deleted!", "Transaction deleted successfully.");
    } catch (e) {
      showError("Error", "Failed to delete transaction");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

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
            {/* Header & Actions */}
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

            {/* Filter Bar */}
            <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="relative w-full lg:max-w-md group">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search budgets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  {activeTab === "history" && (
                    <div className="relative flex-1 lg:flex-none animate-in fade-in zoom-in-95 duration-200">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Filter size={16} />
                      </div>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer"
                      >
                        <option value="">All Categories</option>
                        {categoriesData?.data
                          ?.filter((c) => c.type === "expense")
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  <div className="relative flex-1 lg:flex-none">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <ArrowUpDown size={16} />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer"
                    >
                      <option value="created_at">Newest First</option>
                      <option value="end_date">End Date</option>
                      <option value="amount">Amount</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                  <button
                    onClick={() =>
                      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                    }
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                    title={sortDir === "asc" ? "Ascending" : "Descending"}
                  >
                    {sortDir === "asc" ? (
                      <TrendingUp size={18} />
                    ) : (
                      <TrendingDown size={18} />
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {activeTab === "active"
                      ? "Active Allocated"
                      : "History Allocated"}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(budgetStats.totalAllocated, userCurrency)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {activeTab === "active" ? "Active Spent" : "History Spent"}
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(budgetStats.totalSpent, userCurrency)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <TrendingUp size={24} />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {activeTab === "active" ? "Active Count" : "History Count"}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {budgetStats.count}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </section>

            {/* Tabs & Content */}
            <div className="space-y-6">
              <div className="flex space-x-1 bg-white/50 p-1 rounded-xl w-fit border border-green-100">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "active"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-500 hover:text-green-600"
                  }`}
                >
                  <LayoutGrid size={16} /> <span>Active Budgets</span>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "history"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-gray-500 hover:text-green-600"
                  }`}
                >
                  <History size={16} /> <span>History</span>
                </button>
              </div>

              {activeTab === "active" && (
                <section className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 min-h-[300px]">
                    {activeBudgets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                          <PieChart className="text-green-300" size={40} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700">
                          No active budgets found
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs">
                          Try adjusting your filters or create a new budget.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeBudgets.map((b) => {
                          const spent = getBudgetSpent(b);
                          const allocated = Number(b.amount);
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
                                <div className="flex items-center space-x-3 mb-5 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                                  <Calendar size={14} />
                                  <span className="truncate">
                                    {b.start_date
                                      ? new Date(
                                          b.start_date
                                        ).toLocaleDateString()
                                      : "-"}{" "}
                                    —{" "}
                                    {b.end_date
                                      ? new Date(
                                          b.end_date
                                        ).toLocaleDateString()
                                      : "-"}
                                  </span>
                                </div>
                                <div className="space-y-3 mb-5">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                      Allocated
                                    </span>
                                    <span className="font-bold text-gray-800">
                                      {formatCurrency(allocated, userCurrency)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Spent</span>
                                    <span
                                      className={`font-bold ${statusInfo.textClass}`}
                                    >
                                      {formatCurrency(spent, userCurrency)}
                                    </span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ease-out ${statusInfo.barColor}`}
                                      style={{ width: `${widthPercent}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between pt-2">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.colorClass}`}
                                    >
                                      {statusInfo.label}
                                    </span>
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
              )}

              {activeTab === "history" && (
                <section className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                    <div className="p-6 border-b border-green-100/50 flex justify-between items-center bg-gray-50/50">
                      <h3 className="text-xl font-bold text-gray-800">
                        Budget History
                      </h3>
                      <span className="text-sm text-gray-500">
                        Completed & Expired
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
                          {historyLoading ? (
                            <tr>
                              <td colSpan="6" className="p-8 text-center">
                                Loading history...
                              </td>
                            </tr>
                          ) : historyBudgets.length === 0 ? (
                            <tr>
                              <td
                                colSpan="6"
                                className="p-8 text-center text-gray-500"
                              >
                                No budget history found matching your filters.
                              </td>
                            </tr>
                          ) : (
                            historyBudgets.map((b) => {
                              const spent = getBudgetSpent(b);
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
                                    {formatCurrency(allocated, userCurrency)}
                                  </td>
                                  <td
                                    className={`py-4 px-6 font-bold ${statusInfo.textClass}`}
                                  >
                                    {formatCurrency(spent, userCurrency)}
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
                                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                        onClick={() =>
                                          handleBudgetCardModalOpen(b)
                                        }
                                      >
                                        <Eye size={16} />
                                      </button>
                                      <button
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(b.id)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
            </div>
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
