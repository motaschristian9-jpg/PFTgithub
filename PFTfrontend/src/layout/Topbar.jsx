import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, User, LogOut, Menu, ChevronDown } from "lucide-react";
import { logoutUser } from "../api/auth";
import { useDataContext } from "../components/DataLoader";
import { confirmAction } from "../utils/swal";
import { LogoIcon } from "../components/Logo";

// --- NEW COMPONENT: Formats messages for bolding ---
const NotificationMessage = ({ message }) => {
  const parts = message.split(/(\*\*.*?\*\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};
// ---------------------------------------------------

export default function Topbar({ toggleMobileMenu, user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const {
    notifications,
    hasUnread,
    setHasUnread,
    user: contextUser,
  } = useDataContext();
  const finalUser = user || contextUser;

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

  const getAvatarSrc = () => {
    if (finalUser?.avatar_url) {
      return finalUser.avatar_url;
    }
    const name = finalUser?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=111827&color=fff&bold=true`;
  };

  const handleInternalLogout = async () => {
    const result = await confirmAction({
      title: "Log out?",
      text: "Are you sure you want to end your session?",
      icon: "question",
      confirmButtonText: "Log out",
      confirmButtonColorClass: "bg-gray-900 hover:bg-gray-800",
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

  const onLogoutClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    handleInternalLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-6 h-20">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <Menu size={20} />
          </button>
          
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
             <LogoIcon size={32} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setNotificationOpen((prev) => !prev);
                if (!notificationOpen && typeof setHasUnread === "function") {
                  setHasUnread(false);
                }
              }}
              className={`p-2.5 rounded-xl transition-all duration-200 relative ${
                notificationOpen ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Bell size={20} />
              {hasUnread && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 max-h-[400px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  {notifications.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{notifications.length}</span>
                  )}
                </div>
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <Bell size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl text-sm transition-colors ${
                            n.type === "budget-error"
                              ? "bg-red-50 text-red-900 border border-red-100"
                              : n.type === "budget-warning"
                              ? "bg-violet-50 text-violet-900 border border-violet-100"
                              : n.type === "savings-success"
                              ? "bg-teal-50 text-teal-900 border border-teal-100"
                              : n.type === "savings-warning"
                              ? "bg-teal-50 text-teal-800 border border-teal-100"
                              : "bg-gray-50 text-gray-900 border border-gray-100"
                          }`}
                        >
                          <NotificationMessage message={n.message} />
                          <p className="text-xs opacity-60 mt-1">Just now</p>
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
              className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full transition-all duration-200 border ${
                dropdownOpen ? "bg-white border-gray-200 shadow-sm" : "border-transparent hover:bg-gray-50"
              }`}
            >
              <img
                src={getAvatarSrc()}
                alt={finalUser?.name || "User"}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    finalUser?.name || "User"
                  )}&background=111827&color=fff&bold=true`;
                }}
              />
              <div className="hidden sm:flex flex-col items-start">
                 <span className="text-sm font-semibold text-gray-700 leading-none">
                  {finalUser?.name?.split(" ")[0]}
                </span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {finalUser?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {finalUser?.email}
                  </p>
                </div>

                <div className="p-2">
                  <Link 
                    to="/setting"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <User size={16} />
                    Account Settings
                  </Link>
                  
                  <button
                    type="button"
                    onClick={onLogoutClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left mt-1"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
