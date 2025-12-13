import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { showSuccess, showError } from "../utils/swal";
import { getCurrencySymbol } from "../utils/currency";
import { useTranslation } from "react-i18next";
import { useDataContext } from "../components/DataLoader";

export const useSavingsModalLogic = ({
  isOpen,
  onClose,
  onSave,
  editMode,
  saving,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { user } = useDataContext();

  const userCurrency = user?.currency || "USD";
  const currencySymbol = getCurrencySymbol
    ? getCurrencySymbol(userCurrency)
    : userCurrency;

  const {
    register,
    handleSubmit,
    reset,
    control,
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

  const watchedTarget = useWatch({ control, name: "target_amount" });
  const watchedCurrent = useWatch({ control, name: "current_amount" });
  const watchedName = useWatch({ control, name: "name" });

  const progressPreview = useMemo(() => {
    const target = parseFloat(watchedTarget);
    const current = parseFloat(watchedCurrent);
    if (!target || target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  }, [watchedTarget, watchedCurrent]);

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
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, editMode, saving, reset]);

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
      const payload = {
        ...data,
        target_amount: parseFloat(data.target_amount),
        current_amount: parseFloat(data.current_amount || 0),
      };

      await onSave(payload);
      reset();

      onClose();
    } catch (error) {
      console.error("Failed to save saving:", error);
      showError(t('app.swal.errorTitle'), t('app.swal.errorText'));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    userCurrency,
    currencySymbol,
    register,
    handleSubmit,
    errors,
    watchedTarget,
    watchedCurrent,
    watchedName,
    progressPreview,
    onSubmit,
  };
};
