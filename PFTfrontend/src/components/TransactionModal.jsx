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
  const { budgetsData, transactionsData } = useDataContext();
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

  const addTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isValid },
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

  // --- UPDATED LINK BUDGET FUNCTION ---
  const linkBudget = (categoryId) => {
    if (type === "expense") {
      const selectedCategory = expenseCategories.find(
        (cat) => cat.id == categoryId
      );
      const categoryName = selectedCategory ? selectedCategory.name : "";

      if (categoryId || categoryName) {
        const budget = budgetsData.data?.find((b) => {
          const matchesCategoryId = b.category_id == categoryId;
          const matchesName =
            b.name &&
            categoryName &&
            b.name.toLowerCase().trim() === categoryName.toLowerCase().trim();
          const isActive = b.status ? b.status === "active" : true;
          return (matchesCategoryId || matchesName) && isActive;
        });

        if (budget) {
          // Calculate spent amount from all transactions for this category (expense type)
          const spent = transactionsData.data
            ? transactionsData.data
                .filter(transaction => transaction.category_id == categoryId && transaction.type === 'expense')
                .reduce((total, transaction) => total + parseFloat(transaction.amount), 0)
            : 0;
          const remaining = parseFloat(budget.amount) - spent;

          setLinkedBudget({
            ...budget,
            spent: spent,
            remaining: remaining,
          });
        } else {
          setLinkedBudget(null);
        }
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
      const transactionData = {
        name: data.name,
        type,
        amount: parseFloat(data.amount),
        description: data.description || null,
        date: data.transaction_date,
        category_id: data.category ? parseInt(data.category) : null,
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
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine progress bar color
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
              {/* Transaction Type Selection */}
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

              {/* Name */}
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

              {/* Category */}
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

              {/* === REDESIGNED LINKED BUDGET SECTION === */}
              {type === "expense" && linkedBudget && (
                <div className="mt-2 p-4 bg-white/60 border border-gray-200 rounded-xl shadow-sm backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <PieChart size={16} className="text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {linkedBudget.name} Budget
                      </span>
                    </div>
                    {linkedBudget.remaining < 0 ? (
                      <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        <AlertCircle size={12} />
                        <span className="text-xs font-medium">Over Budget</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        <span className="text-xs font-medium">On Track</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="flex flex-col p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        Allocated
                      </span>
                      <span className="font-semibold text-gray-700">
                        ${parseFloat(linkedBudget.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        Spent
                      </span>
                      <span className="font-semibold text-gray-700">
                        ${linkedBudget.spent.toFixed(2)}
                      </span>
                    </div>
                    <div
                      className={`flex flex-col p-2 rounded-lg border ${
                        linkedBudget.remaining < 0
                          ? "bg-red-50 border-red-100"
                          : "bg-emerald-50 border-emerald-100"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        Remaining
                      </span>
                      <span
                        className={`font-bold ${
                          linkedBudget.remaining < 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        ${Math.abs(linkedBudget.remaining).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Usage</span>
                      <span className="font-medium">
                        {(
                          (linkedBudget.spent /
                            parseFloat(linkedBudget.amount)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(
                          (linkedBudget.spent /
                            parseFloat(linkedBudget.amount)) *
                            100
                        )}`}
                        style={{
                          width: `${Math.min(
                            (linkedBudget.spent /
                              parseFloat(linkedBudget.amount)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount */}
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

              {/* Date */}
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

              {/* Description */}
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

              {/* Savings Option for Income */}
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

              {/* Submit Button */}
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