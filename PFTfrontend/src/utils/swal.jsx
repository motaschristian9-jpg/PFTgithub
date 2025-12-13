import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import i18n from "../i18n";

const MySwal = withReactContent(Swal);

// --- Base Theme Configuration ---
export const baseConfig = {
  buttonsStyling: false,
  heightAuto: false,
  scrollbarPadding: false,
  customClass: {
    container: "z-[10000] font-sans", // Global Z-Index Fix & Font
    popup:
      "rounded-[2rem] shadow-2xl border border-gray-100 !bg-white dark:!bg-gray-800/95 dark:border-gray-700 backdrop-blur-md p-0 overflow-hidden ring-1 ring-white/20 dark:ring-white/5",
    title: "text-2xl font-bold text-gray-900 dark:!text-gray-100 pt-8 px-8 tracking-tight",
    htmlContainer: "text-gray-500 dark:!text-gray-300 text-base px-8 pb-8 pt-2 m-0 leading-relaxed",
    actions: "flex gap-4 w-full px-8 pb-8 pt-2 justify-center",
    confirmButton:
      "bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 transform hover:-translate-y-0.5 text-base",
    cancelButton:
      "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 text-gray-600 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 text-base border border-gray-200 dark:border-gray-600",
    denyButton:
      "bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-red-200",
  },
};

// --- 1. Delete Confirmation (Red Theme) ---
export const confirmDelete = async (
  title = i18n.t('app.swal.confirmTitle'),
  text = i18n.t('app.swal.confirmText'),
  confirmButtonText = i18n.t('app.swal.confirmBtn'),
  cancelButtonText = i18n.t('app.swal.cancelBtn')
) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      ...baseConfig.customClass,
      popup:
        "rounded-[2rem] shadow-2xl border border-red-100 dark:border-red-900/50 !bg-white dark:!bg-gray-900/95 backdrop-blur-md p-0 overflow-hidden ring-1 ring-red-50 dark:ring-red-900/20",
      icon: "border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400",
      confirmButton:
        "bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all duration-200 transform hover:-translate-y-0.5 text-base",
    },
  });
};

export const confirmAction = async ({
  title = i18n.t('app.swal.confirmTitle'),
  text = "",
  confirmButtonText = i18n.t('app.swal.yesBtn'),
  cancelButtonText = i18n.t('app.swal.cancelBtn'),
  icon = "question",
  confirmButtonColorClass = "bg-blue-600 hover:bg-blue-500",
}) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      ...baseConfig.customClass,
      confirmButton: `${confirmButtonColorClass} text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 text-base`,
    },
  });
};

import toast from "react-hot-toast";

// --- 2. Success Alert (Toast) ---
// --- 0. Helper for Theme ---
const getThemeStyles = () => {
    const isDark = document.documentElement.classList.contains("dark");
    return {
        background: isDark ? "#1f2937" : "#fff", // gray-800 : white
        color: isDark ? "#f3f4f6" : "#333",       // gray-100 : gray-900
        border: isDark ? "1px solid #374151" : "1px solid #f3f4f6", // gray-700 : gray-100
    };
};

const getTitleClass = () => {
     const isDark = document.documentElement.classList.contains("dark");
     return isDark ? "font-bold text-gray-100" : "font-bold text-gray-900";
}

const getTextClass = () => {
     const isDark = document.documentElement.classList.contains("dark");
     return isDark ? "text-sm text-gray-400 mt-0.5" : "text-sm text-gray-500 mt-0.5";
}


// --- 2. Success Alert (Toast) ---
export const showSuccess = (title = i18n.t('app.swal.successTitle'), text = "") => {
  const styles = getThemeStyles();
  toast.success(
    <div className="flex flex-col">
      <span className={getTitleClass()}>{title}</span>
      {text && <span className={getTextClass()}>{text}</span>}
    </div>,
    {
      duration: 3000,
      style: {
        borderRadius: "16px",
        background: styles.background,
        color: styles.color,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        border: styles.border,
        padding: "16px",
      },
      iconTheme: {
        primary: "#10b981",
        secondary: "#fff",
      },
    }
  );
};

// --- 3. Error Alert (Toast) ---
export const showError = (title = i18n.t('app.swal.errorTitle'), text = i18n.t('app.swal.errorText')) => {
  const styles = getThemeStyles();
  toast.error(
    <div className="flex flex-col">
      <span className={getTitleClass()}>{title}</span>
      {text && <span className={getTextClass()}>{text}</span>}
    </div>,
    {
      duration: 4000,
      style: {
        borderRadius: "16px",
        background: styles.background,
        color: styles.color,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        border: styles.border,
        padding: "16px",
      },
      iconTheme: {
        primary: "#ef4444",
        secondary: "#fff",
      },
    }
  );
};

// --- 4. Info Alert (Toast) ---
export const showInfo = (title = i18n.t('app.swal.infoTitle'), text = "") => {
  const styles = getThemeStyles();
  toast(
    <div className="flex flex-col">
      <span className={getTitleClass()}>{title}</span>
      {text && <span className={getTextClass()}>{text}</span>}
    </div>,
    {
      icon: "ℹ️",
      duration: 4000,
      style: {
        borderRadius: "16px",
        background: styles.background,
        color: styles.color,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        border: styles.border,
        padding: "16px",
      },
    }
  );
};

// --- 5. Warning Alert (Toast) ---
export const showWarning = (title = i18n.t('app.swal.warningTitle'), text = "") => {
  const styles = getThemeStyles();
  toast(
    <div className="flex flex-col">
      <span className={getTitleClass()}>{title}</span>
      {text && <span className={getTextClass()}>{text}</span>}
    </div>,
    {
      icon: "⚠️",
      duration: 4000,
      style: {
        borderRadius: "16px",
        background: styles.background,
        color: styles.color,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        border: styles.border,
        padding: "16px",
      },
    }
  );
};

// --- 6. Custom Alert (Generic) ---
export const showCustomAlert = async ({
  title,
  text,
  icon = "info",
  confirmButtonText = i18n.t('app.swal.okBtn'),
  showCancelButton = false,
  cancelButtonText = i18n.t('app.swal.cancelBtn'),
  allowOutsideClick = true,
  // Add support for dark mode in standard Swal popups
  customClass = {}, 
}) => {
  // We can also add dynamic classes here if needed, but standard Swal customClass handles it well
  // if we updated baseConfig. Let's rely on baseConfig update below for Popups.
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon,
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    allowOutsideClick,
    customClass: {
      ...baseConfig.customClass,
      confirmButton: baseConfig.customClass.confirmButton,
      ...customClass
    },
  });
};

export default MySwal;
