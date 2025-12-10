import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  LayoutDashboard,
  List,
  PieChart,
  Target,
  BarChart2,
  Settings,
} from "lucide-react";
import { Logo, LogoIcon } from "../components/Logo";

export default function Sidebar({ sidebarOpen, toggleSidebar, mobileMenuOpen, toggleMobileMenu }) {
  const location = useLocation();

  // Add custom scrollbar styles
  useEffect(() => {
    const scrollbarStyles = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 5px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #d1d5db;
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
          sidebarOpen ? "w-72" : "w-20"
        } hidden md:block sticky top-0 z-20 h-screen transition-all duration-300 ease-in-out`}
      >
        <div className="h-full bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] relative">
          
          {/* Floating Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-8 bg-white border border-gray-100 shadow-md p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all z-50 flex items-center justify-center group"
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${!sidebarOpen && "rotate-180"}`} />
          </button>

          {/* Header */}
          <div className={`flex items-center h-20 px-6 ${sidebarOpen ? "justify-start" : "justify-center"}`}>
            {sidebarOpen ? (
              <Logo className="animate-in fade-in duration-300" />
            ) : (
              <LogoIcon size={32} className="animate-in fade-in duration-300" />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 space-y-8">
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                {sidebarOpen && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider animate-in fade-in duration-300">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item, itemIdx) => {
                    const isActive = location.pathname === item.path;
                    
                    // Helper to get theme colors based on path
                    const getThemeColors = (path) => {
                      if (path.includes("/budget")) return {
                        activeBg: "bg-violet-50",
                        activeText: "text-violet-700",
                        activeIcon: "text-violet-600",
                        hoverBg: "hover:bg-violet-50",
                        hoverText: "hover:text-violet-700"
                      };
                      if (path.includes("/saving")) return {
                        activeBg: "bg-teal-50",
                        activeText: "text-teal-700",
                        activeIcon: "text-teal-600",
                        hoverBg: "hover:bg-teal-50",
                        hoverText: "hover:text-teal-700"
                      };
                      if (path.includes("/report")) return {
                        activeBg: "bg-indigo-50",
                        activeText: "text-indigo-700",
                        activeIcon: "text-indigo-600",
                        hoverBg: "hover:bg-indigo-50",
                        hoverText: "hover:text-indigo-700"
                      };
                      if (path.includes("/setting")) return {
                        activeBg: "bg-gray-100",
                        activeText: "text-gray-900",
                        activeIcon: "text-gray-600",
                        hoverBg: "hover:bg-gray-100",
                        hoverText: "hover:text-gray-900"
                      };
                      // Default / Dashboard / Transactions (Blue)
                      return {
                        activeBg: "bg-blue-50",
                        activeText: "text-blue-700",
                        activeIcon: "text-blue-600",
                        hoverBg: "hover:bg-blue-50",
                        hoverText: "hover:text-blue-700"
                      };
                    };

                    const theme = getThemeColors(item.path);

                    return (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        className={`group flex items-center relative px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? `${theme.activeBg} ${theme.activeText} shadow-sm font-medium`
                            : `text-gray-500 ${theme.hoverBg} ${theme.hoverText} hover:bg-opacity-50`
                        } ${!sidebarOpen && "justify-center"}`}
                      >
                        <div className={`relative z-10 flex items-center ${sidebarOpen ? "gap-3" : ""}`}>
                          <span className={`${isActive ? theme.activeIcon : "text-gray-400 group-hover:text-current"} transition-colors`}>
                            {item.icon}
                          </span>
                          {sidebarOpen && (
                            <span className="text-sm whitespace-nowrap">
                              {item.label}
                            </span>
                          )}
                        </div>
                        
                        {/* Tooltip for collapsed state */}
                        {!sidebarOpen && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
            <Logo />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-8">
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item, itemIdx) => {
                    const isActive = location.pathname === item.path;
                    
                    // Helper to get theme colors based on path (Duplicated for now, could be extracted)
                    const getThemeColors = (path) => {
                      if (path.includes("/budget")) return {
                        activeBg: "bg-violet-50",
                        activeText: "text-violet-700",
                        activeIcon: "text-violet-600",
                        hoverBg: "hover:bg-violet-50",
                        hoverText: "hover:text-violet-700"
                      };
                      if (path.includes("/saving")) return {
                        activeBg: "bg-teal-50",
                        activeText: "text-teal-700",
                        activeIcon: "text-teal-600",
                        hoverBg: "hover:bg-teal-50",
                        hoverText: "hover:text-teal-700"
                      };
                      if (path.includes("/report")) return {
                        activeBg: "bg-indigo-50",
                        activeText: "text-indigo-700",
                        activeIcon: "text-indigo-600",
                        hoverBg: "hover:bg-indigo-50",
                        hoverText: "hover:text-indigo-700"
                      };
                      if (path.includes("/setting")) return {
                        activeBg: "bg-gray-100",
                        activeText: "text-gray-900",
                        activeIcon: "text-gray-600",
                        hoverBg: "hover:bg-gray-100",
                        hoverText: "hover:text-gray-900"
                      };
                      return {
                        activeBg: "bg-blue-50",
                        activeText: "text-blue-700",
                        activeIcon: "text-blue-600",
                        hoverBg: "hover:bg-blue-50",
                        hoverText: "hover:text-blue-700"
                      };
                    };

                    const theme = getThemeColors(item.path);

                    return (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        onClick={toggleMobileMenu}
                        className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? `${theme.activeBg} ${theme.activeText} shadow-sm font-medium`
                            : `text-gray-500 ${theme.hoverBg} ${theme.hoverText} hover:bg-opacity-50`
                        }`}
                      >
                        <span className={`${isActive ? theme.activeIcon : "text-gray-400 group-hover:text-current"} transition-colors`}>
                          {item.icon}
                        </span>
                        <span className="text-sm">
                          {item.label}
                        </span>
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
