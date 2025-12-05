import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// --- Base Theme Configuration ---
const baseConfig = {
  buttonsStyling: false,
  heightAuto: false,
  scrollbarPadding: false,
  customClass: {
    container: "z-[10000] font-sans", // Global Z-Index Fix & Font
    popup:
      "rounded-[2rem] shadow-2xl border border-gray-100 bg-white/95 backdrop-blur-md p-0 overflow-hidden ring-1 ring-white/20",
    title: "text-2xl font-bold text-gray-900 pt-8 px-8 tracking-tight",
    htmlContainer: "text-gray-500 text-base px-8 pb-8 pt-2 m-0 leading-relaxed",
    actions: "flex gap-4 w-full px-8 pb-8 pt-2 justify-center",
    confirmButton:
      "bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 transform hover:-translate-y-0.5 text-base",
    cancelButton:
      "bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 text-base border border-gray-200",
    denyButton:
      "bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-red-200",
  },
};

// --- 1. Delete Confirmation (Red Theme) ---
export const confirmDelete = async (
  title = "Are you sure?",
  text = "This action cannot be undone."
) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    customClass: {
      ...baseConfig.customClass,
      popup:
        "rounded-[2rem] shadow-2xl border border-red-100 bg-white/95 backdrop-blur-md p-0 overflow-hidden ring-1 ring-red-50",
      icon: "border-red-100 text-red-500",
      confirmButton:
        "bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-red-200 transition-all duration-200 transform hover:-translate-y-0.5 text-base",
    },
  });
};

export const confirmAction = async ({
  title = "Are you sure?",
  text = "",
  confirmButtonText = "Yes",
  cancelButtonText = "Cancel",
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
export const showSuccess = (title = "Success", text = "") => {
  toast.success(
    <div className="flex flex-col">
      <span className="font-bold text-gray-900">{title}</span>
      {text && <span className="text-sm text-gray-500 mt-0.5">{text}</span>}
    </div>,
    {
      duration: 3000,
      style: {
        borderRadius: "16px",
        background: "#fff",
        color: "#333",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        border: "1px solid #f3f4f6",
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
export const showError = (title = "Error", text = "Something went wrong") => {
  toast.error(
    <div className="flex flex-col">
      <span className="font-bold text-gray-900">{title}</span>
      {text && <span className="text-sm text-gray-500 mt-0.5">{text}</span>}
    </div>,
    {
      duration: 4000,
      style: {
        borderRadius: "16px",
        background: "#fff",
        color: "#333",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        border: "1px solid #f3f4f6",
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
export const showInfo = (title = "Info", text = "") => {
  toast(
    <div className="flex flex-col">
      <span className="font-bold text-gray-900">{title}</span>
      {text && <span className="text-sm text-gray-500 mt-0.5">{text}</span>}
    </div>,
    {
      icon: "ℹ️",
      duration: 4000,
      style: {
        borderRadius: "16px",
        background: "#fff",
        color: "#333",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        border: "1px solid #f3f4f6",
        padding: "16px",
      },
    }
  );
};

// --- 5. Warning Alert (Toast) ---
export const showWarning = (title = "Warning", text = "") => {
  toast(
    <div className="flex flex-col">
      <span className="font-bold text-gray-900">{title}</span>
      {text && <span className="text-sm text-gray-500 mt-0.5">{text}</span>}
    </div>,
    {
      icon: "⚠️",
      duration: 4000,
      style: {
        borderRadius: "16px",
        background: "#fff",
        color: "#333",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        border: "1px solid #f3f4f6",
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
  confirmButtonText = "OK",
  showCancelButton = false,
  cancelButtonText = "Cancel",
  allowOutsideClick = true,
}) => {
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
      // Ensure confirm button has the blue theme by default unless overridden
      confirmButton: baseConfig.customClass.confirmButton,
    },
  });
};

export default MySwal;
