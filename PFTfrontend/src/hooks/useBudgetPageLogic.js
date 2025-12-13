import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useDataContext } from "../components/DataLoader";
import {
  useBudgetHistory,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "./useBudget";
import { useDeleteTransaction } from "./useTransactions";
import { confirmDelete, showSuccess, showError } from "../utils/swal";

export const useBudgetPageLogic = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetCardModalOpen, setBudgetCardModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const [activeTab, setActiveTab] = useState("active");
  const [historyPage, setHistoryPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const { categoriesData, user, transactionsData, activeBudgetsData } =
    useDataContext();

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
  const deleteTransactionMutation = useDeleteTransaction();

  const allTransactions = useMemo(
    () => transactionsData?.data || [],
    [transactionsData]
  );

  /* 
     REMOVED: spendingMap logic. 
     Reason: Backend now reliably provides 'total_spent' via BudgetResource and BudgetController. 
     We should track 'allTransactions' only for deletion checks, not for calculating spent.
  */

  const getBudgetSpent = (budget) => {
    // Trust the backend's calculated total
    return parseFloat(budget.total_spent || 0);
  };

  const activeBudgets = useMemo(() => {
    let result = activeBudgetsData || [];

    // Filter out completed/reached budgets (spent >= amount)
    result = result.filter((b) => {
      const spent = getBudgetSpent(b);
      const amount = Number(b.amount);
      return spent < amount;
    });

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

  const historyBudgets = useMemo(() => {
    const history = historyBudgetsRaw?.data || [];
    const completedActive = (activeBudgetsData || []).filter((b) => {
      const spent = getBudgetSpent(b);
      const amount = Number(b.amount);
      return spent >= amount;
    });

    // If searching in history, also filter the completed active ones
    let filteredCompleted = completedActive;
    if (search && activeTab === "history") {
      filteredCompleted = completedActive.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const combined = [...filteredCompleted, ...history];
    
    // Sort combined history by end_date descending by default to show most recent first
    return combined.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
  }, [historyBudgetsRaw, activeBudgetsData, search, activeTab]);

  const historyTotalPages = useMemo(
    () => historyBudgetsRaw?.meta?.last_page || historyBudgetsRaw?.last_page || 1,
    [historyBudgetsRaw]
  );

  const getCategoryName = (catId) => {
    const cat = categoriesData?.data?.find((c) => c.id === catId);
    return cat ? cat.name : "Uncategorized";
  };

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
  }, [activeTab, activeBudgets, historyBudgets]);

  const getBudgetStatusInfo = (spent, total, dbStatus) => {
    const ratio = total > 0 ? spent / total : 0;
    if (spent > total)
      return {
        label: t('app.budgets.statusLabels.overspent'),
        colorClass: "bg-red-100 text-red-700",
        textClass: "text-red-700",
        barColor: "bg-red-600",
      };
    if (ratio >= 1 || dbStatus === "reached")
      return {
        label: t('app.budgets.statusLabels.limitReached'),
        colorClass: "bg-red-50 text-red-600",
        textClass: "text-red-600",
        barColor: "bg-red-500",
      };
    if (dbStatus === "completed")
      return {
        label: t('app.budgets.statusLabels.completed'),
        colorClass: "bg-green-100 text-green-700",
        textClass: "text-green-700",
        barColor: "bg-green-500",
      };
    if (dbStatus === "expired")
      return {
        label: t('app.budgets.statusLabels.expired'),
        colorClass: "bg-orange-100 text-orange-700",
        textClass: "text-orange-700",
        barColor: "bg-orange-500",
      };
    if (ratio > 0.85)
      return {
        label: t('app.budgets.statusLabels.nearLimit'),
        colorClass: "bg-yellow-100 text-yellow-700",
        textClass: "text-yellow-700",
        barColor: "bg-yellow-500",
      };
    return {
      label: t('app.budgets.statusLabels.active'),
      colorClass: "bg-violet-50 text-violet-700",
      textClass: "text-violet-600",
      barColor: "bg-violet-500",
    };
  };

  const handleBudgetCardModalOpen = (budget) => {
    const spent = getBudgetSpent(budget);
    const remaining = Number(budget.amount) - spent;
    setSelectedBudget({ ...budget, spent, remaining });
    setBudgetCardModalOpen(true);
  };

  const handleDelete = async (budgetIdOrObject) => {
    const id =
      typeof budgetIdOrObject === "object"
        ? budgetIdOrObject.id
        : budgetIdOrObject;

    const linkedTransactions = allTransactions.filter(
      (t) => t.budget_id == id && t.type === "expense"
    );
    const hasTransactions = linkedTransactions.length > 0;

    let title = t('app.budgets.alerts.deleteBudgetTitle');
    let text = t('app.budgets.alerts.deleteBudgetMsg');

    if (hasTransactions) {
      title = t('app.budgets.alerts.deletePreserveTitle');
      text = t('app.budgets.alerts.deletePreserveMsg', { count: linkedTransactions.length });
    }

    const result = await confirmDelete(
      title,
      text,
      t('app.budgets.alerts.confirmDeleteBtn'),
      t('app.budgets.alerts.cancelBtn')
    );

    if (result.isConfirmed) {
      try {
        await deleteBudgetMutation.mutateAsync(id);

        if (budgetCardModalOpen) {
          setBudgetCardModalOpen(false);
          setSelectedBudget(null);
        }

        showSuccess(t('app.budgets.alerts.deleteSuccessTitle'), t('app.budgets.alerts.deleteSuccessMsg'));
      } catch (error) {
        console.error("Delete failed", error);
        showError(t('app.budgets.alerts.deleteErrorTitle'), t('app.budgets.alerts.deleteErrorMsg'));
      }
    }
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      if (budgetData.id) {
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
        await createBudgetMutation.mutateAsync(budgetData);
      }

      setEditingBudget(null);
      setModalOpen(false);
      showSuccess(
        budgetData.id ? t('app.swal.transactionUpdated') : t('app.swal.transactionAdded'),
        t('app.swal.transactionSavedMsg')
      );
    } catch (error) {
      const msg = error.response?.data?.message || t('app.swal.transactionFailedMsg');
      showError(t('app.swal.errorTitle'), msg);
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
      showSuccess(t('app.budgets.alerts.deleteTxSuccessTitle'), t('app.budgets.alerts.deleteTxSuccessMsg'));
    } catch {
      showError(t('app.budgets.alerts.deleteTxErrorTitle'), t('app.budgets.alerts.deleteTxErrorMsg'));
    }
  };

  return {
    modalOpen,
    setModalOpen,
    editingBudget,
    setEditingBudget,
    budgetCardModalOpen,
    setBudgetCardModalOpen,
    selectedBudget,
    setSelectedBudget,
    activeTab,
    setActiveTab,
    historyPage,
    setHistoryPage,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    user,
    categoriesData,
    activeBudgets,
    historyBudgets,
    historyLoading,
    budgetStats,
    getCategoryName,
    getBudgetSpent,
    getBudgetStatusInfo,
    handleBudgetCardModalOpen,
    handleDelete,
    handleSaveBudget,
    handleDeleteTransaction,
    historyTotalPages,
  };
};
