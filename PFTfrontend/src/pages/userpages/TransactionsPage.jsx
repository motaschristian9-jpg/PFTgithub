import { useState, useEffect, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  SlidersHorizontal,
} from "lucide-react";

import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import TransactionModal from "../../components/TransactionModal.jsx";
import { logoutUser } from "../../api/auth.js";
import { useExampleTransactionsApi } from "../../hooks/useExampleTransactionsApi.js";
import Swal from "sweetalert2";
import { useDataContext } from "../../components/DataLoader";
import { useDeleteTransaction } from "../../hooks/useTransactions.js";

export default function TransactionsPage() {
  // --- UI State ---
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Local filter state for date logic
  const [datePreset, setDatePreset] = useState("all");

  // --- Data & Hooks ---
  const { user, categoriesData } = useDataContext();
  const deleteTransactionMutation = useDeleteTransaction();

  const {
    transactions,
    totalIncome,
    totalExpenses,
    pagination,
    setPage,
    type,
    setType,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    categoryId,
    setCategoryId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    isError,
  } = useExampleTransactionsApi();

  // --- Optimization: Memoize Filtered Categories ---
  // Prevents re-calculation on every render (e.g. while typing search)
  const filteredCategories = useMemo(() => {
    return (categoriesData?.data || []).filter(
      (cat) => type === "all" || cat.type === type
    );
  }, [categoriesData, type]);

  // --- Effects ---

  // Handle Date Presets
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
    }

    setStartDate(start);
    setEndDate(end);
    setPage(1); // Always reset to page 1 when changing filters
  }, [datePreset, setStartDate, setEndDate, setPage]);

  // --- Handlers ---

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = async (transactionId) => {
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
      await deleteTransactionMutation.mutateAsync(transactionId);
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1500,
        showConfirmButton: false,
        customClass: { container: "swal-z-index-fix" },
      });
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortBy === key && sortOrder === "asc") {
      direction = "desc";
    }
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
  };

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

  // --- Render Helpers ---

  const getSortIcon = (key) => {
    if (sortBy !== key)
      return <ArrowUpDown size={14} className="text-gray-400 opacity-50" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-green-600" />
    ) : (
      <ArrowDown size={14} className="text-green-600" />
    );
  };

  const formatAmount = (amount) =>
    `$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
      <style>{` .swal-z-index-fix { z-index: 10000 !important; } `}</style>

      {/* Decorative Background */}
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
            {/* 1. Header & Actions */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                    <DollarSign className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      Transactions
                    </h1>
                    <p className="text-gray-500 mt-1">
                      Manage and track your financial history
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingTransaction(null);
                    setModalOpen(true);
                  }}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-medium"
                >
                  <Plus size={18} />
                  <span>Add Transaction</span>
                </button>
              </div>
            </section>

            {/* 2. Enhanced Filter & Control Panel */}
            <section className="relative z-20">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-5">
                {/* Top Row: Search & Pagination */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-5">
                  <div className="relative w-full lg:max-w-md group">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search by name or description..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                    <button
                      onClick={() =>
                        setPage(Math.max(pagination.currentPage - 1, 1))
                      }
                      disabled={pagination.currentPage === 1}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                    >
                      <ChevronLeft size={18} className="text-gray-600" />
                    </button>
                    <span className="px-3 text-sm font-semibold text-gray-700 min-w-[3rem] text-center">
                      {pagination.currentPage} / {pagination.lastPage || 1}
                    </span>
                    <button
                      onClick={() =>
                        setPage(
                          Math.min(
                            pagination.currentPage + 1,
                            pagination.lastPage
                          )
                        )
                      }
                      disabled={pagination.currentPage === pagination.lastPage}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                    >
                      <ChevronRight size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Filters Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Type Filter */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <SlidersHorizontal size={16} />
                    </div>
                    <select
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                        setCategoryId("");
                        setPage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer hover:border-green-300 transition-colors"
                    >
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expenses</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Filter size={16} />
                    </div>
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer hover:border-green-300 transition-colors"
                    >
                      <option value="">All Categories</option>
                      {filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Preset */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Calendar size={16} />
                    </div>
                    <select
                      value={datePreset}
                      onChange={(e) => setDatePreset(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer hover:border-green-300 transition-colors"
                    >
                      <option value="all">All Dates</option>
                      <option value="this_month">This Month</option>
                      <option value="last_month">Last Month</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {/* Sort Filter (Mobile Only primarily, serves as quick sort) */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <ArrowUpDown size={16} />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setSortOrder("desc");
                        setPage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none text-sm text-gray-700 font-medium cursor-pointer hover:border-green-300 transition-colors"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="amount">Sort by Amount</option>
                      <option value="created_at">Sort by Created</option>
                    </select>
                  </div>
                </div>

                {/* Custom Date Range Expandable */}
                {datePreset === "custom" && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Totals Summary (Mobile Optimized Grid) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Income</p>
                  <p className="text-xl font-bold text-green-600">
                    ${totalIncome.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    ${totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <TrendingDown size={20} />
                </div>
              </div>
              <div className="hidden lg:flex bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-blue-100 items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Net</p>
                  <p
                    className={`text-xl font-bold ${
                      totalIncome - totalExpenses >= 0
                        ? "text-blue-600"
                        : "text-red-500"
                    }`}
                  >
                    ${(totalIncome - totalExpenses).toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <DollarSign size={20} />
                </div>
              </div>
            </section>

            {/* 4. Transactions List */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden min-h-[400px] flex flex-col">
                {/* Desktop Table Header */}
                <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div
                    onClick={() => handleSort("date")}
                    className="col-span-2 cursor-pointer flex items-center hover:text-green-600 transition-colors"
                  >
                    Date {getSortIcon("date")}
                  </div>
                  <div className="col-span-3">Name & Description</div>
                  <div className="col-span-2">Category</div>
                  <div
                    onClick={() => handleSort("amount")}
                    className="col-span-2 cursor-pointer flex items-center hover:text-green-600 transition-colors"
                  >
                    Amount {getSortIcon("amount")}
                  </div>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Loading transactions...</p>
                    </div>
                  ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-64 text-red-500">
                      <p>Failed to load data.</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <DollarSign size={48} className="mb-4 opacity-50" />
                      <p>No transactions found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="group hover:bg-green-50/30 transition-colors"
                        >
                          {/* Desktop Row */}
                          <div className="hidden lg:grid grid-cols-12 gap-4 p-4 items-center">
                            <div className="col-span-2 text-sm text-gray-600 font-medium">
                              {formatDate(tx.date)}
                            </div>
                            <div className="col-span-3">
                              <p className="text-sm font-bold text-gray-800 truncate">
                                {tx.name || "Unnamed"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {tx.description}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                {tx.category_name || "Uncategorized"}
                              </span>
                            </div>
                            <div
                              className={`col-span-2 text-sm font-bold ${
                                tx.type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {tx.type === "income" ? "+" : "-"}
                              {formatAmount(tx.amount)}
                            </div>
                            <div className="col-span-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${
                                  tx.type === "income"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {tx.type}
                              </span>
                            </div>
                            <div className="col-span-2 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(tx)}
                                className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(tx.id)}
                                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Mobile Card */}
                          <div className="lg:hidden p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  tx.type === "income"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {tx.type === "income" ? (
                                  <TrendingUp size={18} />
                                ) : (
                                  <TrendingDown size={18} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">
                                  {tx.name || "Unnamed"}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{formatDate(tx.date)}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[100px]">
                                    {tx.category_name}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <span
                                className={`text-sm font-bold ${
                                  tx.type === "income"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {tx.type === "income" ? "+" : "-"}
                                {formatAmount(tx.amount)}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEdit(tx)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(tx.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Footer Pagination Summary */}
                <div className="lg:hidden p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
                  Page {pagination.currentPage} of {pagination.lastPage}
                </div>
              </div>
            </section>
          </div>
        </MainView>

        <Footer />
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onTransactionAdded={() => setPage(1)}
        editMode={!!editingTransaction}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
}
