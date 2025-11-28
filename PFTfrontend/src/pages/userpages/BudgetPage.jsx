import { useState } from "react";
import {
  Calendar,
  DollarSign,
  Plus,
  PieChart,
  Clock,
  Eye,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import Swal from "sweetalert2";
import { useDataContext } from "../../components/DataLoader";
import { createBudget, updateBudget, deleteBudget } from "../../api/budgets";
import { deleteTransaction } from "../../api/transactions";
import { useBudget } from "../../hooks/useBudget";
import BudgetModal from "../../components/BudgetModal.jsx";
import BudgetCardModal from "../../components/BudgetCardModal.jsx";

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- DATA FETCHING ---
  const { categoriesData, user, transactionsData, activeBudgetsData, historyBudgetsData } = useDataContext();

  const activeBudgets = activeBudgetsData?.data || [];
  const historyBudgets = historyBudgetsData?.data || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetCardModalOpen, setBudgetCardModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // --- HELPERS ---

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    const category = categoriesData?.data?.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Helper to get transactions linked to this budget via budget_id
  const getBudgetTransactions = (budget) => {
    if (!budget || !transactionsData?.data) return [];
    return transactionsData.data
      .filter((t) => {
        // Use the direct budget_id relationship instead of category/date matching
        return t.budget_id == budget.id && t.type === "expense";
      })
      .sort(
        (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
      );
  };

  const budgetSpent = (budget) => {
    if (!budget) return 0;
    const relevantTransactions = getBudgetTransactions(budget);
    console.log(relevantTransactions);
    return relevantTransactions.reduce(
      (total, t) => total + parseFloat(t.amount || 0),
      0
    );
  };

  // --- HANDLERS ---

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const handleBudgetCardModalOpen = (budget) => {
    const spent = budgetSpent(budget);
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
        console.error("Failed to delete budget:", error);
      }
    }
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      if (budgetData.id) {
        await updateBudget(budgetData.id, budgetData);
      } else {
        await createBudget(budgetData);
      }
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
      // Update modal local state
      if (selectedBudget) {
        const amount = parseFloat(transaction.amount);
        setSelectedBudget((prev) => ({
          ...prev,
          spent: prev.spent - amount,
          remaining: prev.remaining + amount,
        }));
      }
    } catch (e) {
      console.error(e);
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
          onClick={toggleMobileMenu}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />

      <div className="flex-1 flex flex-col relative z-10">
        <Topbar
          toggleMobileMenu={toggleMobileMenu}
          notifications={[]}
          hasUnread={false}
          setHasUnread={() => {}}
          user={user}
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
                        Budgets
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Manage active budgets and view history
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBudget(null);
                      setModalOpen(true);
                    }}
                    className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base cursor-pointer"
                  >
                    <Plus
                      size={16}
                      className="text-white sm:w-[18px] sm:h-[18px]"
                    />
                    <span className="font-medium">Add Budget</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Active Budgets Grid */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    Active Budgets
                  </h2>
                </div>

                {activeBudgets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <PieChart className="text-gray-300" size={48} />
                      <span className="text-gray-500 font-medium">
                        No active budgets
                      </span>
                      <p className="text-gray-400 text-sm">
                        Create a new budget or check history
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                    {activeBudgets.map((b, i) => {
                      const spent = budgetSpent(b);
                      const allocated = Number(b.amount);
                      const remaining = allocated - spent;
                      const percent =
                        allocated > 0
                          ? Math.min((spent / allocated) * 100, 100)
                          : 0;

                      return (
                        <div
                          key={i}
                          className="group relative cursor-pointer"
                          onClick={() => handleBudgetCardModalOpen(b)}
                        >
                          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                          <div className="relative bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-400"></div>

                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg text-gray-800 truncate">
                                  {b.name ?? "Unnamed Budget"}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                  {getCategoryName(b.category_id)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <Clock className="text-green-500" size={20} />
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 mb-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar size={12} />
                                <span>
                                  {b.start_date
                                    ? new Date(
                                        b.start_date
                                      ).toLocaleDateString()
                                    : "-"}
                                </span>
                              </div>
                              <span>to</span>
                              <div className="flex items-center space-x-1">
                                <Calendar size={12} />
                                <span>
                                  {b.end_date
                                    ? new Date(b.end_date).toLocaleDateString()
                                    : "-"}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Allocated:
                                </span>
                                <span className="font-semibold text-green-600">
                                  ${allocated.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Spent:
                                </span>
                                <span className="font-semibold text-red-600">
                                  ${spent.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Remaining:
                                </span>
                                <span className="font-semibold text-orange-600">
                                  ${Math.max(remaining, 0).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500">
                                  Progress
                                </span>
                                <span className="text-xs font-medium text-gray-700">
                                  {percent.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    percent > 90 ? "bg-red-500" : "bg-green-500"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                              <Eye
                                className="text-gray-400 group-hover:text-green-500 transition-colors"
                                size={16}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* History Table - Desktop View */}
            {historyBudgets.length > 0 && (
              <section className="relative hidden lg:block">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-green-100/50">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Budget History
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Completed, Reached, or Expired budgets
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-green-50 sticky top-0">
                          <tr>
                            <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700">
                              Name
                            </th>
                            <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700">
                              Category
                            </th>
                            <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700">
                              Allocated
                            </th>
                            <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700">
                              Spent
                            </th>
                            <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700">
                              Status
                            </th>
                            <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-700 text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyBudgets.map((b, i) => {
                            const spent = budgetSpent(b);
                            const allocated = Number(b.amount);
                            const status = b.status;

                            let statusClass = "bg-gray-100 text-gray-800";
                            let statusLabel = status;

                            if (status === "completed") {
                              statusClass = "bg-green-100 text-green-800";
                              statusLabel = "Completed";
                            } else if (status === "reached") {
                              statusClass = "bg-red-100 text-red-800";
                              statusLabel = "Limit Reached";
                            } else if (status === "expired") {
                              statusClass = "bg-orange-100 text-orange-800";
                              statusLabel = "Expired";
                            }

                            return (
                              <tr
                                key={i}
                                className="hover:bg-green-50/30 transition-colors border-b border-gray-100/50"
                              >
                                <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-800 font-medium">
                                  {b.name}
                                </td>
                                <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600">
                                  {getCategoryName(b.category_id)}
                                </td>
                                <td className="py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-700">
                                  ${allocated.toLocaleString()}
                                </td>
                                <td className="py-3 sm:py-4 px-4 sm:px-6 font-medium text-red-600">
                                  ${spent.toLocaleString()}
                                </td>
                                <td className="py-3 sm:py-4 px-4 sm:px-6">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass} capitalize`}
                                  >
                                    {statusLabel}
                                  </span>
                                </td>
                                <td className="py-3 sm:py-4 px-4 sm:px-6 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      className="p-2 rounded-lg transition-colors text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                                      onClick={() =>
                                        handleBudgetCardModalOpen(b)
                                      }
                                    >
                                      <Eye size={16} />
                                    </button>
                                    <button
                                      className="p-2 rounded-lg transition-colors text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
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
                </div>
              </section>
            )}

            {/* History Cards - Mobile View */}
            {historyBudgets.length > 0 && (
              <section className="relative lg:hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                  <div className="p-4 border-b border-green-100/50">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Budget History
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {historyBudgets.map((b, i) => {
                      const spent = budgetSpent(b);
                      const status = b.status;
                      let statusClass = "bg-gray-100 text-gray-800";
                      let statusLabel = status;

                      if (status === "completed") {
                        statusClass = "bg-green-100 text-green-800";
                        statusLabel = "Completed";
                      } else if (status === "reached") {
                        statusClass = "bg-red-100 text-red-800";
                        statusLabel = "Limit Reached";
                      } else if (status === "expired") {
                        statusClass = "bg-orange-100 text-orange-800";
                        statusLabel = "Expired";
                      }

                      return (
                        <div
                          key={i}
                          className="p-4 hover:bg-green-50/30 transition-colors"
                        >
                          <div className="flex items-start justify-between space-x-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                                  <DollarSign
                                    size={14}
                                    className="text-green-600"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {b.name}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusClass} capitalize`}
                                    >
                                      {statusLabel}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 truncate max-w-[120px]">
                                      {getCategoryName(b.category_id)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="text-gray-500">
                                  Allocated: $
                                  {Number(b.amount).toLocaleString()}
                                </div>
                                <div className="font-bold text-red-600">
                                  Spent: ${spent.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-1 flex-shrink-0">
                              <button
                                className="p-2 rounded-lg transition-colors text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleBudgetCardModalOpen(b)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="p-2 rounded-lg transition-colors text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(b.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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
