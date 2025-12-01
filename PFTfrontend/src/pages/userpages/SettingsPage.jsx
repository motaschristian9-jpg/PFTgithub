import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Settings as SettingsIcon,
  Lock,
  Bell,
  Save,
  Upload,
  Mail,
  Shield,
  Smartphone,
  CreditCard,
  ChevronRight,
  Camera,
} from "lucide-react";
import Swal from "sweetalert2";
import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth directly
import { updateProfile } from "../../api/auth";

// --- SUB-COMPONENTS FOR TABS ---

// 1. Profile Settings Component
const ProfileSettings = ({
  formData,
  setFormData,
  previewUrl,
  setPreviewUrl,
  setAvatarFile,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create a local preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-8 border-b border-gray-100">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center text-4xl font-bold text-emerald-700 border-4 border-white shadow-xl overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{formData.name?.[0]?.toUpperCase() || "U"}</span>
            )}
          </div>
          <button
            type="button"
            onClick={triggerFileInput}
            className="absolute bottom-1 right-1 p-3 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-emerald-600 transition-colors hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Camera size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800">Your Profile</h3>
          <p className="text-gray-500 text-base">
            Update your photo and personal details here.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Full Name
          </label>
          <div className="relative">
            <User
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-base focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all outline-none"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-base cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-400 pl-1">Email cannot be changed.</p>
        </div>

        <div className="space-y-2.5 lg:col-span-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Bio
          </label>
          <textarea
            rows="4"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-base focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all outline-none resize-none leading-relaxed"
            placeholder="Tell us a little about yourself..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

