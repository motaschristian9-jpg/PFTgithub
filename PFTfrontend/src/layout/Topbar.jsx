import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, User, LogOut, Menu } from "lucide-react";
import Swal from "sweetalert2";

export default function Topbar({
  toggleMobileMenu,
  notifications,
  hasUnread,
  setHasUnread,
  user,
  handleLogout
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
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

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-green-100/50 shadow-sm">
      <div className="flex items-center justify-between px-6 py-1">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600"
          >
            <Menu size={20} />
          </button>
          {/* Mobile logo */}
          <span className="md:hidden text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            MoneyTracker
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setNotificationOpen((prev) => !prev);
                if (!notificationOpen) setHasUnread(false);
              }}
              className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600 relative cursor-pointer"
            >
              <Bell size={20} />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm border border-green-100 rounded-xl shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-green-100">
                  <h3 className="font-semibold text-gray-800">
                    Notifications
                  </h3>
                </div>
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🔔</span>
                        </div>
                        <span className="text-sm">No notifications</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-lg border-l-4 text-sm ${
                            n.type === "error"
                              ? "bg-red-50 border-red-500 text-red-800"
                              : n.type === "warning"
                              ? "bg-yellow-50 border-yellow-500 text-yellow-800"
                              : n.type === "success"
                              ? "bg-green-50 border-green-500 text-green-800"
                              : "bg-blue-50 border-blue-500 text-blue-800"
                          }`}
                        >
                          {n.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 cursor-pointer"
            >
              <img
                src="https://picsum.photos/40"
                alt="User"
                className="w-10 h-10 rounded-full object-cover shadow-md"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm border border-green-100 rounded-xl shadow-xl py-2 z-50">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-green-50 transition-colors duration-200 text-gray-700 hover:text-green-600"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={16} />
                  <span className="font-medium">Profile Settings</span>
                </Link>
                <div className="border-t border-green-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200 text-red-600 hover:text-red-700 w-full text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  <span className="font-medium">Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
