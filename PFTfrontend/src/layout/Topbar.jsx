import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, User, LogOut, Menu, ChevronDown, X } from "lucide-react";
import { logoutUser } from "../api/auth";
import { useDataContext } from "../components/DataLoader";
import { confirmAction } from "../utils/swal";
import { useDeleteNotification } from "../hooks/useNotifications";
import { LogoIcon } from "../components/Logo";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

// --- NEW COMPONENT: Formats messages for bolding ---
const NotificationMessage = ({ message }) => {
  const parts = message.split(/(\*\*.*?\*\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-gray-900 dark:text-gray-100">
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
  const { t } = useTranslation();
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
  
  const deleteNotification = useDeleteNotification();

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
      title: t('app.topbar.logoutModal.title'),
      text: t('app.topbar.logoutModal.text'),
      icon: "question",
      confirmButtonText: t('app.topbar.logoutModal.confirm'),
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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
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
                notificationOpen 
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Bell size={20} />
              {hasUnread && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
              )}
            </button>

            {notificationOpen && (
              <div className="fixed inset-x-4 top-24 mt-2 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 py-2 z-50 max-h-[400px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t('app.topbar.notifications')}</h3>
                  {notifications.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{notifications.length}</span>
                  )}
                </div>
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <Bell size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">{t('app.topbar.noNotifications')}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl text-sm transition-colors ${
                            n.type === "budget-error"
                              ? "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300 border border-red-100 dark:border-red-900/30"
                              : n.type === "budget-warning"
                              ? "bg-violet-50 dark:bg-violet-900/20 text-violet-900 dark:text-violet-300 border border-violet-100 dark:border-violet-900/30"
                              : n.type === "savings-success"
                              ? "bg-teal-50 dark:bg-teal-900/20 text-teal-900 dark:text-teal-300 border border-teal-100 dark:border-teal-900/30"
                              : n.type === "savings-warning"
                              ? "bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 border border-teal-100 dark:border-teal-900/30"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700"
                          } group relative`}
                        >
                          <NotificationMessage message={n.translationKey ? t(n.translationKey, n.translationParams) : n.message} />
                          <p className="text-xs opacity-60 mt-1">
                            {n.timestamp 
                              ? formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })
                              : t('app.topbar.justNow')}
                          </p>
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification.mutate(n.id);
                            }}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                             <X size={12} />
                          </button>
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
                dropdownOpen 
                  ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm" 
                  : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
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
                 <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none">
                  {finalUser?.name?.split(" ")[0]}
                </span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {finalUser?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {finalUser?.email}
                  </p>
                </div>

                <div className="p-2">
                  <Link 
                    to="/setting"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <User size={16} />
                    {t('app.topbar.accountSettings')}
                  </Link>
                  
                  <button
                    type="button"
                    onClick={onLogoutClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left mt-1"
                  >
                    <LogOut size={16} />
                    {t('app.topbar.signOut')}
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
