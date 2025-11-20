import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  LayoutDashboard,
  List,
  DollarSign,
  CreditCard,
  PieChart,
  Target,
  BarChart2,
  Settings,
} from "lucide-react";

export default function Sidebar({ sidebarOpen, toggleSidebar, mobileMenuOpen, toggleMobileMenu }) {
  const location = useLocation();

  // Add custom scrollbar styles
  useEffect(() => {
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

    const style = document.createElement("style");
    style.textContent = scrollbarStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Grouped Menu Items
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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-24"
        } hidden md:block sticky top-0 z-10 h-screen transition-all duration-200 ease-in-out`}
      >
        <div className="h-full bg-white/90 backdrop-blur-sm border-r border-green-100/50 shadow-xl">
          <div className="p-4">
            {/* Logo */}
            <div className="flex items-center justify-between mb-8">
              {sidebarOpen ? (
                <>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    MoneyTracker
                  </span>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600"
                  >
                    <ChevronLeft size={18} className="rotate-180" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-6 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
              {menuGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {sidebarOpen ? (
                    <>
                      <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {group.title}
                      </h3>
                      <div className="space-y-2">
                        {group.items.map((item, itemIdx) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={itemIdx}
                              to={item.path}
                              className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                                isActive
                                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                                  : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-700/90"></div>
                              )}
                              <div className="relative z-10 flex items-center space-x-3">
                                <div
                                  className={`${isActive ? "text-white" : ""}`}
                                >
                                  {item.icon}
                                </div>
                                <span
                                  className={`font-medium ${
                                    isActive ? "text-white" : ""
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center py-2">
                        <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      </div>
                      <div className="space-y-2">
                        {group.items.map((item, itemIdx) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={itemIdx}
                              to={item.path}
                              className={`group flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                                isActive
                                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                                  : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-700/90"></div>
                              )}
                              <div
                                className={`relative z-10 flex items-center ${
                                  isActive ? "text-white" : ""
                                }`}
                              >
                                {item.icon}
                              </div>
                              <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-sm border-r border-green-100/50 shadow-xl transform transition-transform duration-300 ease-in-out z-30 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Mobile Logo */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              MoneyTracker
            </span>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Mobile Navigation Groups */}
          <nav className="space-y-6 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar">
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.items.map((item, itemIdx) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        onClick={toggleMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                          isActive
                            ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                            : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-700/90"></div>
                        )}
                        <div className="relative z-10 flex items-center space-x-3">
                          <div className={`${isActive ? "text-white" : ""}`}>
                            {item.icon}
                          </div>
                          <span
                            className={`font-medium ${
                              isActive ? "text-white" : ""
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
