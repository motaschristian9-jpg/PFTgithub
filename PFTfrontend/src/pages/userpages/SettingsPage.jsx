import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Settings as SettingsIcon,
  Lock,
  Bell,
  Save,
  Shield,
  Smartphone,
  CreditCard,
  ChevronRight,
  Camera,
  Mail,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";

import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import { useAuth } from "../../hooks/useAuth.js";
// Import dedicated API for password setting/changing
import { updateProfile, setLocalPasswordAPI } from "../../api/auth.js";

// --- SUB-COMPONENTS ---

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
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            onClick={() => fileInputRef.current.click()}
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
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-base focus:ring-2 focus:ring-emerald-500 outline-none"
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
      </div>
    </div>
  );
};

const SystemSettings = ({ formData, setFormData }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="pb-6 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800">App Preferences</h3>
        <p className="text-gray-500 mt-2 text-base">
          Customize your experience and regional formats.
        </p>
      </div>

      <div className="space-y-6">
        {/* Currency Selection */}
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
                Visual display only (Value remains the same)
              </p>
            </div>
          </div>
          <select
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            className="w-full sm:w-auto px-5 py-3 bg-white border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm"
          >
            <option value="USD">USD ($)</option>
            <option value="PHP">PHP (₱)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>

        {/* Notifications (Visual Only for now) */}
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

// --- NEW COMPONENT: Handles Password Forms (Using React Hook Form) ---
const PasswordForm = ({ user, setUser, isGoogleUser }) => {
  // Requires old password only for traditional email users
  const requiresOldPassword = !isGoogleUser;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onChange",
  });

  const newPassword = watch("password");

  const onSubmit = async (data) => {
    try {
      let response;

      if (isGoogleUser) {
        // 1. OAuth user setting their first local password: uses setLocalPasswordAPI (PUT /user/set-password)
        const payload = {
          password: data.password,
          password_confirmation: data.password_confirmation,
        };
        response = await setLocalPasswordAPI(payload);
      } else {
        // 2. Traditional user changing their existing password:
        // Uses the dedicated updateProfile API helper, which the Laravel backend must be configured to handle
        // the password fields alongside the profile fields, or be updated to use a dedicated endpoint.

        // IMPORTANT: Since updateProfile is set up as POST multipart/form-data, we use FormData.
        // We assume the Laravel AuthController's updateProfile method can handle the change password logic.
        const payload = new FormData();
        // Ensure name and currency fields are NOT sent here if this API is purely for password.
        // But since the current updateProfile API requires name/currency, we have a conflict.
        // For a 422 fix, we must use a minimal JSON payload, forcing us to use a dedicated API.

        // *** Using dedicated endpoint logic (even if implemented as POST/PUT) ***
        const passwordPayload = {
          current_password: data.current_password,
          password: data.password,
          password_confirmation: data.password_confirmation,
        };

        // NOTE: We must use a dedicated API for password change, let's assume one is created
        // called changePasswordAPI (which is often /user/change-password)
        // For the purpose of getting past the 422 error, we assume you'll use /user/set-password as change API placeholder.

        // *** Replace with your actual /user/change-password API helper: ***
        // response = await changePasswordAPI(passwordPayload);
        response = await setLocalPasswordAPI(passwordPayload);
      }

      Swal.fire({
        icon: "success",
        title: isGoogleUser ? "Password Created!" : "Password Changed!",
        text: isGoogleUser
          ? "You can now log in using this password and your email."
          : "Your password has been updated.",
        confirmButtonColor: "#10B981",
        timer: 3000,
      });

      // Reset the form fields
      reset();

      if (response.data?.user) {
        // Update the user context if the server returns updated details.
        setUser(response.data.user);
      }
    } catch (error) {
      let errorMessage = "An unknown error occurred.";

      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        if (validationErrors.current_password) {
          errorMessage = validationErrors.current_password[0];
        } else if (validationErrors.password) {
          errorMessage = validationErrors.password[0];
        } else if (validationErrors.email) {
          errorMessage = validationErrors.email[0];
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#EF4444",
      });
      // Re-render form to show validation errors (if applicable)
      Object.keys(error.response?.data?.errors || {}).forEach((key) => {
        setError(key, { message: error.response.data.errors[key][0] });
      });
    } finally {
      // Ensure submission state is reset
      // This is managed by React Hook Form's isSubmitting, but we keep it here for clarity if needed.
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
      <h4 className="text-xl font-bold text-gray-800">
        {isGoogleUser ? "Set Your Local Password" : "Change Password"}
      </h4>

      {requiresOldPassword && (
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">
            Current Password
          </label>
          <input
            type="password"
            {...register("current_password", {
              required: "Current password is required",
            })}
            className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none ${
              errors.current_password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Required for verification"
            aria-invalid={errors.current_password ? "true" : "false"}
          />
          {errors.current_password && (
            <p className="text-xs text-red-500">
              {errors.current_password.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">New Password</label>
        <input
          type="password"
          {...register("password", {
            required: "New password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
          className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none ${
            errors.password ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter new password (min 8 characters)"
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">
          Confirm New Password
        </label>
        <input
          type="password"
          {...register("password_confirmation", {
            required: "Confirmation is required",
            validate: (value) =>
              value === newPassword || "Passwords must match",
          })}
          className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none ${
            errors.password_confirmation ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Confirm new password"
          aria-invalid={errors.password_confirmation ? "true" : "false"}
        />
        {errors.password_confirmation && (
          <p className="text-xs text-red-500">
            {errors.password_confirmation.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Lock size={20} />
        )}
        {isGoogleUser ? "Create Password" : "Update Password"}
      </button>
    </form>
  );
};
// ---------------------------------------------

// --- UPDATED COMPONENT: Security Settings ---
const SecuritySettings = ({ user, setUser }) => {
  const isGoogleUser = user?.login_method === "google";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="pb-6 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800">Login & Security</h3>
        <p className="text-gray-500 mt-2 text-base">
          {isGoogleUser
            ? "Manage your account's local password access."
            : "Manage your password."}
        </p>
      </div>

      <div className="space-y-6 max-w-lg">
        {/* Conditional Password Form */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <PasswordForm
            user={user}
            setUser={setUser}
            isGoogleUser={isGoogleUser}
          />
        </div>

        {/* Info / Warning Section */}
        {isGoogleUser && (
          <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4">
            <div className="p-2 bg-rose-100 rounded-lg h-fit text-rose-600">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-rose-900">
                Identity Provider
              </h4>
              <p className="text-sm text-rose-700 mt-1 leading-relaxed">
                This account uses Google for primary authentication. Setting a
                local password above allows you to sign in with your email and
                password as well.
              </p>
            </div>
          </div>
        )}

        <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
          <div className="p-2 bg-blue-100 rounded-lg h-fit text-blue-600">
            <Shield size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-blue-900">
              Forgotten Password?
            </h4>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              If you've forgotten your current password, please use the "Forgot
              Password" link on the main login screen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
// ----------------------------------------------------

// --- MAIN SETTINGS PAGE ---

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, setUser } = useAuth();
  const isGoogleUser = user?.login_method === "google";

  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Centralized State for all settings
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currency: "USD",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load user data into state
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currency: user.currency || "USD",
      });
      if (user.avatar_url) {
        setPreviewUrl(user.avatar_url);
      }

      // Fallback check: If the user is a Google user, ensure they aren't stuck on the security tab.
      if (activeTab === "security" && isGoogleUser) {
        setActiveTab("profile");
      }
    }
  }, [user, isGoogleUser]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Prepare Payload for Profile/System updates
      const data = new FormData();
      data.append("name", formData.name);
      data.append("currency", formData.currency);

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const response = await updateProfile(data);

      // 1. Optimistic UI Update
      if (response?.data?.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);

        const currentStorage = localStorage.getItem("user");
        if (currentStorage) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }

      // --- SWEETALERT SUCCESS ---
      Swal.fire({
        icon: "success",
        title: "Settings Saved!",
        text: "Your preferences have been updated successfully.",
        confirmButtonColor: "#10B981",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Update failed:", error);

      // --- SWEETALERT ERROR ---
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsSaving(false);
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
          />
        );
      case "system":
        return <SystemSettings formData={formData} setFormData={setFormData} />;
      case "security":
        // Always render the container content, which handles its own logic based on user props
        return <SecuritySettings user={user} setUser={setUser} />;
      default:
        return null;
    }
  };

  const getThemeColor = () => {
    if (activeTab === "profile") return "emerald";
    if (activeTab === "system") return "blue";
    if (activeTab === "security") return "rose";
    return "emerald";
  };

  const themeColor = getThemeColor();

  // Condition to hide the Security tab entirely
  const showSecurityTab = !isGoogleUser;

  return (
    <div
      className={`flex min-h-screen bg-gradient-to-br from-white via-${themeColor}-50 to-gray-50 transition-colors duration-500`}
    >
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
              {/* LEFT: Tab Navigation */}
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

                    {/* CONDITIONAL RENDERING OF SECURITY TAB */}
                    {showSecurityTab && (
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
                    )}
                  </nav>
                </div>
              </div>

              {/* RIGHT: Content Area */}
              <div className="lg:col-span-9">
                <div className="bg-white backdrop-blur-md border border-gray-100 rounded-3xl shadow-lg shadow-gray-200/50 p-8 lg:p-10 relative overflow-hidden">
                  {renderContent()}

                  {/* Save Button (Shared across tabs) */}
                  {activeTab !== "security" && (
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
                  )}
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
