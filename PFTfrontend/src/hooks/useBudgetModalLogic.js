import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { showSuccess, showError } from "../utils/swal";
import { getCurrencySymbol } from "../utils/currency";
import { useDataContext } from "../components/DataLoader";

export const useBudgetModalLogic = ({
  isOpen,
  onClose,
  onSave,
  editMode,
  budget,
  categories,
}) => {
  const [loading, setLoading] = useState(false);
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

  const startDate = useWatch({ control, name: "start_date" });
  const endDate = useWatch({ control, name: "end_date" });

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

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && isOpen && onClose();
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!editMode) {
        data.start_date = new Date().toISOString().split("T")[0];
      }

      await onSave(data);
      reset();

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
        showError("Error", "Failed to save budget");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currencySymbol,
    register,
    handleSubmit,
    control,
    getValues,
    errors,
    sortedCategories,
    durationText,
    onSubmit,
  };
};
