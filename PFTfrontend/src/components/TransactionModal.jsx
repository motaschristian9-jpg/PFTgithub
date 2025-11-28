import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Loader2,
  Calendar,
  FileText,
  DollarSign,
  CreditCard,
  PieChart,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";
import { useModalFormHooks } from "../hooks/useModalFormHooks.js";
import { useDataContext } from "./DataLoader.jsx";
import {
  fetchSavings,
  updateSaving,
  updateTransaction,
} from "../api/transactions.js";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "../hooks/useTransactions.js";

export default function TransactionModal({
  isOpen,
  onClose,
  onTransactionAdded,
  editMode = false,
  transactionToEdit = null,
}) {
  const { activeBudgetsData, transactionsData } = useDataContext();
  const [type, setType] = useState("income");
  const [loading, setLoading] = useState(false);
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [saveToSavings, setSaveToSavings] = useState(false);
  const [selectedSavingsGoal, setSelectedSavingsGoal] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");
  const [savingsPercentage, setSavingsPercentage] = useState("");
  const [linkedBudget, setLinkedBudget] = useState(null);
  const [savingsGoals, setSavingsGoals] = useState([]);

  console.log(linkedBudget);

  const addTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    key: modalKey,
    defaultValues: {
      name: "",
      category: "",
      amount: "",
      transaction_date: new Date().toISOString().split("T")[0],
      description: "",
    },
    mode: "onChange",
  });

  const { config, IconComponent, expenseCategories, incomeCategories } =
    useModalFormHooks(type);

  console.log(transactionsData);

  // --- HELPERS ---
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
    return relevantTransactions.reduce(
      (total, t) => total + parseFloat(t.amount || 0),
      0
    );
  };

  // --- UPDATED LINK BUDGET FUNCTION ---
  const linkBudget = (categoryId) => {

    if (type === "expense") {
      // Find active budget
      const budget = activeBudgetsData.data?.find((b) => {
        return b.category_id == categoryId;
      });

      if (budget) {
        const spent = budgetSpent(budget);

        setLinkedBudget({
          ...budget,
          spent,
          remaining: parseFloat(budget.amount) - spent,
        });
      } else {
        setLinkedBudget(null);
      }
    } else {
      setLinkedBudget(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setModalKey((prev) => prev + 1);
      setSaveToSavings(false);
      setSelectedSavingsGoal("");
      setSavingsAmount("");
      setSavingsPercentage("");
      setLinkedBudget(null);
      document.body.style.overflow = "hidden";

      if (editMode && transactionToEdit) {
        setType(transactionToEdit.type);
        reset({
          name: transactionToEdit.name,
          category: transactionToEdit.category_id?.toString() || "",
          amount: transactionToEdit.amount.toString(),
          transaction_date: transactionToEdit.date,
          description: transactionToEdit.description || "",
        });
        if (transactionToEdit.category_id) {
          linkBudget(transactionToEdit.category_id.toString());
        }
      } else {
        setType("income");
        reset({
          name: "",
          category: "",
          amount: "",
          transaction_date: new Date().toISOString().split("T")[0],
          description: "",
        });
      }

      const loadData = async () => {
        setLoadingSavings(true);
        try {
          const savingsResponse = await fetchSavings();
          setSavingsGoals(savingsResponse.data || []);
        } catch (error) {
          console.error("Error fetching savings:", error);
        } finally {
          setLoadingSavings(false);
        }
      };
      loadData();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, editMode, transactionToEdit, reset]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const onSubmit = async (data) => {
    setLoading(true);
    let response;

    try {
      // 1. Determine Budget ID to send (Strict Linking)
      let budgetIdToSend = null;

      if (type === "expense" && data.category) {
        const activeBudget = activeBudgetsData?.data?.find(
          (b) => b.category_id == data.category
        );

        // Only link if date fits strictly within budget range
        if (activeBudget) {
          const txDate = new Date(data.transaction_date);
          const start = new Date(activeBudget.start_date);
          const end = new Date(activeBudget.end_date);
          // Normalize time
          txDate.setHours(0, 0, 0, 0);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          if (txDate >= start && txDate <= end) {
            budgetIdToSend = activeBudget.id;
          }
        }
      }

      const transactionData = {
        name: data.name,
        type,
        amount: parseFloat(data.amount),
        description: data.description || null,
        date: data.transaction_date,
        category_id: data.category ? parseInt(data.category) : null,
        budget_id: budgetIdToSend, // <--- CRITICAL: Sending the specific ID
      };

      if (editMode && transactionToEdit) {
        response = await updateTransactionMutation.mutateAsync({
          id: transactionToEdit.id,
          data: transactionData,
        });
      } else {
        response = await addTransactionMutation.mutateAsync(transactionData);

        if (type === "income" && saveToSavings && selectedSavingsGoal) {
          const savingsGoal = savingsGoals.find(
            (goal) => goal.name === selectedSavingsGoal
          );
          if (savingsGoal) {
            const savingsAmountValue = savingsAmount
              ? parseFloat(savingsAmount)
              : parseFloat(data.amount) * (parseFloat(savingsPercentage) / 100);
            await updateSaving(savingsGoal.id, {
              current_amount: savingsGoal.current_amount + savingsAmountValue,
            });
          }
        }
      }

      await Swal.fire({
        icon: "success",
        title: editMode ? "Transaction Updated!" : "Transaction Added!",
        text: editMode
          ? "Your transaction has been successfully updated."
          : "Your transaction has been successfully recorded.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      if (onTransactionAdded) {
        onTransactionAdded(response);
      }

      reset();
      onClose();
    } catch (error) {
      console.error("Error submitting transaction:", error);

      if (error.response && error.response.status === 422) {
        const serverErrors = error.response.data.errors;
        if (serverErrors) {
          Object.keys(serverErrors).forEach((key) => {
            let fieldName = key;
            if (key === "category_id") fieldName = "category";
            if (key === "date") fieldName = "transaction_date";
            setError(fieldName, {
              type: "server",
              message: serverErrors[key][0],
            });
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: error.response.data.message || "Please check your inputs.",
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 75) return "bg-orange-500";
    return "bg-emerald-500";
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[10] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`absolute -inset-1 bg-gradient-to-r ${config.bgGradient} rounded-2xl blur opacity-40`}
        ></div>

        <div
          className={`relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border ${config.borderColor} overflow-hidden`}
        >
          <div
            className={`p-4 sm:p-6 border-b border-gray-100/50 bg-gradient-to-r ${config.bgGradient}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <IconComponent className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {editMode ? "Edit Transaction" : config.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editMode
                      ? "Update your transaction details"
                      : `Record your ${type} transaction`}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Transaction Type <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      type === "income"
                        ? "bg-green-100 text-green-800 border-2 border-green-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <DollarSign size={18} />
                      <span>Income</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      type === "expense"
                        ? "bg-red-100 text-red-800 border-2 border-red-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard size={18} />
                      <span>Expense</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter transaction name"
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          linkBudget(e.target.value);
                          trigger("transaction_date");
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        {(type === "income"
                          ? incomeCategories
                          : expenseCategories
                        )
                          .sort((a, b) => {
                            if (a.name === "Other") return 1;
                            if (b.name === "Other") return -1;
                            return a.name.localeCompare(b.name);
                          })
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    )}
                  />
                </div>
                {errors.category && (
                  <p className="text-red-500 text-sm">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {type === "expense" && linkedBudget && (
                <div className="mt-2 p-4 bg-white/60 border border-gray-200 rounded-xl shadow-sm backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <PieChart size={16} className="text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {linkedBudget.name} Budget
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} />
                      <span className="text-xs font-medium">Active</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>
                        {linkedBudget.start_date
                          ? new Date(linkedBudget.start_date).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <span>to</span>
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>
                        {linkedBudget.end_date
                          ? new Date(linkedBudget.end_date).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Allocated:</span>
                      <span className="font-semibold text-green-600">
                        ${parseFloat(linkedBudget.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Spent:</span>
                      <span className="font-semibold text-red-600">
                        ${linkedBudget.spent.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className={`font-semibold ${
                        linkedBudget.remaining < 0 ? "text-red-600" : "text-orange-600"
                      }`}>
                        ${Math.max(linkedBudget.remaining, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-medium text-gray-700">
                        {((linkedBudget.spent / parseFloat(linkedBudget.amount)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (linkedBudget.spent / parseFloat(linkedBudget.amount)) * 100 > 90
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (linkedBudget.spent / parseFloat(linkedBudget.amount)) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {linkedBudget.remaining < 0 && (
                    <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                      <AlertCircle size={14} />
                      <span className="text-xs font-medium">This transaction will exceed your budget limit</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    {...register("amount", {
                      required: "Amount is required",
                      min: {
                        value: 0.01,
                        message: "Amount must be greater than 0",
                      },
                    })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    {...register("transaction_date", {
                      required: "Date is required",
                      validate: (value) => {
                        if (type !== "expense") return true;
                        const categoryId = getValues("category");
                        if (!categoryId) return true;

                        const budget = activeBudgetsData?.data?.find(
                          (b) =>
                            b.category_id == categoryId
                        );

                        if (budget) {
                          const txDate = new Date(value);
                          txDate.setHours(0, 0, 0, 0);
                          const budgetStart = new Date(budget.start_date);
                          budgetStart.setHours(0, 0, 0, 0);

                          if (txDate < budgetStart) {
                            return `Date must be after budget start (${new Date(
                              budget.start_date
                            ).toLocaleDateString()})`;
                          }
                        }
                        return true;
                      },
                    })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
                  />
                </div>
                {errors.transaction_date && (
                  <p className="text-red-500 text-sm">
                    {errors.transaction_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <textarea
                    placeholder="Add a note (optional)"
                    rows={3}
                    {...register("description")}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {type === "income" && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={saveToSavings}
                      onChange={(e) => setSaveToSavings(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Save part of this income
                    </span>
                  </label>
                  {saveToSavings && (
                    <div className="space-y-3 pl-6 border-l-2 border-green-200">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Savings Goal
                        </label>
                        <select
                          value={selectedSavingsGoal}
                          onChange={(e) =>
                            setSelectedSavingsGoal(e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                        >
                          <option value="">Select goal</option>
                          {savingsGoals.map((goal) => (
                            <option key={goal.id} value={goal.name}>
                              {goal.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Savings Amount
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={savingsAmount}
                          onChange={(e) => setSavingsAmount(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Percentage (%)
                        </label>
                        <input
                          type="number"
                          placeholder="10"
                          value={savingsPercentage}
                          onChange={(e) => setSavingsPercentage(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold mt-4 transition-all duration-200 cursor-pointer ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed opacity-60"
                    : `bg-gradient-to-r ${config.gradient} hover:opacity-90 shadow-lg hover:shadow-xl`
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : editMode ? (
                  "Update Transaction"
                ) : (
                  "Add Transaction"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