// 2. System/App Preferences Component
const SystemSettings = () => {
  const [currency, setCurrency] = useState("USD");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="pb-6 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800">App Preferences</h3>
        <p className="text-gray-500 mt-2 text-base">
          Customize your experience and regional formats.
        </p>
      </div>

      <div className="space-y-6">
        {/* Currency */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-5 mb-4 sm:mb-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-800">
                Default Currency
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Used for reports and budgets
              </p>
            </div>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full sm:w-auto px-5 py-3 bg-white border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="PHP">PHP (₱)</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-amber-200 transition-colors">
          <div className="flex items-center gap-5 mb-4 sm:mb-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
              <Bell size={24} />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-800">
                Email Notifications
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Get weekly summary reports
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
          </label>
        </div>

        {/* Dark Mode (Placeholder) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gray-50/80 rounded-2xl border border-gray-100 opacity-60 pointer-events-none">
          <div className="flex items-center gap-5 mb-4 sm:mb-0">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
              <Smartphone size={24} />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-800">Dark Mode</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Coming soon in v2.0
              </p>
            </div>
          </div>
          <div className="px-4 py-1.5 text-xs font-bold text-purple-600 bg-purple-100 rounded-full uppercase tracking-wider">
            PRO Feature
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Security Settings Component
const SecuritySettings = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="pb-6 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800">Login & Security</h3>
        <p className="text-gray-500 mt-2 text-base">
          Manage your password and 2FA settings.
        </p>
      </div>

      <div className="space-y-6 max-w-lg">
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Current Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="pt-6">
          <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit text-blue-600">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-blue-900">
                Secure your account
              </h4>
              <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                Two-factor authentication is currently disabled. We strongly
                recommend enabling it for an extra layer of security.
              </p>
              <button className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline">
                Enable 2FA &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN SETTINGS PAGE ---

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tab State: 'profile' | 'system' | 'security'
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Get user and setUser from useAuth for Optimistic UI
  const { user, setUser } = useAuth();

  // Local state for profile form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
      if (user.avatar_url) {
        setPreviewUrl(user.avatar_url);
      }
    }
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  const handleSave = async () => {
    if (activeTab === "profile") {
      setIsSaving(true);

      try {
        const data = new FormData();
        data.append("name", formData.name);
        if (avatarFile) {
          data.append("avatar", avatarFile);
        }

        const response = await updateProfile(data);

        // 1. Optimistic UI Update: Update the user context immediately
        if (response?.data?.user) {
          const updatedUser = response.data.user;
          setUser(updatedUser);

          // 2. CRITICAL: Update localStorage so data persists on next reload
          // Adjust 'user' key if your app uses a different key name (e.g. 'authUser')
          const currentStorage = localStorage.getItem("user");
          if (currentStorage) {
            // If you store token and user together, be careful not to overwrite the token
            // This assumes simple JSON object storage for user
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        }

        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile has been updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        // REMOVED window.location.reload()
      } catch (error) {
        console.error("Update failed:", error);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error.response?.data?.message || "Something went wrong.",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      // Simulate save for other tabs
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        Swal.fire({
          icon: "success",
          title: "Settings Saved",
          timer: 1000,
          showConfirmButton: false,
        });
      }, 1000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSettings
            formData={formData}
            setFormData={setFormData}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
            setAvatarFile={setAvatarFile}
            user={user}
          />
        );
      case "system":
        return <SystemSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return (
          <ProfileSettings
            formData={formData}
            setFormData={setFormData}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
            setAvatarFile={setAvatarFile}
            user={user}
          />
        );
    }
  };

  // Helper to get color based on active tab for the save button
  const getThemeColor = () => {
    if (activeTab === "profile") return "emerald";
    if (activeTab === "system") return "blue";
    if (activeTab === "security") return "rose";
    return "emerald";
  };

  const themeColor = getThemeColor();

  return (
    <div
      className={`flex min-h-screen bg-gradient-to-br from-white via-${themeColor}-50 to-gray-50 transition-colors duration-500`}
    >
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-${themeColor}-200/20 to-${themeColor}-300/10 rounded-full blur-3xl transition-colors duration-500`}
        ></div>
        <div
          className={`absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-${themeColor}-100/30 to-${themeColor}-200/20 rounded-full blur-2xl transition-colors duration-500`}
        ></div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex flex-col relative z-10">
        <Topbar
          toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          notifications={[]}
          user={user}
        />

        <MainView>
          <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center space-x-5 mb-10">
              <div
                className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-600 text-white transition-colors duration-500`}
              >
                <SettingsIcon size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 text-lg">
                  Manage your account details and preferences
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT: Tab Navigation (Spans 3 cols on large screens) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm p-2 sticky top-6">
                  <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all whitespace-nowrap ${
                        activeTab === "profile"
                          ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <User
                        size={20}
                        className={
                          activeTab === "profile"
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }
                      />
                      <span className="flex-1 text-left">Profile</span>
                      {activeTab === "profile" && (
                        <ChevronRight size={18} className="opacity-50" />
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab("system")}
                      className={`flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all whitespace-nowrap ${
                        activeTab === "system"
                          ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <SettingsIcon
                        size={20}
                        className={
                          activeTab === "system"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      />
                      <span className="flex-1 text-left">Preferences</span>
                      {activeTab === "system" && (
                        <ChevronRight size={18} className="opacity-50" />
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab("security")}
                      className={`flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all whitespace-nowrap ${
                        activeTab === "security"
                          ? "bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-200"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <Lock
                        size={20}
                        className={
                          activeTab === "security"
                            ? "text-rose-600"
                            : "text-gray-400"
                        }
                      />
                      <span className="flex-1 text-left">Security</span>
                      {activeTab === "security" && (
                        <ChevronRight size={18} className="opacity-50" />
                      )}
                    </button>
                  </nav>
                </div>
              </div>

              {/* RIGHT: Content Area (Spans 9 cols on large screens) */}
              <div className="lg:col-span-9">
                <div className="bg-white backdrop-blur-md border border-gray-100 rounded-3xl shadow-lg shadow-gray-200/50 p-8 lg:p-10 relative overflow-hidden">
                  {/* Content Switcher */}
                  {renderContent()}

                  {/* Save Button Footer */}
                  <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-${themeColor}-200 hover:shadow-${themeColor}-300 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-${themeColor}-500 to-${themeColor}-600`}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MainView>
        <Footer />
      </div>
    </div>
  );
}
