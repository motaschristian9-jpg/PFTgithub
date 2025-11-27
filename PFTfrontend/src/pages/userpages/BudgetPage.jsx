import { useState } from "react";
import {
  Calendar,
  DollarSign,
  Plus,
  PieChart,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
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

  // Data Context
  const { categoriesData, user, budgetsData, transactionsData } =
    useDataContext();
  const { data: completedBudgetsData } = useBudget("completed");

  const budgets = budgetsData?.data || [];
  const completedBudgets = completedBudgetsData?.data || [];

  // Helper: Get Category Name
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    const category = categoriesData?.data?.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetCardModalOpen, setBudgetCardModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  // Helper: Determine Budget Status
  const getBudgetStatus = (budget) => {
    if (!budget.end_date) return "Active";
    const today = new Date();
    const endDate = new Date(budget.end_date);
    const startDate = new Date(budget.start_date);

    // Normalize time for fair comparison
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    if (today > endDate) return "Completed";
    if (today < startDate) return "Upcoming";
    return "Active";
  };

  // Helper: Filter Transactions for Modal
  const getBudgetTransactions = (budget) => {
    if (!budget || !transactionsData?.data) return [];

    return transactionsData.data
      .filter((t) => {
        // 1. Match Category (Loose equality handles null vs undefined)
        const matchesCategory = t.category_id == budget.category_id;

        // 2. Must be an expense
        const isExpense = t.type === "expense";

        // 3. Date Range
        const dateString = t.transaction_date || t.created_at;
        if (!dateString) return false;

        const tDate = new Date(dateString);
        const start = new Date(budget.start_date);
        const end = new Date(budget.end_date);

        tDate.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const inDateRange = tDate >= start && tDate <= end;

        return matchesCategory && isExpense && inDateRange;
      })
      .sort((a, b) => {
        const dateA = new Date(a.transaction_date || a.created_at);
        const dateB = new Date(b.transaction_date || b.created_at);
        return dateB - dateA; // Newest first
      });
  };

  // Helper: Calculate Spent Amount
  const budgetSpent = (budgetId) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (!budget) return 0;

    const relevantTransactions = getBudgetTransactions(budget);
    return relevantTransactions.reduce(
      (total, t) => total + parseFloat(t.amount || 0),
      0
    );
  };

  // Handler: Open Detailed Modal
  const handleBudgetCardModalOpen = (budget) => {
    const spent = budgetSpent(budget.id);
    const remaining = Number(budget.amount) - spent;

    setSelectedBudget({ ...budget, spent, remaining });
    setBudgetCardModalOpen(true);
  };

  // Handler: Open Edit Form
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  // --- ACTIONS ---

  // 1. Delete Transaction
  const handleDeleteTransaction = async (transaction) => {
    try {
      const result = await Swal.fire({
        title: "Delete Transaction?",
        text: "This will remove the expense from this budget.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it!",
        customClass: { container: "swal-z-index-fix" },
      });

      if (result.isConfirmed) {
        await deleteTransaction(transaction.id);

        // REFRESH DATA
        await queryClient.invalidateQueries(["transactions"]);
        await queryClient.invalidateQueries(["budgets"]);

        // Optimistic UI update for the open modal
        if (selectedBudget) {
          const amount = parseFloat(transaction.amount);
          setSelectedBudget((prev) => ({
            ...prev,
            spent: prev.spent - amount,
            remaining: prev.remaining + amount,
          }));
        }

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
          customClass: { container: "swal-z-index-fix" },
        });
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete transaction",
        customClass: { container: "swal-z-index-fix" },
      });
    }
  };

  // 2. Delete Budget
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
        // 1. Call API
        await deleteBudget(id);

        // 2. IMPORTANT: Force React Query to re-fetch the list
        await queryClient.invalidateQueries(["budgets"]);

        // 3. Update UI state
        if (budgetCardModalOpen) {
          setBudgetCardModalOpen(false);
          setSelectedBudget(null);
        }

        Swal.fire({
          icon: "success",
          title: "Budget Deleted!",
          text: "The budget has been successfully removed.",
          timer: 2000,
          showConfirmButton: false,
          customClass: { container: "swal-z-index-fix" },
        });
      } catch (error) {
        console.error("Failed to delete budget:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to delete budget",
          text: "Please try again later.",
          customClass: { container: "swal-z-index-fix" },
        });
      }
    }
  };

  // 3. Save Budget
  const handleSaveBudget = async (budgetData) => {
    try {
      if (budgetData.id) {
        await updateBudget(budgetData.id, budgetData);

        if (selectedBudget && selectedBudget.id === budgetData.id) {
          setSelectedBudget((prev) => ({ ...prev, ...budgetData }));
        }
      } else {
        await createBudget(budgetData);
      }

      // IMPORTANT: Force React Query to re-fetch the list after save/edit
      await queryClient.invalidateQueries(["budgets"]);

      setEditingBudget(null);
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save budget:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to save budget",
        text: "Please try again later.",
        customClass: { container: "swal-z-index-fix" },
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
      {/* CSS Fix for SweetAlert Z-Index */}
      <style>{`
        .swal-z-index-fix {
            z-index: 10000 !important;
        }
      `}</style>

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
                        Manage and track your budgets
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

            {/* Budget Overview */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    Budget Overview
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {budgets.length} budget{budgets.length !== 1 ? "s" : ""}{" "}
                    created
                  </p>
                </div>

                {budgets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <PieChart className="text-gray-300" size={48} />
                      <span className="text-gray-500 font-medium">
                        No budgets created yet
                      </span>
                      <p className="text-gray-400 text-sm">
                        Create your first budget to start tracking expenses
                      </p>
                      <button
                        onClick={() => {
                          setEditingBudget(null);
                          setModalOpen(true);
                        }}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        Create Budget
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                    {budgets.map((b, i) => {
                      const spent = budgetSpent(b.id);
                      const allocated = Number(b.amount);
                      const remaining = allocated - spent;
                      const percent =
                        allocated > 0
                          ? Math.min((spent / allocated) * 100, 100)
                          : 0;
                      const status = getBudgetStatus(b);
                      const isCompleted = status === "Completed";
                      const statusColor = isCompleted ? "green" : "green"; // Modify if red/yellow needed

                      return (
                        <div
                          key={i}
                          className="group relative cursor-pointer"
                          onClick={() => handleBudgetCardModalOpen(b)}
                        >
                          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                          <div className="relative bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 overflow-hidden">
                            <div
                              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-400`}
                            ></div>

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
                                {isCompleted ? (
                                  <CheckCircle
                                    className="text-green-500"
                                    size={20}
                                  />
                                ) : (
                                  <Clock className="text-green-500" size={20} />
                                )}
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
                                  {allocated.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Spent:
                                </span>
                                <span className="font-semibold text-red-600">
                                  {spent.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Remaining:
                                </span>
                                <span className="font-semibold text-orange-600">
                                  {Math.max(remaining, 0).toLocaleString()}
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
                                {status}
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

            {/* Completed Budgets Table */}
            {completedBudgets.length > 0 && (
              <section className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-2xl blur opacity-40"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                      Completed Budgets
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedBudgets.map((b, i) => (
                          <tr
                            key={i}
                            className="bg-white border-b hover:bg-gray-50"
                          >
                            <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                              {b.name}
                            </th>
                            <td className="px-6 py-4">
                              {getCategoryName(b.category_id)}
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              ${Number(b.amount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleBudgetCardModalOpen(b)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(b.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
        currentBudgets={budgets} // <--- THIS LINE IS CRITICAL. 'budgets' comes from useDataContext -> budgetsData.data
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
