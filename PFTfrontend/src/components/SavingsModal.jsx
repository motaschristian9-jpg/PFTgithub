import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { X, Loader2, PiggyBank, Target, Check, TrendingUp } from "lucide-react";
import Swal from "sweetalert2";

export default function SavingsModal({
  isOpen,
  onClose,
  onSave,
  editMode = false,
  saving = null,
}) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      target_amount: "",
      current_amount: "0",
      description: "",
    },
    mode: "onChange",
  });

  // Watch values for the "Live Preview" card
  const watchedTarget = useWatch({ control, name: "target_amount" });
  const watchedCurrent = useWatch({ control, name: "current_amount" });
  const watchedName = useWatch({ control, name: "name" });

  // --- MEMOIZED CALCULATIONS ---

  const progressPreview = useMemo(() => {
    const target = parseFloat(watchedTarget);
    const current = parseFloat(watchedCurrent);
    if (!target || target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  }, [watchedTarget, watchedCurrent]);

  // --- EFFECTS ---

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (editMode && saving) {
        reset({
          name: saving.name || "",
          target_amount: saving.target_amount?.toString() || "",
          current_amount: saving.current_amount?.toString() || "0",
          description: saving.description || "",
        });
      } else {
        reset({
          name: "",
          target_amount: "",
          current_amount: "0",
          description: "",
        });
      }
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, editMode, saving, reset]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && isOpen && onClose();
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // --- HANDLERS ---

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        target_amount: parseFloat(data.target_amount),
        current_amount: parseFloat(data.current_amount || 0),
      };

      await onSave(payload);
      reset();

      Swal.fire({
        icon: "success",
        title: editMode ? "Goal Updated!" : "Goal Set!",
        text: `Your savings goal has been successfully ${
          editMode ? "updated" : "created"
        }.`,
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      onClose();
    } catch (error) {
      console.error("Failed to save saving:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const accentColor = "emerald";
  const bgGradient = "from-emerald-50 to-white";

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

      <div
        className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">
          {/* HEADER WITH HERO INPUT */}
          <div className={`px-6 pt-6 pb-8 bg-gradient-to-b ${bgGradient}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl bg-${accentColor}-100 text-${accentColor}-600`}
                >
                  <PiggyBank size={20} />
                </div>
                {editMode ? "Edit Goal" : "New Savings Goal"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* HERO INPUT: TARGET AMOUNT */}
            <div className="relative flex flex-col items-center justify-center mt-2">
              <label
                className={`text-xs font-semibold uppercase tracking-wider mb-1 text-${accentColor}-600/80`}
              >
                Target Goal Amount
              </label>
              <div className="flex items-baseline justify-center relative w-full">
                <span
                  className={`text-3xl font-medium text-${accentColor}-500 absolute left-[15%] sm:left-[20%] top-2`}
                >
                  $
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...register("target_amount", {
                    required: "Target amount is required",
                    min: {
                      value: 0.01,
                      message: "Target must be greater than 0",
                    },
                  })}
                  disabled={loading}
                  className="block w-full text-center text-5xl font-bold bg-transparent border-0 focus:ring-0 p-0 placeholder-gray-200 text-gray-800"
                />
              </div>
              {errors.target_amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.target_amount.message}
                </p>
              )}
            </div>
          </div>

          {/* FORM BODY */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-5"
          >
            {/* Goal Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Goal Name
              </label>
              <div className="relative">
                <Target
                  size={16}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="e.g. New MacBook, Vacation"
                  {...register("name", {
                    required: "Goal name is required",
                    maxLength: { value: 100, message: "Name too long" },
                  })}
                  disabled={loading}
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all outline-none"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            {/* Current Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Already Saved?{" "}
                <span className="text-gray-400 font-normal lowercase">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingUp size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...register("current_amount", {
                    min: { value: 0, message: "Cannot be negative" },
                    validate: (value) => {
                      const target = parseFloat(getValues("target_amount"));
                      if (target && parseFloat(value) > target) {
                        return "Cannot exceed target amount";
                      }
                      return true;
                    },
                  })}
                  disabled={loading}
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all outline-none"
                />
              </div>
              {errors.current_amount && (
                <p className="text-red-500 text-xs">
                  {errors.current_amount.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Description
              </label>
              <textarea
                rows="2"
                placeholder="What is this for?"
                {...register("description")}
                disabled={loading}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all outline-none resize-none"
              />
            </div>

            {/* LIVE PREVIEW CARD (Visual Delight) */}
            {watchedTarget &&
              watchedName &&
              !errors.current_amount &&
              !errors.target_amount && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase">
                      Preview
                    </span>
                    <span className="text-xs font-medium text-emerald-600">
                      {progressPreview.toFixed(0)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200/50 rounded-full h-2 mb-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPreview}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>{watchedName}</span>
                    <span>
                      ${parseFloat(watchedCurrent || 0).toLocaleString()} / $
                      {parseFloat(watchedTarget).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Check size={20} strokeWidth={3} />
                  {editMode ? "Update Goal" : "Start Saving"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
