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

export default function TransactionsPage() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, categoriesData } = useDataContext();

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
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto flex-wrap">
                      <div className="relative w-full sm:w-auto">
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
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
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
                          <option value="all">All Types</option>
                          <option value="income">Income</option>
                          <option value="expense">Expenses</option>
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
                          <option value="all">All Dates</option>
                          <option value="this_month">This Month</option>
                          <option value="last_month">Last Month</option>
                          <option value="custom">Custom Range</option>
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
                    <div className="text-sm text-gray-600 self-start lg:self-center">
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

            {/* Transactions Table */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th
                          className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                          onClick={() => handleSort("date")}
                        >
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Date</span>
                            <span className="sm:hidden">Date</span>
                            {getSortIcon("date")}
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Name
                        </th>
                        <th
                          className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors hidden md:table-cell"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Category</span>
                            {getSortIcon("category")}
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                          Description
                        </th>
                        <th
                          className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                          onClick={() => handleSort("amount")}
                        >
                          <div className="flex items-center space-x-1">
                            <DollarSign size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Amount</span>
                            {getSortIcon("amount")}
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {(isExpanded
                        ? transactions
                        : transactions.slice(0, 15)
                      ).map((transaction, index) => (
                        <tr
                          key={transaction.id ?? `txn-${index}`}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            <div className="max-w-[120px] sm:max-w-none truncate">
                              {transaction.name || "Unnamed"}
                            </div>
                            <div className="md:hidden text-xs text-gray-500 mt-1">
                              {transaction.category_name || "Uncategorized"}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 hidden md:table-cell">
                            {transaction.category_name || "Uncategorized"}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 max-w-xs truncate hidden lg:table-cell">
                            {transaction.description}
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatAmount(transaction.amount)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                transaction.type === "income"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.type === "income"
                                ? "Income"
                                : "Expense"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {transactions.length > 15 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-3 sm:px-6 py-4 text-center bg-gray-50/50 border-t border-gray-200/50"
                          >
                            <button
                              onClick={() => setIsExpanded(!isExpanded)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 mx-auto text-sm"
                            >
                              <ChevronDown
                                size={16}
                                className={`transform transition-transform duration-300 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                              <span className="font-medium">
                                {isExpanded
                                  ? "Show Less"
                                  : `Show More (${
                                      transactions.length - 15
                                    } remaining)`}
                              </span>
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {transactions.length === 0 && !isLoading && (
                  <div className="text-center py-12 px-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSign className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base">
                        No transactions found
                      </p>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="text-center py-12 px-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-green-600 text-sm sm:text-base">
                        Loading transactions...
                      </p>
                    </div>
                  </div>
                )}

                {isError && (
                  <div className="text-center py-12 px-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 flex items-center justify-center text-red-600 text-3xl">
                        ⚠️
                      </div>
                      <p className="text-red-600 text-sm sm:text-base">
                        Error loading transactions. Please try again later.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </MainView>

        <Footer />
      </div>

      {/* Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onTransactionAdded={() => {
          // reset to first page to see new transaction
          setPage(1);
        }}
      />
    </div>
  );
}
