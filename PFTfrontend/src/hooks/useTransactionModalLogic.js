import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { showSuccess, showError } from "../utils/swal";
import { useModalFormHooks } from "./useModalFormHooks";
import { useDataContext } from "../components/DataLoader";
import { useCreateTransaction, useUpdateTransaction } from "./useTransactions";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import { useTranslation } from "react-i18next";

export const useTransactionModalLogic = ({
  isOpen,
  onClose,
  onTransactionAdded,
  editMode,
  transactionToEdit,
}) => {
  const { t } = useTranslation();
  const {
    activeBudgetsData,
    transactionsData,
    activeSavingsData,
    categoriesData,
    user,
  } = useDataContext();

  const addTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const [type, setType] = useState("income");
  const [loading, setLoading] = useState(false);
  const [saveToSavings, setSaveToSavings] = useState(false);

  const todayString = useMemo(() => new Date().toISOString().split("T")[0], []);

  const userCurrency = user?.currency || "USD";
  const currencySymbol = getCurrencySymbol(userCurrency);

  const availableBalance = useMemo(() => {
    const income = Number(transactionsData?.totals?.income || 0);
    const expenses = Number(transactionsData?.totals?.expenses || 0);
    return Math.max(0, income - expenses);
  }, [transactionsData]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    setError,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      category: "",
      amount: "",
      transaction_date: todayString,
      description: "",
      savingsGoalId: "",
      savingsAmount: "",
      savingsPercentage: "",
    },
    mode: "onChange",
  });

  const watchedCategory = useWatch({ control, name: "category" });
  const { expenseCategories, incomeCategories } = useModalFormHooks(type);

  const savingsGoals = useMemo(() => {
    if (Array.isArray(activeSavingsData)) return activeSavingsData;
    if (activeSavingsData?.data && Array.isArray(activeSavingsData.data))
      return activeSavingsData.data;
    return [];
  }, [activeSavingsData]);

  const sortedCategories = useMemo(() => {
    const cats = type === "income" ? incomeCategories : expenseCategories;
    return [...cats].sort((a, b) =>
      a.name === "Other"
        ? 1
        : b.name === "Other"
        ? -1
        : a.name.localeCompare(b.name)
    );
  }, [type, incomeCategories, expenseCategories]);

  const findTransferCategory = () => {
    if (!categoriesData?.data) return null;
    
    // 1. Check for specific "Savings" or "Transfer" category (Best)
    const specificCategory = categoriesData.data.find(
      (c) =>
        c.type === "expense" &&
        (c.name.toLowerCase().includes("savings") ||
          c.name.toLowerCase().includes("transfer"))
    );
    if (specificCategory) return specificCategory.id;

    // 2. Check for "Other" category (Safe Fallback)
    const otherCategory = categoriesData.data.find(
      (c) => c.type === "expense" && c.name.toLowerCase() === "other"
    );
    if (otherCategory) return otherCategory.id;

    // 3. Fallback to any expense category (Last Resort, prevents crash)
    return categoriesData.data.find((c) => c.type === "expense")?.id;
  };

  const budgetStatus = useMemo(() => {
    const budgets = Array.isArray(activeBudgetsData)
      ? activeBudgetsData
      : activeBudgetsData?.data || [];

    if (type !== "expense" || !watchedCategory || budgets.length === 0)
      return null;

    const budget = budgets.find((b) => b.category_id == watchedCategory);
    if (!budget) return null;

    const relevantTransactions =
      transactionsData?.data?.filter(
        (t) => t.budget_id == budget.id && t.type === "expense"
      ) || [];

    const spent = relevantTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amount || 0),
      0
    );

    return {
      ...budget,
      spent,
      remaining: parseFloat(budget.amount) - spent,
    };
  }, [type, watchedCategory, activeBudgetsData, transactionsData]);

  // Smart Naming: Auto-fill Name when a Budget is detected for the category
  useEffect(() => {
    if (type === "expense" && budgetStatus) {
      const currentName = getValues("name");
      if (!currentName) {
        setValue("name", `Budget: ${budgetStatus.name}`);
      }
    }
  }, [budgetStatus, type, getValues, setValue]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSaveToSavings(false);

      if (editMode && transactionToEdit) {
        setType(transactionToEdit.type);
        reset({
          name: transactionToEdit.name,
          category: transactionToEdit.category_id?.toString() || "",
          amount: transactionToEdit.amount.toString(),
          transaction_date: transactionToEdit.date,
          description: transactionToEdit.description || "",
        });
      } else {
        setType("income");
        reset({
          name: "",
          category: "",
          amount: "",
          transaction_date: todayString,
          description: "",
          savingsGoalId: "",
          savingsAmount: "",
          savingsPercentage: "",
        });
      }
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, editMode, transactionToEdit, reset, todayString]);

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && isOpen && onClose();
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const validateAmount = (value) => {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) return "Amount must be greater than 0";

    if (type === "expense") {
      let requiredAmount = amount;
      if (editMode && transactionToEdit && transactionToEdit.type === "expense") {
        const originalAmount = parseFloat(transactionToEdit.amount);
        requiredAmount = amount - originalAmount;
      }

      if (requiredAmount > availableBalance) {
        return `Insufficient funds. Available: ${formatCurrency(availableBalance, userCurrency)}`;
      }
    }
    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("savingsAmount", { message: "" });
    setError("savingsPercentage", { message: "" });

    try {
      let budgetIdToSend = null;
      if (budgetStatus) {
        const txDate = new Date(data.transaction_date);
        const start = new Date(budgetStatus.start_date);
        const end = new Date(budgetStatus.end_date);
        txDate.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        if (txDate >= start && txDate <= end) {
          budgetIdToSend = budgetStatus.id;
        }
      }

      let savingsDeduction = 0;
      const totalInputAmount = parseFloat(data.amount);
      let selectedGoal = null;

      if (type === "income" && saveToSavings && data.savingsGoalId) {
        selectedGoal = savingsGoals.find((g) => g.id == data.savingsGoalId);

        if (data.savingsAmount && parseFloat(data.savingsAmount) > 0) {
          savingsDeduction = parseFloat(data.savingsAmount);
        } else if (
          data.savingsPercentage &&
          parseFloat(data.savingsPercentage) > 0
        ) {
          savingsDeduction =
            totalInputAmount * (parseFloat(data.savingsPercentage) / 100);
        }

        if (savingsDeduction > totalInputAmount) {
          setError("amount", {
            type: "manual",
            message: "Savings deduction exceeds income.",
          });
          setLoading(false);
          return;
        }
      }

      const finalIncomeAmount = totalInputAmount;

      const payload = {
        name: data.name,
        type,
        amount: finalIncomeAmount,
        description: data.description,
        date: data.transaction_date,
        category_id: data.category ? parseInt(data.category) : null,
        budget_id: budgetIdToSend,
      };

      let response;
      if (editMode && transactionToEdit) {
        response = await updateTransactionMutation.mutateAsync({
          id: transactionToEdit.id,
          data: payload,
        });
      } else {
        if (
          type === "income" &&
          saveToSavings &&
          savingsDeduction > 0 &&
          selectedGoal
        ) {
          payload.savings_amount = savingsDeduction;
          payload.saving_goal_id = selectedGoal.id;
          payload.transfer_category_id = findTransferCategory();

          response = await addTransactionMutation.mutateAsync(payload);

          const formattedDeduction = formatCurrency(
            savingsDeduction,
            userCurrency
          );

          showSuccess(
            t('app.swal.successTitle'),
            t('app.swal.savingsAllocated', { amount: formattedDeduction, goal: selectedGoal.name })
          );

          if (onTransactionAdded) onTransactionAdded(response);
          onClose();
          return;
        } else {
          response = await addTransactionMutation.mutateAsync(payload);
        }
      }

      showSuccess(
        editMode ? t('app.swal.transactionUpdated') : t('app.swal.transactionAdded'),
        t('app.swal.transactionSavedMsg')
      );

      if (onTransactionAdded) onTransactionAdded(response);
      onClose();
    } catch (error) {
      console.error(error);
      if (error.response?.status === 422) {
        Object.entries(error.response.data.errors).forEach(([key, val]) => {
          const fieldName =
            key === "category_id"
              ? "category"
              : key === "date"
              ? "transaction_date"
              : key;
          setError(fieldName, { type: "server", message: val[0] });
        });
      } else {
        showError(t('app.swal.errorTitle'), t('app.swal.errorText'));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    type,
    setType,
    loading,
    saveToSavings,
    setSaveToSavings,
    userCurrency,
    currencySymbol,
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    errors,
    savingsGoals,
    sortedCategories,
    budgetStatus,
    todayString,
    onSubmit,
    validateAmount,
  };
};
