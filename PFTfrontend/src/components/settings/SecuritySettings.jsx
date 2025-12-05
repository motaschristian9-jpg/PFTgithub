import { useForm } from "react-hook-form";
import { Shield, Lock, Save, Loader2 } from "lucide-react";
import { setLocalPasswordAPI, changePasswordAPI } from "../../api/auth.js";
import { showSuccess, showError } from "../../utils/swal";

import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SecuritySettings({ user, onDeleteAccount }) {
  const { clearUser } = useUserContext();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout failed", error);
    }
    clearUser();
    navigate("/forgot-password");
  };

  const onSubmit = async (data) => {
    try {
      if (user?.login_method === "google" && !user?.has_password) {
          // Set initial password
          await setLocalPasswordAPI({
            password: data.password,
            password_confirmation: data.confirmPassword,
          });
          showSuccess(
            "Password Set!",
            "You can now log in with your email and password."
          );
      } else {
          // Change existing password
          await changePasswordAPI({
            current_password: data.currentPassword,
            new_password: data.password,
            new_password_confirmation: data.confirmPassword,
          });
          showSuccess(
            "Password Changed!",
            "Your password has been updated successfully."
          );
      }
      reset();
    } catch (error) {
      console.error(error);
      showError(
        "Error",
        error.response?.data?.message ||
          "Failed to update password. Please try again."
      );
    }
  };

  const renderPasswordSection = () => {
    // Case 1: Google User with NO local password set
    if (user?.login_method === "google" && !user?.has_password) {
      return (
        <div className="space-y-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start">
            <div className="p-3 bg-amber-100 rounded-xl shrink-0">
              <Shield className="text-amber-600" size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-amber-800 mb-1">
                Set a Password
              </h4>
              <p className="text-amber-700/80 leading-relaxed">
                You are currently logged in via Google. You don't need a password, but you can set one if you'd like to log in with email/password as well.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      val === password || "Passwords do not match",
                  })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm ml-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium w-full sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              <span>Set Password</span>
            </button>
          </form>
        </div>
      );
    }

    // Case 2: User HAS a password (either email login or Google user who set one)
    return (
      <div className="space-y-8">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex gap-4 items-start">
          <div className="p-3 bg-white rounded-xl shrink-0 shadow-sm">
            <Shield className="text-gray-900" size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              Change Password
            </h4>
            <p className="text-gray-500 leading-relaxed">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Current Password
                </label>
                <a href="/forgot-password" onClick={handleForgotPassword} className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                    Forgot Password?
                </a>
            </div>
            
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                {...register("currentPassword", {
                  required: "Current password is required",
                })}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-sm ml-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              New Password
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                {...register("password", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (val) =>
                    val === password || "Passwords do not match",
                })}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm ml-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center space-x-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            <span>Change Password</span>
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderPasswordSection()}

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-semibold text-red-900 mb-1">
              Delete Account
            </h4>
            <p className="text-sm text-red-700/80">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>
          <button
            onClick={onDeleteAccount}
            className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all shadow-sm hover:shadow active:translate-y-0.5 whitespace-nowrap"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
