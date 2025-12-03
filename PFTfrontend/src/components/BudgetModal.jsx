import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller, useWatch } from "react-hook-form";
import {
  X,
  Loader2,
  Calendar,
  Target,
  PieChart,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";

// --- REPLACED: Use custom alerts instead of direct Swal ---
import { showSuccess, showError } from "../utils/swal";

// Import Currency Utilities and DataLoader Context
import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import { useDataContext } from "../components/DataLoader.jsx";

export default function BudgetModal({
  isOpen,
  onClose,
  onSave,
  editMode = false,
  budget = null,
  categories = [],
  currentBudgets = [],
}) {
  const [loading, setLoading] = useState(false);

  // Access user for currency symbol
  const { user } = useDataContext();
  const userCurrency = user?.currency || "USD";
  const currencySymbol = getCurrencySymbol(userCurrency);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      amount: "",
      category_id: "",
      description: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
    mode: "onChange",
  });

  // Watch dates to calculate duration visually
  const startDate = useWatch({ control, name: "start_date" });
  const endDate = useWatch({ control, name: "end_date" });

  // --- MEMOIZED DATA ---

  // 1. Sort and Filter Categories (Performance)
  const sortedCategories = useMemo(() => {
    const rawCats = categories?.data || categories || [];
    return rawCats
      .filter((cat) => cat.type === "expense")
      .sort((a, b) =>
        a.name === "Other"
          ? 1
          : b.name === "Other"
          ? -1
          : a.name.localeCompare(b.name)
      );
  }, [categories]);

  // 2. Calculate Budget Duration Text
  const durationText = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Invalid duration";
    if (diffDays === 0) return "1 Day";
    return `${diffDays + 1} Days`;
  }, [startDate, endDate]);

  // --- EFFECTS ---

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const today = new Date().toISOString().split("T")[0];

      if (editMode && budget) {
        reset({
          name: budget.name || "",
          amount: budget.amount?.toString() || "",
          category_id: budget.category_id?.toString() || "",
          description: budget.description || "",
          start_date: budget.start_date || today,
          end_date: budget.end_date || "",
        });
      } else {
        reset({
          name: "",
          amount: "",
          category_id: "",
          description: "",
          start_date: today,
          end_date: "",
        });
      }
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, editMode, budget, reset]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && isOpen && onClose();
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // --- SUBMIT HANDLER ---

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!editMode) {
        data.start_date = new Date().toISOString().split("T")[0];
      }

      await onSave(data);
      reset();

      // --- UPDATED: Custom Success Alert ---
      showSuccess(
        editMode ? "Budget Updated!" : "Budget Created!",
        `Your budget has been successfully ${editMode ? "updated" : "added"}.`
      );

      onClose();
    } catch (error) {
      console.error("Failed to save budget:", error);
      if (error.response?.status === 422) {
        const message = error.response.data.message;
        if (message && message.toLowerCase().includes("category")) {
          setError("category_id", {
            type: "server",
            message: "Active budget already exists for this category.",
          });
        }
      } else {
        // --- UPDATED: Custom Error Alert ---
        showError("Error", "Failed to save budget");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Theme Constants (Blue/Indigo for Planning/Budgets)
  const accentColor = "blue";
  const bgGradient = "from-blue-50 to-white";

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
          {/* HEADER SECTION */}
          <div className={`px-6 pt-6 pb-8 bg-gradient-to-b ${bgGradient}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl bg-${accentColor}-100 text-${accentColor}-600`}
                >
                  <Target size={20} />
                </div>
                {editMode ? "Edit Budget" : "New Budget"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* HERO AMOUNT INPUT */}
            <div className="relative flex flex-col items-center justify-center mt-2">
              <label
                className={`text-xs font-semibold uppercase tracking-wider mb-1 text-${accentColor}-600/80`}
              >
                Budget Limit
              </label>
              <div className="flex items-baseline justify-center relative w-full">
                <span
                  className={`text-3xl font-medium text-${accentColor}-500 absolute left-[15%] sm:left-[20%] top-2`}
                >
                  {/* CURRENCY APPLIED */}
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 0.01, message: "Must be greater than 0" },
                  })}
                  disabled={loading}
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

          {/* FORM BODY */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-5"
          >
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Budget Name
              </label>
              <input
                type="text"
                placeholder="e.g., Monthly Groceries"
                {...register("name", {
                  required: "Name is required",
                  maxLength: { value: 100, message: "Max 100 characters" },
                })}
                disabled={loading}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PieChart size={16} className="text-gray-400" />
                </div>
                <Controller
                  name="category_id"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      disabled={loading}
                      className="block w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {sortedCategories.map((cat) => {
                        // Logic to disable categories that already have active budgets
                        const activeBudget = currentBudgets.find((b) => {
                          const idMatch = b.category_id == cat.id;
                          const budgetEnd = new Date(b.end_date);
                          budgetEnd.setHours(23, 59, 59, 999);
                          const now = new Date();
                          now.setHours(0, 0, 0, 0);
                          return idMatch && budgetEnd >= now;
                        });

                        const isDisabled =
                          activeBudget &&
                          (!editMode || activeBudget.id !== budget?.id);

                        return (
                          <option
                            key={cat.id}
                            value={cat.id}
                            disabled={isDisabled}
                            className={
                              isDisabled ? "text-gray-400 bg-gray-100" : ""
                            }
                          >
                            {cat.name} {isDisabled ? "(Active)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  )}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="h-4 w-4 border-l border-b border-gray-400 transform -rotate-45 translate-y-[-2px]" />
                </div>
              </div>
              {errors.category_id && (
                <p className="text-red-500 text-xs">
                  {errors.category_id.message}
                </p>
              )}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-3.5 text-gray-400"
                  />
                  <input
                    type="date"
                    {...register("start_date")}
                    disabled={true}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  End Date
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-3.5 text-gray-400"
                  />
                  <input
                    type="date"
                    {...register("end_date", {
                      required: "End date is required",
                      validate: (value) => {
                        const sDate = getValues("start_date");
                        if (!sDate) return true;
                        return (
                          new Date(value) > new Date(sDate) ||
                          "Must be after start date"
                        );
                      },
                    })}
                    disabled={loading}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none"
                  />
                </div>
                {errors.end_date && (
                  <p className="text-red-500 text-xs">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Duration Feedback (Visual Delight) */}
            {durationText && !errors.end_date && (
              <div className="flex items-center justify-center gap-2 text-xs text-blue-600 bg-blue-50 py-2 rounded-lg">
                <Clock size={14} />
                <span>
                  Duration:{" "}
                  <span className="font-semibold">{durationText}</span>
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-200"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Check size={20} strokeWidth={3} />
                  {editMode ? "Update Budget" : "Create Budget"}
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
