import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, User, LogOut, Menu } from "lucide-react";
import Swal from "sweetalert2";
import { logoutUser } from "../api/auth";

// --- NEW COMPONENT: Formats messages for bolding ---
const NotificationMessage = ({ message }) => {
  // Regex to find content enclosed in **...**
  const parts = message.split(/(\*\*.*?\*\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        // Check if the part starts and ends with **
        if (part.startsWith("**") && part.endsWith("**")) {
          // Render the content inside <strong> tags
          return (
            <strong key={index} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        // Render regular text
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};
// ---------------------------------------------------

export default function Topbar({
  toggleMobileMenu,
  notifications,
  hasUnread,
  setHasUnread,
  user,
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

  // Helper to get avatar URL or fallback
  const getAvatarSrc = () => {
    if (user?.avatar_url) {
      return user.avatar_url;
    }
    const name = user?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=10b981&color=fff&bold=true`;
  };

  // Self-contained Logout Logic
  const handleInternalLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Logout",
    });

    if (result.isConfirmed) {
      try {
        await logoutUser();
      } catch (e) {
        console.error("Logout error:", e);
      } finally {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  // Click Handler
  const onLogoutClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    handleInternalLogout();
  };

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
                // Clear the 'hasUnread' status when the notifications dropdown is opened
                if (!notificationOpen) setHasUnread(false);
              }}
              className="p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-gray-600 hover:text-green-600 relative cursor-pointer"
            >
              <Bell size={20} />
              {/* Red dot indicator */}
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm border border-green-100 rounded-xl shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-green-100">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
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
                          {/* USE THE NEW COMPONENT HERE */}
                          <NotificationMessage message={n.message} />
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
              className="flex items-center space-x-2 p-1 pr-2 rounded-lg hover:bg-green-50 transition-colors duration-200 cursor-pointer"
            >
              <img
                src={getAvatarSrc()}
                alt={user?.name || "User"}
                className="w-9 h-9 rounded-full object-cover shadow-sm border border-green-100"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "User"
                  )}&background=10b981&color=fff&bold=true`;
                }}
              />
              <span className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-[100px]">
                {user?.name?.split(" ")[0]}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm border border-green-100 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-green-50 bg-green-50/30">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-green-50 transition-colors duration-200 text-gray-700 hover:text-green-600"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={16} />
                  <span className="font-medium">Profile Settings</span>
                </Link>
                <div className="border-t border-green-100 my-1"></div>

                {/* Updated Logout Button */}
                <button
                  type="button"
                  onClick={onLogoutClick}
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
