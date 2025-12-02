import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// --- Base Theme Configuration ---
const baseConfig = {
  buttonsStyling: false,
  customClass: {
    container: "z-[10000]", // Global Z-Index Fix
    popup:
      "rounded-2xl shadow-2xl border border-gray-100 bg-white/95 backdrop-blur-sm p-0 overflow-hidden",
    title: "text-xl font-bold text-gray-800 pt-8 px-6",
    htmlContainer: "text-gray-500 text-sm px-6 pb-6 m-0",
    actions: "flex gap-3 w-full px-6 pb-8 pt-2 justify-end",
    confirmButton:
      "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg hover:shadow-green-500/20 transition-all duration-200 transform hover:-translate-y-0.5",
    cancelButton:
      "bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2.5 px-6 rounded-xl transition-all duration-200",
    denyButton:
      "bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-6 rounded-xl",
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
      confirmButton:
        "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg hover:shadow-red-500/20 transition-all duration-200 transform hover:-translate-y-0.5",
    },
  });
};

// --- 2. Success Alert (Green Theme) ---
// Standard modal used for success messages
export const showSuccess = (title = "Success", text = "") => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: "success",
    confirmButtonText: "Okay",
    timer: 2000, // Auto-close after 2 seconds
    timerProgressBar: true,
  });
};

// --- 3. Error Alert ---
export const showError = (title = "Error", text = "Something went wrong") => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: "error",
    confirmButtonText: "Close",
  });
};

export default MySwal;
