import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller, useWatch } from "react-hook-form";
import {
  X,
  Loader2,
  Calendar,
  FileText,
  CreditCard,
  PieChart,
  TrendingUp,
  Wallet,
  Check,
} from "lucide-react";
import Swal from "sweetalert2";
import { useModalFormHooks } from "../hooks/useModalFormHooks.js";
import { useDataContext } from "./DataLoader.jsx";
import { useUpdateSaving } from "../hooks/useSavings.js";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "../hooks/useTransactions.js";

// ... (Keep TypeSwitcher and BudgetStatusCard components exactly as they were) ...
const TypeSwitcher = ({ type, setType }) => (
  <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-6 relative">
    <button
      type="button"
      onClick={() => setType("income")}
      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
        type === "income"
          ? "bg-white text-emerald-700 shadow-sm ring-1 ring-black/5"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <TrendingUp size={16} />
      Income
    </button>
    <button
      type="button"
      onClick={() => setType("expense")}
      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
        type === "expense"
          ? "bg-white text-rose-700 shadow-sm ring-1 ring-black/5"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <CreditCard size={16} />
      Expense
    </button>
  </div>
);

const BudgetStatusCard = ({ budget }) => {
  if (!budget) return null;
  const percentage = Math.min(
    (budget.spent / parseFloat(budget.amount)) * 100,
    100
  );
  const isOver = budget.remaining < 0;
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div
        className={`absolute top-0 left-0 w-1 h-full ${
          isOver ? "bg-red-500" : "bg-green-500"
        }`}
      ></div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <PieChart size={16} className="text-gray-500" />
          <span className="font-semibold text-gray-700 text-sm">
            {budget.name}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isOver ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {isOver ? "Over Budget" : "On Track"}
        </span>
      </div>
      <div className="flex justify-between items-end text-sm mb-2">
        <span className="text-gray-500">
          Spent:{" "}
          <span className="text-gray-800 font-medium">
            ${budget.spent.toLocaleString()}
          </span>
        </span>
        <span className="text-gray-500">
          Limit:{" "}
          <span className="text-gray-800 font-medium">
            ${parseFloat(budget.amount).toLocaleString()}
          </span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            percentage > 90 ? "bg-red-500" : "bg-emerald-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500">
        Remaining:{" "}
        <span
          className={`font-bold ${
            isOver ? "text-red-600" : "text-emerald-600"
          }`}
        >
          ${Math.max(budget.remaining, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const SavingsSection = ({
  register,
  saveToSavings,
  setSaveToSavings,
  savingsGoals,
  watch,
}) => {
  const selectedGoalId = watch("savingsGoalId");
  const selectedGoal = savingsGoals.find((g) => g.id == selectedGoalId);

  return (
    <div
      className={`border rounded-xl transition-all duration-300 ${
        saveToSavings
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <label className="flex items-center justify-between p-4 cursor-pointer">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              saveToSavings
                ? "bg-emerald-100 text-emerald-600"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <Wallet size={18} />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-700">
              Allocate to Savings
            </p>
            <p className="text-xs text-gray-500">Auto-transfer a portion</p>
          </div>
        </div>
        <div
          className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
            saveToSavings ? "bg-emerald-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
              saveToSavings ? "translate-x-5" : ""
            }`}
          ></div>
        </div>
        <input
          type="checkbox"
          checked={saveToSavings}
          onChange={(e) => setSaveToSavings(e.target.checked)}
          className="hidden"
        />
      </label>

      {saveToSavings && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-emerald-100/50 animate-in slide-in-from-top-2">
          <div className="mt-3">
            <label className="text-xs font-semibold text-emerald-700 uppercase">
              Select Savings Goal
            </label>
            <select
              {...register("savingsGoalId", {
                required: saveToSavings ? "Please select a goal" : false,
              })}
              className="mt-1 block w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="">Choose a goal...</option>
              {savingsGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {selectedGoal && (
              <div className="mt-2 text-xs text-emerald-800 bg-emerald-100/50 p-2 rounded">
                Current Saved:{" "}
                <span className="font-bold">
                  ${Number(selectedGoal.current_amount).toLocaleString()}
                </span>
                <span className="mx-1">/</span>
                Target:{" "}
                <span className="font-bold">
                  ${Number(selectedGoal.target_amount).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-emerald-700 uppercase">
                Fixed Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("savingsAmount")}
                placeholder="0.00"
                className="mt-1 w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-emerald-700 uppercase">
                Or Percent (%)
              </label>
              <input
                type="number"
                step="1"
                {...register("savingsPercentage")}
                placeholder="10%"
                className="mt-1 w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 italic mt-1">
            *Money will be deducted from this income and added to the selected
            goal.
          </p>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function TransactionModal({
  isOpen,
  onClose,
  onTransactionAdded,
  editMode = false,
  transactionToEdit = null,
}) {
  const {
    activeBudgetsData,
    transactionsData,
    activeSavingsData,
    categoriesData,
  } = useDataContext();

  const addTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const updateSavingMutation = useUpdateSaving();

  const [type, setType] = useState("income");
  const [loading, setLoading] = useState(false);
  const [saveToSavings, setSaveToSavings] = useState(false);

  const todayString = useMemo(() => new Date().toISOString().split("T")[0], []);

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

  // Helper to find a transfer category for the automated savings transaction
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

      // --- SAVINGS SPLIT LOGIC ---
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

      // 1. Calculate the Income Amount (Remaining after savings)
      const finalIncomeAmount = totalInputAmount - savingsDeduction;

      // 2. Prepare Main Payload
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
        response = await addTransactionMutation.mutateAsync(payload);

        // --- HANDLE SAVINGS IF APPLICABLE ---
        if (
          type === "income" &&
          saveToSavings &&
          savingsDeduction > 0 &&
          selectedGoal
        ) {
          // A. Update the Savings Goal Balance
          const goalPayload = {
            name: selectedGoal.name,
            target_amount: parseFloat(selectedGoal.target_amount),
            current_amount:
              parseFloat(selectedGoal.current_amount || 0) + savingsDeduction,
            description: selectedGoal.description,
          };

          await updateSavingMutation.mutateAsync({
            id: selectedGoal.id,
            data: goalPayload,
          });

          // B. Create the History Record (Expense/Transfer Transaction)
          // This is critical for the SavingsCardModal to show history
          const transferCategoryId = findTransferCategory();

          await addTransactionMutation.mutateAsync({
            name: `Transfer to ${selectedGoal.name}`,
            type: "expense", // It's an expense from your 'wallet'
            amount: savingsDeduction,
            description: `Auto-allocation from ${data.name}`,
            date: data.transaction_date,
            category_id: transferCategoryId,
            saving_goal_id: selectedGoal.id, // Links it to the goal history
          });

          Swal.fire({
            icon: "success",
            title: "Success!",
            text: `Transaction saved & $${savingsDeduction.toLocaleString()} allocated to "${
              selectedGoal.name
            }".`,
            timer: 2500,
            showConfirmButton: false,
          });

          if (onTransactionAdded) onTransactionAdded(response);
          onClose();
          return;
        }
      }

      Swal.fire({
        icon: "success",
        title: editMode ? "Updated!" : "Added!",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });

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
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const accentColor = type === "income" ? "emerald" : "rose";
  const AccentIcon = type === "income" ? TrendingUp : CreditCard;

  return createPortal(
    <div
      className="fixed inset-0 z-[50] flex justify-center items-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

      <div
        className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">
          <div
            className={`px-6 pt-6 pb-8 bg-gradient-to-b ${
              type === "income"
                ? "from-emerald-50 to-white"
                : "from-rose-50 to-white"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl bg-${accentColor}-100 text-${accentColor}-600`}
                >
                  <AccentIcon size={20} />
                </div>
                {editMode ? "Edit Transaction" : "New Transaction"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <TypeSwitcher type={type} setType={setType} />

            <div className="relative flex flex-col items-center justify-center">
              <label
                className={`text-xs font-semibold uppercase tracking-wider mb-1 text-${accentColor}-600/80`}
              >
                Enter Amount
              </label>
              <div className="flex items-baseline justify-center relative w-full">
                <span
                  className={`text-3xl font-medium text-${accentColor}-500 absolute left-[15%] sm:left-[20%] top-2`}
                >
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount", {
                    required: "Required",
                    min: { value: 0.01, message: "> 0" },
                  })}
                  className="block w-full text-center text-5xl font-bold bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-200 text-gray-800"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-3.5 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    max={todayString}
                    {...register("transaction_date", {
                      required: "Required",
                      validate: (value) => {
                        if (budgetStatus) {
                          const d = new Date(value);
                          d.setHours(0, 0, 0, 0);
                          const start = new Date(budgetStatus.start_date);
                          start.setHours(0, 0, 0, 0);
                          return d >= start || "Date before budget start";
                        }
                        return true;
                      },
                    })}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                {errors.transaction_date && (
                  <p className="text-red-500 text-xs">
                    {errors.transaction_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Category
                </label>
                <div className="relative">
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: "Required" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          trigger("transaction_date");
                        }}
                        className="block w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {sortedCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="h-4 w-4 border-l border-b border-gray-400 transform -rotate-45 translate-y-[-2px]" />
                  </div>
                </div>
                {errors.category && (
                  <p className="text-red-500 text-xs">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Name
              </label>
              <input
                type="text"
                placeholder="What is this for?"
                {...register("name", { required: "Name is required" })}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="relative">
              <FileText
                size={16}
                className="absolute left-4 top-3.5 text-gray-400"
              />
              <textarea
                placeholder="Add a note (optional)"
                rows={2}
                {...register("description")}
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
              />
            </div>

            <BudgetStatusCard budget={budgetStatus} />

            {type === "income" && (
              <SavingsSection
                register={register}
                saveToSavings={saveToSavings}
                setSaveToSavings={setSaveToSavings}
                savingsGoals={savingsGoals}
                watch={watch}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : type === "income"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-200"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Check size={20} strokeWidth={3} />
                  {editMode ? "Save Changes" : "Add Transaction"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
