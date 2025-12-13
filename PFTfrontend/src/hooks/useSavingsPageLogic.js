import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import axios from "../api/axios";
import { useDataContext } from "../components/DataLoader";
import {
  useSavingsHistory,
  useCreateSaving,
  useUpdateSaving,
  useDeleteSaving,
} from "./useSavings";
import {
  useCreateTransaction,
  useDeleteTransaction,
} from "./useTransactions";
import { confirmDelete, showSuccess, showError } from "../utils/swal";
import { formatCurrency } from "../utils/currency";
import { useTranslation } from "react-i18next";

export const useSavingsPageLogic = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState(null);

  const [activeTab, setActiveTab] = useState("active");
  const [historyPage, setHistoryPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

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
  const deleteTransactionMutation = useDeleteTransaction();

  const availableBalance = useMemo(() => {
    const income = Number(transactionsData?.totals?.income || 0);
    const expenses = Number(transactionsData?.totals?.expenses || 0);
    return Math.max(0, income - expenses);
  }, [transactionsData]);

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

  const historySavings = useMemo(
    () => historySavingsRaw?.data || [],
    [historySavingsRaw]
  );

  const historyTotalPages = useMemo(
    () => historySavingsRaw?.meta?.last_page || historySavingsRaw?.last_page || 1,
    [historySavingsRaw]
  );

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

    // Calculate Top Goal (Highest Current Amount)
    // Combine active and loaded history to find the absolute max
    const allLoadedSavings = [...activeSavings, ...historySavings];
    let topGoal = null;
    let maxAmount = -1;

    allLoadedSavings.forEach(s => {
        const amount = Number(s.current_amount || 0);
        if (amount > maxAmount) {
            maxAmount = amount;
            topGoal = s;
        }
    });

    return {
      totalSaved,
      totalTarget,
      totalRemaining,
      count: listToCalculate.length,
      topGoal: topGoal ? { name: topGoal.name, amount: maxAmount } : null
    };
  }, [activeTab, activeSavings, historySavings]);

  const getProgressInfo = (current, target) => {
    const percent = target > 0 ? (current / target) * 100 : 0;
    if (percent >= 100)
      return {
        label: "Completed",
        colorClass: "bg-teal-100 text-teal-800",
        textClass: "text-teal-800",
        barColor: "bg-teal-600",
        iconBg: "bg-teal-100",
      };
    if (percent >= 75)
      return {
        label: "Almost There",
        colorClass: "bg-teal-100 text-teal-700",
        textClass: "text-teal-700",
        barColor: "bg-teal-500",
        iconBg: "bg-teal-50",
      };
    if (percent >= 50)
      return {
        label: "Halfway",
        colorClass: "bg-teal-50 text-teal-700",
        textClass: "text-teal-700",
        barColor: "bg-teal-500",
        iconBg: "bg-teal-50",
      };
    return {
      label: "In Progress",
      colorClass: "bg-teal-50 text-teal-600",
      textClass: "text-teal-600",
      barColor: "bg-teal-400",
      iconBg: "bg-teal-50",
    };
  };

  const findTransferCategory = (type) => {
    if (!categoriesData?.data) return null;

    // Prioritize "Others" as requested
    let cat = categoriesData.data.find(
      (c) => c.name.toLowerCase() === "others" && c.type === type
    );
    if (cat) return cat.id;
    
    // Fallback to "Other" (singular)
    cat = categoriesData.data.find(
      (c) => c.name.toLowerCase() === "other" && c.type === type
    );
    if (cat) return cat.id;

    // Fallback to "Transfer" or "Savings"
    cat = categoriesData.data.find(
      (c) =>
        c.type === type &&
        (c.name.toLowerCase().includes("transfer") ||
          c.name.toLowerCase().includes("savings"))
    );
    if (cat) return cat.id;

    // Fallback to any category of that type
    cat = categoriesData.data.find((c) => c.type === type);
    return cat ? cat.id : null;
  };

  const handleCreateWithdrawalTransaction = async (
    withdrawalAmount,
    savingGoalName,
    savingGoalId
  ) => {
    const categoryId = findTransferCategory("income");
    if (!categoryId) {
      showError(t('app.swal.errorTitle'), t('app.swal.errorText'));
      return false;
    }
    const payload = {
      name: `Withdrawal: ${savingGoalName}`,
      type: "income",
      amount: withdrawalAmount,
      description: `Funds moved from savings goal: ${savingGoalName}`,
      date: format(new Date(), "yyyy-MM-dd"),
      category_id: categoryId,
      saving_goal_id: savingGoalId,
      budget_id: null,
    };
    console.log("Creating Withdrawal Transaction with payload:", payload);
    try {
      const newTransaction = await createTransactionMutation.mutateAsync(payload);
      queryClient.invalidateQueries(["transactions"]);
      return newTransaction;
    } catch (error) {
      console.error("Failed to create withdrawal transaction:", error);
      showError(t('app.swal.transactionFailed'), t('app.swal.transactionFailedMsg'));
      return false;
    }
  };

  const handleCreateContributionTransaction = async (
    contributionAmount,
    savingGoalName,
    savingGoalId
  ) => {
    const categoryId = findTransferCategory("expense");
    if (!categoryId) {
      showError(t('app.swal.errorTitle'), t('app.swal.errorText'));
      return false;
    }
    const payload = {
      name: `Deposit: ${savingGoalName}`,
      type: "expense",
      amount: contributionAmount,
      description: `Funds transferred to savings goal: ${savingGoalName}`,
      date: format(new Date(), "yyyy-MM-dd"),
      category_id: categoryId,
      saving_goal_id: savingGoalId,
      budget_id: null,
    };
    console.log("Creating Contribution Transaction with payload:", payload);
    try {
      const newTransaction = await createTransactionMutation.mutateAsync(payload);
      queryClient.invalidateQueries(["transactions"]);
      return newTransaction;
    } catch (error) {
      console.error("Failed to create contribution transaction:", error);
      showError(t('app.swal.transactionFailed'), t('app.swal.transactionFailedMsg'));
      return false;
    }
  };

  const handleCreate = () => {
    const currentCount = activeSavingsData?.length || 0;
    if (currentCount >= 6) {
      showError(
        t('app.swal.limitReached'),
        t('app.swal.limitReachedMsg')
      );
      return;
    }
    setSelectedSaving(null);
    setIsFormModalOpen(true);
  };

  const handleCardClick = (saving) => {
    setSelectedSaving(saving);
    setIsCardModalOpen(true);
  };

  const handleSave = async (data) => {
    const initialAmount = parseFloat(data.current_amount || 0);
    try {
      if (selectedSaving) {
        await updateMutation.mutateAsync({ id: selectedSaving.id, data });
        setIsFormModalOpen(false);
        setSelectedSaving(null);
        showSuccess(t('app.swal.savingsUpdated'), t('app.swal.savingsUpdatedMsg'));
      } else {
        const newSaving = await createMutation.mutateAsync(data);
        setIsFormModalOpen(false);
        setSelectedSaving(null);
        showSuccess(t('app.swal.savingsCreated'), t('app.swal.savingsCreatedMsg'));

        if (initialAmount > 0) {
          handleCreateContributionTransaction(
            initialAmount,
            newSaving.name
          ).catch((err) =>
            console.error("Background transaction failed:", err)
          );
        }
      }
      // queryClient.invalidateQueries(["savings"]); // Handled by mutation onSettled
    } catch (error) {
      console.error("Error saving:", error);
      showError(t('app.swal.errorTitle'), t('app.swal.errorText'));
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
      showSuccess(t('app.swal.transactionDeleted'), t('app.swal.transactionDeletedMsg'));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      showError(t('app.swal.errorTitle'), t('app.swal.errorText'));
    }
  };

  const handleDelete = async (id) => {
    let goalToDelete = activeSavingsData?.find((s) => s.id === id);

    if (!goalToDelete && selectedSaving?.id === id) {
      goalToDelete = selectedSaving;
    }

    if (!goalToDelete) {
      goalToDelete = historySavingsRaw?.data?.find((s) => s.id === id);
    }

    if (!goalToDelete) return;

    let linkedTransactions = [];
    try {
      const response = await axios.get("/transactions", {
        params: {
          saving_goal_id: id,
          all: "true",
        },
      });
      linkedTransactions = response.data.data || [];
    } catch (e) {
      console.error("Failed to fetch transactions for deletion check", e);
      linkedTransactions = [];
    }

    const hasFunds = linkedTransactions.length > 0 || Number(goalToDelete.current_amount) > 0;

    const formattedCurrentAmount = formatCurrency(
      Number(goalToDelete.current_amount),
      user?.currency || "USD"
    );

    let title = t('app.savings.alerts.deleteGoalTitle');
    let text = t('app.savings.alerts.deleteGoalMsg');

    if (hasFunds) {
      title = t('app.savings.alerts.returnFundsTitle');
      text = t('app.savings.alerts.returnFundsMsg', { count: linkedTransactions.length, amount: formattedCurrentAmount });
    }

    const result = await confirmDelete(
      title,
      text,
      t('app.savings.alerts.deleteTxBtn'), // Reusing "Yes, delete it" button
      t('app.savings.alerts.cancelBtn')
    );

    if (result.isConfirmed) {
      // Close modals immediately for better UX
      setIsCardModalOpen(false);
      setIsFormModalOpen(false);
      setSelectedSaving(null);

      try {
        // Optimized: Single request to delete goal and optionally refund transactions
        await deleteMutation.mutateAsync({
          id,
          params: { refund_transactions: hasFunds ? "true" : "false" },
        });

        await queryClient.invalidateQueries(["transactions"]);

        showSuccess(
          t('app.savings.alerts.deleteSuccessTitle'),
          hasFunds
            ? t('app.savings.alerts.returnSuccessMsg')
            : t('app.savings.alerts.deleteSuccessMsg')
        );
      } catch (error) {
        console.error("Delete failed", error);
        showError(t('app.savings.alerts.deleteGoalErrorTitle'), t('app.savings.alerts.deleteGoalErrorMsg'));
      }
    }
  };

  return {
    isFormModalOpen,
    setIsFormModalOpen,
    isCardModalOpen,
    setIsCardModalOpen,
    selectedSaving,
    setSelectedSaving,
    activeTab,
    setActiveTab,
    historyPage,
    setHistoryPage,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    user,
    activeSavings,
    historySavings,
    historyLoading,
    stats,
    getProgressInfo,
    handleCreate,
    handleCardClick,
    handleSave,
    handleDeleteTransaction,
    handleDelete,
    historyTotalPages,
    availableBalance,
    totalActiveCount: activeSavingsData?.length || 0,
    handleCreateContributionTransaction,
    handleCreateWithdrawalTransaction,
  };
};
