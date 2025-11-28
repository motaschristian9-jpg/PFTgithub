import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import Swal from "sweetalert2"; // <--- 1. IMPORT ADDED
import { useModalFormHooks } from "../hooks/useModalFormHooks.js";

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
  const { config, IconComponent } = useModalFormHooks("budget");

  const {
    register,
    handleSubmit,
    reset,
    setError,
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
          start_date: budget.start_date || "",
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
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, editMode, budget, reset]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!editMode) {
        data.start_date = new Date().toISOString().split("T")[0];
      }

      // Save data to backend
      await onSave(data);

      // Reset form
      reset();

      // <--- 2. SUCCESS ALERT ADDED HERE
      Swal.fire({
        icon: "success",
        title: editMode ? "Budget Updated!" : "Budget Created!",
        text: `Your budget has been successfully ${
          editMode ? "updated" : "added"
        }.`,
        timer: 2000,
        showConfirmButton: false,
        customClass: { container: "swal-z-index-fix" },
      });
    } catch (error) {
      console.error("Failed to save budget:", error);
      if (error.response && error.response.status === 422) {
        const message = error.response.data.message;
        if (message && message.toLowerCase().includes("category")) {
          setError("category_id", {
            type: "server",
            message: "You already have an active budget for this category.",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categoriesArray = categories?.data || categories || [];
  const expenseCategories = categoriesArray.filter(
    (cat) => cat.type === "expense"
  );
  const sortedCategories = [...expenseCategories].sort((a, b) => {
    if (a.name === "Other") return 1;
    if (b.name === "Other") return -1;
    return a.name.localeCompare(b.name);
  });

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center p-4"
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
                    {editMode ? "Edit Budget" : config.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editMode
                      ? "Update your budget details"
                      : "Create a new budget"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-4"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter budget name"
                {...register("name", {
                  required: "Budget name is required",
                  maxLength: {
                    value: 100,
                    message: "Name must be less than 100 characters",
                  },
                })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

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
                  disabled={loading}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register("category_id", {
                  required: "Category is required",
                })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                disabled={loading}
              >
                <option value="" disabled>
                  Select category
                </option>
                {sortedCategories.map((cat) => {
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
                      className={isDisabled ? "text-gray-400 bg-gray-50" : ""}
                    >
                      {cat.name} {isDisabled ? "(Active)" : ""}
                    </option>
                  );
                })}
              </select>
              {errors.category_id && (
                <p className="text-red-500 text-sm">
                  {errors.category_id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register("start_date")}
                  disabled={true}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("end_date", {
                    required: "End date is required",
                    validate: (value) => {
                      const startDateVal = getValues("start_date");
                      if (!startDateVal) return true;
                      const startDate = new Date(startDateVal);
                      const endDate = new Date(value);
                      if (endDate < startDate) {
                        return "End date must be after start date";
                      }
                      return true;
                    },
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold mt-4 flex justify-center items-center ${
                loading
                  ? "bg-gray-300 cursor-not-allowed opacity-60"
                  : `bg-gradient-to-r ${config.gradient} hover:opacity-90 shadow-lg hover:shadow-xl`
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  {editMode ? "Updating..." : "Creating..."}
                </>
              ) : editMode ? (
                "Update Budget"
              ) : (
                "Add Budget"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
