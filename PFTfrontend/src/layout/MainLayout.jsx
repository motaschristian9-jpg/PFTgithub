import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
// import { useCurrency } from "../context/CurrencyContext";
import Swal from "sweetalert2";

// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #22c55e;
  }

  .custom-scrollbar {
    scrollbar-color: #d1d5db transparent;
    scrollbar-width: thin;
  }
`;

import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MainView from "./MainView";
import { LayoutDashboard, List, DollarSign, CreditCard, PieChart, Target, BarChart2, Settings } from "lucide-react";

export default function MainLayout() {
  const queryClient = useQueryClient();
  //   const { resetCurrency } = useCurrency();
  const navigate = useNavigate();

  // Inject custom scrollbar styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = scrollbarStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationsState, setNotificationsState] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Mock data for now
  const user = { name: "John Doe", email: "john@example.com" };
  const loading = false;

  // --- Handle Logout ---
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, log out!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        // resetCurrency();
        queryClient.clear();

        Swal.fire({
          icon: "success",
          title: "Logged out!",
          text: "You have been successfully logged out.",
          confirmButtonColor: "#10B981",
        }).then(() => {
          window.location.href = "/login";
        });
      }
    });
  };

  // --- Sidebar toggles ---
  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  // --- Close mobile menu on resize ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Close dropdowns when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock notifications for now
  const notifications = [
    {
      id: "1",
      message: "Welcome to MoneyTracker! 🎉",
      type: "success",
    },
  ];
  const hasUnreadMock = false;

  // --- Grouped Menu Items ---
  const menuGroups = [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          icon: <LayoutDashboard size={20} />,
          path: "/dashboard",
        },
      ],
    },
    {
      title: "Tracking",
      items: [
        {
          label: "Transactions",
          icon: <List size={20} />,
          path: "/transaction",
        },
        { label: "Income", icon: <DollarSign size={20} />, path: "/income" },
        {
          label: "Expenses",
          icon: <CreditCard size={20} />,
          path: "/expense",
        },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Budgets", icon: <PieChart size={20} />, path: "/budget" },
        { label: "Savings", icon: <Target size={20} />, path: "/saving" },
      ],
    },
    {
      title: "Insights",
      items: [
        { label: "Reports", icon: <BarChart2 size={20} />, path: "/report" },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Settings", icon: <Settings size={20} />, path: "/setting" },
      ],
    },
  ];

  // --- Loading Screen ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex items-center justify-center p-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-green-300/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/30 to-green-200/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative w-full max-w-sm">
          {/* Main card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/40 to-green-300/30 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>

          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-green-100/60">
            {/* Logo with animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-4xl font-bold">M</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                MoneyTracker
              </h2>
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Loading your dashboard
              </p>
            </div>

            {/* Loading animation - Multiple dots */}
            <div className="flex justify-center items-center gap-2 mb-8">
              <div
                className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                  style={{
                    width: "75%",
                    animation: "shimmer 2s infinite",
                  }}
                ></div>
              </div>
            </div>

            {/* Loading message */}
            <p className="text-center text-gray-500 text-xs sm:text-sm">
              Building your path to financial freedom...
            </p>
          </div>
        </div>

        <style>{`
        @keyframes shimmer {
          0%, 100% { width: 30%; opacity: 0.5; }
          50% { width: 100%; opacity: 1; }
        }
      `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-green-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/30 to-green-200/20 rounded-full blur-2xl"></div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        menuGroups={menuGroups}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        <TopBar
          toggleMobileMenu={toggleMobileMenu}
          notifications={notifications}
          hasUnread={hasUnreadMock}
          setNotificationOpen={setNotificationOpen}
          notificationOpen={notificationOpen}
          setHasUnread={setHasUnread}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          handleLogout={handleLogout}
          user={user}
        />

        <MainView />

        <Footer />
      </div>
    </div>
  );
}
