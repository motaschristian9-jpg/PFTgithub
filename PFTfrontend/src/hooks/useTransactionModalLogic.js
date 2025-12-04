import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { showSuccess, showError } from "../utils/swal";
import { useModalFormHooks } from "./useModalFormHooks";
import { useDataContext } from "../components/DataLoader";
import { useCreateTransaction, useUpdateTransaction } from "./useTransactions";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";

export const useTransactionModalLogic = ({
  isOpen,
  onClose,
  onTransactionAdded,
  editMode,
  transactionToEdit,
}) => {
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

  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    setError,
    watch,
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
    return (
      categoriesData.data.find(
        (c) =>
          c.type === "expense" &&
          (c.name.toLowerCase().includes("savings") ||
            c.name.toLowerCase().includes("transfer"))
      )?.id || categoriesData.data.find((c) => c.type === "expense")?.id
    );
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
            "Success!",
            `Transaction saved & ${formattedDeduction} allocated to "${selectedGoal.name}".`
          );

          if (onTransactionAdded) onTransactionAdded(response);
          onClose();
          return;
        } else {
          response = await addTransactionMutation.mutateAsync(payload);
        }
      }

      showSuccess(
        editMode ? "Updated!" : "Added!",
        "Transaction saved successfully."
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
        showError("Error", "Something went wrong.");
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
  };
};
