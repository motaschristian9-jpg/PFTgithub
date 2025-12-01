import { useState, useMemo } from "react";
import {
  Calendar,
  DollarSign,
  Plus,
  Target,
  Trash2,
  PiggyBank,
  Award,
  Pencil,
  History,
  LayoutGrid,
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import { useDataContext } from "../../components/DataLoader.jsx";
import SavingsModal from "../../components/SavingsModal.jsx";
import SavingsCardModal from "../../components/SavingsCardModal.jsx";
import Swal from "sweetalert2";

import {
  useSavingsHistory,
  useCreateSaving,
  useUpdateSaving,
  useDeleteSaving,
} from "../../hooks/useSavings.js";
// 1. IMPORT DELETE TRANSACTION HOOK
import {
  useCreateTransaction,
  useDeleteTransaction,
} from "../../hooks/useTransactions.js";

export default function SavingsPage() {
  const queryClient = useQueryClient();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState(null);

  // Filter & Pagination State
  const [activeTab, setActiveTab] = useState("active");
  const [historyPage, setHistoryPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  // Data Hooks
  const { user, activeSavingsData, transactionsData, categoriesData } =
    useDataContext();

  const historyFilters = useMemo(
    () => ({ search, sortBy, sortDir }),
    [search, sortBy, sortDir]
  );

  const { data: historySavingsRaw, isLoading: historyLoading } =
    useSavingsHistory(historyPage, historyFilters);

  const createMutation = useCreateSaving();
  const updateMutation = useUpdateSaving();
  const deleteMutation = useDeleteSaving();
  const createTransactionMutation = useCreateTransaction();
  // 2. INITIALIZE DELETE TRANSACTION MUTATION
  const deleteTransactionMutation = useDeleteTransaction();

  // --- Calculations ---

  const availableBalance = useMemo(() => {
    const income = Number(transactionsData?.totals?.income || 0);
    const expenses = Number(transactionsData?.totals?.expenses || 0);
    return Math.max(0, income - expenses);
  }, [transactionsData]);

  // 1. Process ACTIVE Savings
  const activeSavings = useMemo(() => {
    let result = activeSavingsData || [];
    if (search) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    result = [...result].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "target_amount" || sortBy === "current_amount") {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (sortBy === "created_at" || sortBy === "updated_at") {
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
  }, [activeSavingsData, search, sortBy, sortDir]);

  // 2. Process HISTORY Savings
  const historySavings = useMemo(
    () => historySavingsRaw?.data || [],
    [historySavingsRaw]
  );
  const historyMeta = useMemo(
    () => historySavingsRaw?.meta || {},
    [historySavingsRaw]
  );

  // Stats Calculation
  const stats = useMemo(() => {
    const listToCalculate =
      activeTab === "active" ? activeSavings : historySavings;
    const totalSaved = listToCalculate.reduce(
      (sum, s) => sum + Number(s.current_amount || 0),
      0
    );
    const totalTarget = listToCalculate.reduce(
      (sum, s) => sum + Number(s.target_amount || 0),
      0
    );
    const totalRemaining = Math.max(totalTarget - totalSaved, 0);
    return {
      totalSaved,
      totalTarget,
      totalRemaining,
      count: listToCalculate.length,
    };
  }, [activeTab, activeSavings, historySavings]);

  const getProgressInfo = (current, target) => {
    const percent = target > 0 ? (current / target) * 100 : 0;
    if (percent >= 100)
      return {
        label: "Completed",
        colorClass: "bg-green-100 text-green-800",
        textClass: "text-green-800",
        barColor: "bg-green-600",
        iconBg: "bg-green-100",
      };
    if (percent >= 75)
      return {
        label: "Almost There",
        colorClass: "bg-green-100 text-green-700",
        textClass: "text-green-700",
        barColor: "bg-green-500",
        iconBg: "bg-green-50",
      };
    if (percent >= 50)
      return {
        label: "Halfway",
        colorClass: "bg-emerald-50 text-emerald-700",
        textClass: "text-emerald-700",
        barColor: "bg-emerald-500",
        iconBg: "bg-emerald-50",
      };
    return {
      label: "In Progress",
      colorClass: "bg-green-50 text-green-600",
      textClass: "text-green-600",
      barColor: "bg-green-400",
      iconBg: "bg-green-50",
    };
  };

  // --- FILTER TRANSACTIONS FOR SELECTED GOAL ---
  const getSavingsGoalTransactions = (goalId) => {
    if (!transactionsData || !transactionsData.data || !goalId) return [];
    const currentGoal = activeSavingsData?.find((g) => g.id === goalId);
    const goalNameLower = currentGoal ? currentGoal.name.toLowerCase() : "";

    return transactionsData.data
      .filter((t) => {
        const idMatch = t.saving_goal_id && t.saving_goal_id == goalId;
        const nameMatch =
          goalNameLower &&
          (t.name?.toLowerCase().includes(goalNameLower) ||
            t.description?.toLowerCase().includes(goalNameLower));
        return idMatch || nameMatch;
      })
      .map((t) => ({
        id: t.id,
        date: t.date || t.transaction_date || t.created_at,
        amount: t.amount,
        type: t.type,
        description: t.description || t.name,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // --- HELPER: FIND CATEGORY WITH FALLBACKS ---
  const findCategory = (keywords, type) => {
    if (!categoriesData?.data) return null;
    let cat = categoriesData.data.find(
      (c) =>
        keywords.some((k) => c.name.toLowerCase().includes(k)) &&
        c.type === type
    );
    if (cat) return cat.id;
    cat = categoriesData.data.find(
      (c) => c.name.toLowerCase() === "other" && c.type === type
    );
    if (cat) return cat.id;
    cat = categoriesData.data.find((c) => c.type === type);
    return cat ? cat.id : null;
  };

  // --- HANDLER: WITHDRAWAL ---
  const handleCreateWithdrawalTransaction = async (
    withdrawalAmount,
    savingGoalName
  ) => {
    const categoryId = findCategory(
      ["withdrawal", "transfer", "income"],
      "income"
    );
    if (!categoryId) {
      Swal.fire("Error", "No Income category found.", "error");
      return false;
    }
    const payload = {
      name: `Withdrawal: ${savingGoalName}`,
      type: "income",
      amount: withdrawalAmount,
      description: `Funds moved from savings goal: ${savingGoalName}`,
      date: format(new Date(), "yyyy-MM-dd"),
      category_id: categoryId,
      saving_goal_id: selectedSaving.id,
      budget_id: null,
    };
    try {
      await createTransactionMutation.mutateAsync(payload);
      queryClient.invalidateQueries(["transactions"]);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // --- HANDLER: CONTRIBUTION ---
  const handleCreateContributionTransaction = async (
    contributionAmount,
    savingGoalName
  ) => {
    const categoryId = findCategory(
      ["deposit", "transfer", "savings", "expense"],
      "expense"
    );
    if (!categoryId) {
      Swal.fire("Error", "No Expense category found.", "error");
      return false;
    }
    const payload = {
      name: `Deposit: ${savingGoalName}`,
      type: "expense",
      amount: contributionAmount,
      description: `Funds transferred to savings goal: ${savingGoalName}`,
      date: format(new Date(), "yyyy-MM-dd"),
      category_id: categoryId,
      saving_goal_id: selectedSaving ? selectedSaving.id : null,
      budget_id: null,
    };
    try {
      await createTransactionMutation.mutateAsync(payload);
      queryClient.invalidateQueries(["transactions"]);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };
  const handleCreate = () => {
    setSelectedSaving(null);
    setIsFormModalOpen(true);
  };
  const handleCardClick = (saving) => {
    setSelectedSaving(saving);
    setIsCardModalOpen(true);
  };
  const handleDirectEdit = (saving, e) => {
    e?.stopPropagation();
    setSelectedSaving(saving);
    setIsFormModalOpen(true);
  };

  const handleSave = async (data) => {
    const initialAmount = parseFloat(data.current_amount || 0);
    try {
      if (selectedSaving) {
        await updateMutation.mutateAsync({ id: selectedSaving.id, data });
      } else {
        const newSaving = await createMutation.mutateAsync(data);
        if (initialAmount > 0) {
          setSelectedSaving(newSaving);
          await handleCreateContributionTransaction(
            initialAmount,
            newSaving.name
          );
        }
      }
      queryClient.invalidateQueries(["savings"]);
      setIsFormModalOpen(false);
      setSelectedSaving(null);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleCardUpdate = async (updatedData) => {
    try {
      const payload = {
        name: updatedData.name,
        target_amount: updatedData.target_amount,
        current_amount: updatedData.current_amount,
        description: updatedData.description,
      };
      await updateMutation.mutateAsync({ id: updatedData.id, data: payload });
      setSelectedSaving((prev) => ({ ...prev, ...payload }));
      queryClient.invalidateQueries(["savings"]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTransaction = async (transaction, goalObj, newBalance) => {
    try {
      await deleteTransactionMutation.mutateAsync(transaction.id);
      await updateMutation.mutateAsync({
        id: goalObj.id,
        data: {
          ...goalObj,
          current_amount: newBalance,
        },
      });
      setSelectedSaving((prev) => ({ ...prev, current_amount: newBalance }));
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["savings"]);
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Transaction deleted and balance updated.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { container: "swal-z-index-fix" },
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      Swal.fire("Error", "Failed to delete transaction.", "error");
    }
  };

  // --- 3. UPDATED "REFUND & DELETE" LOGIC ---
  const handleDelete = async (id) => {
    // A. Identify the goal and its transactions
    const goalToDelete = activeSavingsData?.find((s) => s.id === id);
    if (!goalToDelete) return;

    const linkedTransactions = getSavingsGoalTransactions(id);
    const hasFunds = linkedTransactions.length > 0;

    // B. Build the Alert Message
    let title = "Delete Goal?";
    let text = "This action cannot be undone.";
    let confirmText = "Yes, delete it";
    let icon = "warning";

    if (hasFunds) {
      title = "Return Funds to Balance?";
      text = `This goal has ${
        linkedTransactions.length
      } transaction(s) totaling $${Number(
        goalToDelete.current_amount
      ).toLocaleString()}. \n\nDeleting this will remove these transactions and return the money to your Available Balance.`;
      confirmText = "Yes, Refund & Delete";
    }

    // C. Fire Confirmation
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: confirmText,
      customClass: { container: "swal-z-index-fix" },
    });

    if (result.isConfirmed) {
      try {
        // D. Refund Step: Delete linked transactions first
        if (hasFunds) {
          // Show loading indication
          Swal.fire({
            title: "Refunding...",
            text: "Returning funds to main balance",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
            customClass: { container: "swal-z-index-fix" },
          });

          // Execute deletions in parallel
          const deletePromises = linkedTransactions.map((tx) =>
            deleteTransactionMutation.mutateAsync(tx.id)
          );
          await Promise.all(deletePromises);
        }

        // E. Delete the Goal
        await deleteMutation.mutateAsync(id);

        // F. Refresh and Cleanup
        await queryClient.invalidateQueries(["savings"]);
        await queryClient.invalidateQueries(["transactions"]);

        setIsCardModalOpen(false);
        setIsFormModalOpen(false);
        setSelectedSaving(null);

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: hasFunds
            ? "Goal deleted and funds returned to balance."
            : "Goal deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
          customClass: { container: "swal-z-index-fix" },
        });
      } catch (error) {
        console.error("Delete failed", error);
        Swal.fire(
          "Error",
          "Failed to delete goal or refund transactions.",
          "error"
        );
      }
    }
  };

  const handleDeleteClick = (id, e) => {
    e?.stopPropagation();
    handleDelete(id);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50">
      <style>{` .swal-z-index-fix { z-index: 10000 !important; } `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-emerald-100/30 to-green-200/20 rounded-full blur-2xl"></div>
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
          <div className="space-y-8 p-4 sm:p-6 lg:p-0">
            {/* Header & Actions */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                    <PiggyBank className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      Savings Goals
                    </h1>
                    <p className="text-gray-500 mt-1">
                      Track your progress and reach your financial dreams
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-medium"
                >
                  <Plus size={18} /> <span>Add Savings</span>
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
                    placeholder="Search goals..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
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
                      <option value="target_amount">Target Amount</option>
                      <option value="current_amount">Saved Amount</option>
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

            {/* Stats Section */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {activeTab === "active" ? "Active Saved" : "History Saved"}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${stats.totalSaved.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {activeTab === "active"
                      ? "Active Target"
                      : "History Target"}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    ${stats.totalTarget.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <Target size={24} />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-teal-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {activeTab === "active" ? "Active Count" : "History Count"}
                  </p>
                  <p className="text-2xl font-bold text-teal-600 mt-1">
                    {stats.count}
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                  <Award size={24} />
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
                  <LayoutGrid size={16} /> <span>Active Goals</span>
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 min-h-[300px]">
                    {activeSavings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                          <Target className="text-green-300" size={40} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700">
                          No active goals found
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs">
                          Set a goal to start saving for your next big purchase
                          or emergency fund.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeSavings.map((s) => {
                          const current = Number(s.current_amount || 0);
                          const target = Number(s.target_amount || 1);
                          const remaining = Math.max(target - current, 0);
                          const percent =
                            target > 0 ? (current / target) * 100 : 0;
                          const widthPercent = Math.min(percent, 100);
                          const statusInfo = getProgressInfo(current, target);

                          return (
                            <div
                              key={s.id}
                              className="group relative cursor-pointer"
                              onClick={() => handleCardClick(s)}
                            >
                              <div className="relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col justify-between">
                                <div
                                  className={`absolute top-0 left-0 right-0 h-1.5 ${statusInfo.barColor}`}
                                ></div>
                                <div>
                                  <div className="flex items-start justify-between mb-4 mt-1">
                                    <div className="flex-1 min-w-0 mr-4">
                                      <h3 className="font-bold text-lg text-gray-800 truncate">
                                        {s.name}
                                      </h3>
                                      <p className="text-xs text-gray-500 mt-0.5 truncate uppercase tracking-wider font-medium">
                                        Target: ${target.toLocaleString()}
                                      </p>
                                    </div>
                                    <div
                                      className={`p-2 rounded-lg ${statusInfo.iconBg}`}
                                    >
                                      <Target
                                        className={statusInfo.textClass}
                                        size={20}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 mb-5 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                                    <Calendar size={14} />
                                    <span className="truncate">
                                      {s.updated_at
                                        ? `Updated: ${new Date(
                                            s.updated_at
                                          ).toLocaleDateString()}`
                                        : "No recent updates"}
                                    </span>
                                  </div>
                                  <div className="space-y-3 mb-5">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500">
                                        Saved
                                      </span>
                                      <span className="font-bold text-gray-800">
                                        ${current.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500">
                                        Remaining
                                      </span>
                                      <span className="font-bold text-gray-600">
                                        ${remaining.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="mb-4">
                                    <div className="flex justify-between items-center mb-1.5">
                                      <span className="text-xs font-semibold text-gray-500 uppercase">
                                        Progress
                                      </span>
                                      <span
                                        className={`text-xs font-bold ${statusInfo.textClass}`}
                                      >
                                        {percent.toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ease-out ${statusInfo.barColor}`}
                                        style={{ width: `${widthPercent}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between pt-2">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.colorClass}`}
                                    >
                                      {statusInfo.label}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="text-xs font-medium text-gray-400 flex items-center">
                                        View Details
                                        <ArrowRight
                                          size={12}
                                          className="ml-1"
                                        />
                                      </div>
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
              )}

              {activeTab === "history" && (
                <section className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                    <div className="p-6 border-b border-green-100/50 flex justify-between items-center bg-gray-50/50">
                      <h3 className="text-xl font-bold text-gray-800">
                        History & Completed Goals
                      </h3>
                      <span className="text-sm text-gray-500">
                        Completed & Cancelled
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-green-50/50 text-gray-500 uppercase text-xs">
                          <tr>
                            <th className="py-4 px-6 font-semibold tracking-wider">
                              Goal Name
                            </th>
                            <th className="py-4 px-6 font-semibold tracking-wider">
                              Target Amount
                            </th>
                            <th className="py-4 px-6 font-semibold tracking-wider">
                              Final Amount
                            </th>
                            <th className="py-4 px-6 font-semibold tracking-wider">
                              Completion Date
                            </th>
                            <th className="py-4 px-6 font-semibold tracking-wider text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-100/50">
                          {historyLoading ? (
                            <tr>
                              <td colSpan="5" className="p-8 text-center">
                                Loading history...
                              </td>
                            </tr>
                          ) : historySavings.length === 0 ? (
                            <tr>
                              <td
                                colSpan="5"
                                className="p-8 text-center text-gray-500"
                              >
                                No history found matching your filters.
                              </td>
                            </tr>
                          ) : (
                            historySavings.map((s) => (
                              <tr
                                key={s.id}
                                className="hover:bg-green-50/40 transition-colors cursor-pointer group"
                                onClick={() => handleCardClick(s)}
                              >
                                <td className="py-4 px-6 text-gray-800 font-bold">
                                  {s.name}
                                </td>
                                <td className="py-4 px-6 text-gray-500">
                                  ${Number(s.target_amount).toLocaleString()}
                                </td>
                                <td className="py-4 px-6 font-bold text-green-600">
                                  ${Number(s.current_amount).toLocaleString()}
                                </td>
                                <td className="py-4 px-6 text-gray-500 text-sm">
                                  {s.updated_at
                                    ? new Date(
                                        s.updated_at
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      className="p-2 rounded-lg transition-colors text-gray-400 hover:text-green-600 hover:bg-green-50"
                                      onClick={(e) => handleDirectEdit(s, e)}
                                      title="Edit Goal"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      className="p-2 rounded-lg transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50"
                                      onClick={(e) =>
                                        handleDeleteClick(s.id, e)
                                      }
                                      title="Delete Goal"
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
                    {historyMeta.last_page > 1 && (
                      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <button
                          onClick={() =>
                            setHistoryPage((p) => Math.max(1, p - 1))
                          }
                          disabled={historyPage === 1}
                          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} className="mr-2" /> Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {historyPage} of {historyMeta.last_page}
                        </span>
                        <button
                          onClick={() =>
                            setHistoryPage((p) =>
                              Math.min(historyMeta.last_page, p + 1)
                            )
                          }
                          disabled={historyPage === historyMeta.last_page}
                          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next <ChevronRight size={16} className="ml-2" />
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </MainView>
        <Footer />
      </div>

      <SavingsModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedSaving(null);
        }}
        onSave={handleSave}
        editMode={!!selectedSaving}
        saving={selectedSaving}
      />

      <SavingsCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        saving={selectedSaving}
        onEditSaving={handleCardUpdate}
        onDeleteSaving={handleDelete}
        availableBalance={availableBalance}
        transactions={
          selectedSaving ? getSavingsGoalTransactions(selectedSaving.id) : []
        }
        handleCreateWithdrawalTransaction={handleCreateWithdrawalTransaction}
        handleCreateContributionTransaction={
          handleCreateContributionTransaction
        }
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
}
