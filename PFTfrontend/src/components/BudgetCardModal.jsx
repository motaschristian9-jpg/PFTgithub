import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import {
  Edit,
  X,
  Calendar,
  DollarSign,
  TrendingDown,
  Trash2,
  Loader2,
} from "lucide-react";

export default function BudgetCardModal({
  isOpen,
  budget,
  transactions = [],
  onClose,
  onEditBudget,
  onDeleteTransaction,
  onDeleteBudget,
  getCategoryName,
}) {
  const [localBudget, setLocalBudget] = useState(budget || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Determine Read-Only Status
  // If status is NOT 'active' (e.g., 'completed', 'expired', 'reached'), it is read-only.
  const isReadOnly = localBudget.status !== "active";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      description: "",
      start_date: "",
      end_date: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && budget) {
      setLocalBudget(budget);
      reset({
        amount: budget.amount?.toString() || "",
        description: budget.description || "",
        start_date: budget.start_date || "",
        end_date: budget.end_date || "",
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, budget, reset]);

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

  // --- ACTIONS ---

  const handleSaveChanges = async (data) => {
    setIsSaving(true);
    try {
      await onEditBudget({
        ...localBudget,
        amount: parseFloat(data.amount),
        description: data.description || "",
        start_date: data.start_date,
        end_date: data.end_date,
      });

      Swal.fire({
        icon: "success",
        title: "Budget Updated",
        text: "Your changes have been saved successfully.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { container: "swal-z-index-fix" },
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating budget", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Transaction Delete Confirmation
  const handleDeleteTx = (tx) => {
    Swal.fire({
      title: "Delete Transaction?",
      text: "This will remove the expense from this budget calculation.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: { container: "swal-z-index-fix" },
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteTransaction(tx);
      }
    });
  };

  // --- CALCULATIONS ---

  const remaining =
    Number(localBudget.amount || 0) - Number(localBudget.spent || 0);

  const percentage = localBudget.amount
    ? Math.min(
        (Number(localBudget.spent) / Number(localBudget.amount)) * 100,
        100
      )
    : 0;

  if (!isOpen) return null;

  const budgetCardModalContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center p-4"
      onClick={onClose}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Modal Container */}
      <div
        className="relative z-50 w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glassmorphism Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>

        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-100/50 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="text-white" size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      {getCategoryName
                        ? getCategoryName(localBudget.category_id)
                        : localBudget.category}
                    </h2>
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase tracking-wide
                      ${
                        localBudget.status === "active"
                          ? "bg-green-100 text-green-700"
                          : localBudget.status === "reached"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {localBudget.status}
                    </span>
                  </div>
                  {!isEditing && (
                    <p className="text-sm text-gray-600 mt-1">
                      {localBudget.description || "No description"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* 3. CONDITIONAL RENDERING: Hide buttons if Read Only */}
                {!isReadOnly && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isSaving}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      isSaving
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    <Edit size={16} />
                    <span className="hidden sm:inline">
                      {isEditing ? "Cancel" : "Edit"}
                    </span>
                  </button>
                )}

                {!isReadOnly && (
                  <button
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    onClick={() => onDeleteBudget(localBudget)}
                    disabled={isSaving}
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  disabled={isSaving}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col xl:flex-row overflow-y-auto max-h-[70vh]">
            {/* Left Panel: Budget Details */}
            <div className="flex-1 p-4 sm:p-6 xl:border-r border-gray-100/50">
              {/* Budget Progress */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <TrendingDown size={18} />
                      <span>Budget Overview</span>
                    </h3>

                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              percentage >= 90
                                ? "bg-red-500"
                                : percentage >= 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Budget Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-green-600 font-medium mb-1">
                            Allocated
                          </p>
                          <p className="text-lg font-bold text-green-700">
                            ${Number(localBudget.amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-red-600 font-medium mb-1">
                            Spent
                          </p>
                          <p className="text-lg font-bold text-red-700">
                            ${Number(localBudget.spent || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-orange-600 font-medium mb-1">
                            Remaining
                          </p>
                          <p className="text-lg font-bold text-orange-700">
                            ${remaining.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Mode */}
              {isEditing && !isReadOnly && (
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-200/30 to-orange-300/20 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100/50 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Edit Budget
                    </h3>

                    <form onSubmit={handleSubmit(handleSaveChanges)}>
                      <div className="space-y-4">
                        {/* Allocated Amount */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Allocated Amount{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            {...register("amount", { required: true, min: 0 })}
                            min="0"
                            step="0.01"
                            disabled={isSaving}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Enter allocated amount"
                          />
                          {errors.amount && (
                            <p className="text-red-500 text-sm">
                              {errors.amount.type === "required" &&
                                "Allocated amount is required"}
                              {errors.amount.type === "min" &&
                                "Amount must be greater than 0"}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            {...register("description")}
                            disabled={isSaving}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Enter description"
                          />
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Start Date
                            </label>
                            <input
                              type="date"
                              {...register("start_date")}
                              disabled
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              {...register("end_date", {
                                required: true,
                                validate: (value, formValues) => {
                                  if (
                                    formValues.start_date &&
                                    new Date(value) <
                                      new Date(formValues.start_date)
                                  ) {
                                    return "End date cannot be before start date";
                                  }
                                  return true;
                                },
                              })}
                              disabled={isSaving}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            {errors.end_date && (
                              <p className="text-red-500 text-sm">
                                {errors.end_date.type === "required" &&
                                  "End date is required"}
                                {errors.end_date.type === "validate" &&
                                  errors.end_date.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Save Button */}
                        <button
                          type="submit"
                          disabled={isSaving}
                          className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 
                            ${
                              isSaving
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg text-white"
                            }`}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="animate-spin" size={20} />
                              <span className="text-white">Saving...</span>
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Transaction History */}
            <div className="flex-1 p-4 sm:p-6 bg-gray-50/30">
              <div className="relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-xl blur opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100/50 p-4 sm:p-6 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>Transaction History</span>
                  </h3>

                  <div className="flex-1 overflow-y-auto">
                    {transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No transactions yet
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Transactions will appear here when you add expenses
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.map((tx, index) => (
                          <div
                            key={tx.id ?? index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <TrendingDown
                                  size={14}
                                  className="text-red-600"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {tx.amount
                                    ? Number(tx.amount).toLocaleString()
                                    : "-"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {tx.transaction_date || tx.created_at
                                    ? new Date(
                                        tx.transaction_date || tx.created_at
                                      ).toLocaleDateString()
                                    : "-"}
                                </p>
                              </div>
                            </div>

                            {/* 4. HIDE DELETE TRANSACTION IF READ ONLY */}
                            {!isReadOnly && (
                              <button
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                onClick={() => handleDeleteTx(tx)}
                                disabled={isSaving}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(budgetCardModalContent, document.body);
}
