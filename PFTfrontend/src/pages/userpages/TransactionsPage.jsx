import { useState, useEffect } from "react";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
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
import { useLocation } from "react-router-dom";
import { useDataContext } from "../../components/DataLoader";
import { useDeleteTransaction } from "../../hooks/useTransactions.js";

export default function TransactionsPage() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, categoriesData } = useDataContext();
  const deleteTransactionMutation = useDeleteTransaction();

  const {
    transactions,
    totalIncome,
    totalExpenses,
    pagination,
    page,
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

  const [modalOpen, setModalOpen] = useState(false);
  const [datePreset, setDatePreset] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Add useEffect to update startDate and endDate when datePreset changes
  useEffect(() => {
    let start = "";
    let end = "";
    const today = new Date();

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

    setStartDate(start);
    setEndDate(end);
    setPage(1); // Reset page when date changes
  }, [datePreset]);

  const filteredCategories = (categoriesData?.data || []).filter(
    (cat) => type === "all" || cat.type === type
  );

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

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
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await deleteTransactionMutation.mutateAsync(transactionId);

      await Swal.fire({
        icon: "success",
        title: "Transaction Deleted!",
        text: "The transaction has been successfully removed.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortBy === key && sortOrder === "asc") {
      direction = "desc";
    }
    setSortBy(key);
    setSortOrder(direction);
    setPage(1); // Reset page when sorting changes
  };

  const getSortIcon = (key) => {
    if (sortBy !== key)
      return <ArrowUpDown size={16} className="text-gray-400" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={16} className="text-green-600" />
    ) : (
      <ArrowDown size={16} className="text-green-600" />
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    return `$${absAmount.toFixed(2)}`;
  };

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
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Transactions
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Track and manage your financial transactions
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer"
                  >
                    <Plus
                      size={16}
                      className="text-white sm:w-[18px] sm:h-[18px]"
                    />
                    <span className="font-medium">Add Transaction</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Summary Cards */}
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

            {/* Filters and Search */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4">
                  {/* Search and Filters Row */}
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Left side filters */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full xl:w-auto flex-wrap">
                      <div className="relative w-full sm:w-64">
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                          }}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                        />
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Filter
                          size={18}
                          className="text-gray-600 hidden sm:block"
                        />
                        <select
                          value={type}
                          onChange={(e) => {
                            setType(e.target.value);
                            setCategoryId("");
                            setPage(1);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-auto"
                        >
                          <option key="all" value="all">All Types</option>
                          <option key="income" value="income">Income</option>
                          <option key="expense" value="expense">Expenses</option>
                        </select>
                      </div>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-auto"
                      >
                        <option value="">All Categories</option>
                        {filteredCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {/* Date Preset */}
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Calendar
                          size={18}
                          className="text-gray-600 hidden sm:block"
                        />
                        <select
                          value={datePreset}
                          onChange={(e) => setDatePreset(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-auto"
                        >
                          <option key="all" value="all">All Dates</option>
                          <option key="this_month" value="this_month">This Month</option>
                          <option key="last_month" value="last_month">Last Month</option>
                          <option key="custom" value="custom">Custom Range</option>
                        </select>
                      </div>
                      {/* Pagination Controls */}
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() =>
                            setPage(Math.max(pagination.currentPage - 1, 1))
                          }
                          disabled={pagination.currentPage === 1}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={18} className="text-gray-600" />
                        </button>
                        <div className="px-3 py-2 border border-gray-300 rounded-lg bg-white min-w-[60px] text-center">
                          <span className="text-sm font-medium text-gray-700">
                            {pagination.currentPage}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setPage(
                              Math.min(
                                pagination.currentPage + 1,
                                pagination.lastPage
                              )
                            )
                          }
                          disabled={
                            pagination.currentPage === pagination.lastPage
                          }
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                    {/* Transaction count */}
                    <div className="text-sm text-gray-600 self-start xl:self-center">
                      Showing {transactions.length} transactions
                    </div>
                  </div>
                  {/* Custom date range */}
                  {datePreset === "custom" && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        <label className="text-sm text-gray-600 whitespace-nowrap">
                          From:
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-auto"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        <label className="text-sm text-gray-600 whitespace-nowrap">
                          To:
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Transactions Table - Desktop View
                NOTE: changed breakpoint so table only shows at lg (>=1024px).
                This keeps the compact/mobile cards up through 768-1023px and
                prevents zooming/shrinking issues on medium screens.
            */}
            <section className="relative hidden lg:block">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-green-100/50">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Transaction History
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-green-50 sticky top-0">
                        <tr>
                          <th 
                            className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700 cursor-pointer hover:bg-green-100 transition-colors"
                            onClick={() => handleSort("date")}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Date</span>
                              {getSortIcon("date")}
                            </div>
                          </th>
                          <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700">
                            Name
                          </th>
                          <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700">
                            Category
                          </th>
                          <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700">
                            Description
                          </th>
                          <th 
                            className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700 cursor-pointer hover:bg-green-100 transition-colors"
                            onClick={() => handleSort("amount")}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Amount</span>
                              {getSortIcon("amount")}
                            </div>
                          </th>
                          <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700">
                            Type
                          </th>
                          <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan="7" className="text-center py-12">
                              <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-green-600">Loading transactions...</p>
                              </div>
                            </td>
                          </tr>
                        ) : isError ? (
                          <tr>
                            <td colSpan="7" className="text-center py-12">
                              <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 flex items-center justify-center text-red-600 text-3xl">
                                  ⚠️
                                </div>
                                <p className="text-red-600">Error loading transactions. Please try again later.</p>
                              </div>
                            </td>
                          </tr>
                        ) : transactions.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-12">
                              <div className="flex flex-col items-center space-y-3">
                                <DollarSign className="text-gray-300" size={48} />
                                <span className="text-gray-500 font-medium">
                                  No transactions found
                                </span>
                                <p className="text-gray-400 text-sm">
                                  Try adjusting your search or filters
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          transactions.map((transaction, index) => (
                            <tr
                              key={transaction.id ?? `txn-${index}`}
                              className="hover:bg-green-50/30 transition-colors border-b border-gray-100/50"
                            >
                              <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-700">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-800 font-medium">
                                {transaction.name || "Unnamed"}
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    transaction.type === "income"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {transaction.category_name || "Uncategorized"}
                                </span>
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600 max-w-xs truncate">
                                {transaction.description || "-"}
                              </td>
                              <td
                                className={`py-3 sm:py-4 px-4 sm:px-6 font-bold ${
                                  transaction.type === "income"
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              >
                                <div className="flex items-center space-x-1">
                                  {transaction.type === "income" ? (
                                    <TrendingUp size={16} />
                                  ) : (
                                    <TrendingDown size={16} />
                                  )}
                                  <span>
                                    {transaction.type === "income" ? "+" : "-"}{" "}
                                    {formatAmount(transaction.amount)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    transaction.type === "income"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {transaction.type === "income" ? "Income" : "Expense"}
                                </span>
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    className="p-2 rounded-lg transition-colors text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleEdit(transaction)}
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    className="p-2 rounded-lg transition-colors text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                    onClick={() => handleDelete(transaction.id)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Transactions Cards - Mobile View (keeps visible up to 1023px) */}
            <section className="relative lg:hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                <div className="p-4 border-b border-green-100/50">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Transaction History
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-12 px-4">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-green-600">Loading transactions...</p>
                      </div>
                    </div>
                  ) : isError ? (
                    <div className="text-center py-12 px-4">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 flex items-center justify-center text-red-600 text-3xl">
                          ⚠️
                        </div>
                        <p className="text-red-600">Error loading transactions. Please try again later.</p>
                      </div>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="flex flex-col items-center space-y-3">
                        <DollarSign className="text-gray-300" size={48} />
                        <span className="text-gray-500 font-medium">
                          No transactions found
                        </span>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {transactions.map((transaction, index) => (
                        <div
                          key={transaction.id ?? `txn-${index}`}
                          className="p-4 hover:bg-green-50/30 transition-colors"
                        >
                          <div className="flex items-start justify-between space-x-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    transaction.type === "income"
                                      ? "bg-green-100"
                                      : "bg-red-100"
                                  }`}
                                >
                                  {transaction.type === "income" ? (
                                    <TrendingUp
                                      size={14}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <TrendingDown
                                      size={14}
                                      className="text-red-500"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {transaction.name || "Unnamed"}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        transaction.type === "income"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {transaction.type === "income" ? "Income" : "Expense"}
                                    </span>
                                    {transaction.category_name && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 truncate max-w-[120px]">
                                        {transaction.category_name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Calendar size={12} />
                                  <span>{formatDate(transaction.date)}</span>
                                </div>
                                <div
                                  className={`text-lg font-bold ${
                                    transaction.type === "income"
                                      ? "text-green-600"
                                      : "text-red-500"
                                  }`}
                                >
                                  {transaction.type === "income" ? "+" : "-"}
                                  {formatAmount(transaction.amount)}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-1 flex-shrink-0">
                              <button
                                className="p-2 rounded-lg transition-colors text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleEdit(transaction)}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="p-2 rounded-lg transition-colors text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(transaction.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </MainView>

        <Footer />
      </div>

      {/* Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onTransactionAdded={() => {
          setPage(1);
        }}
        editMode={!!editingTransaction}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
}
