import { useForm } from "react-hook-form";
import { Shield, Lock, Save, Loader2 } from "lucide-react";
import { setLocalPasswordAPI, changePasswordAPI } from "../../api/auth.js";
import { showSuccess, showError } from "../../utils/swal";

import { useUserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useTranslation } from "react-i18next";

export default function SecuritySettings({ user, onDeleteAccount }) {
  const { clearUser } = useUserContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
            t('app.settings.security.alerts.pwSetTitle'),
            t('app.settings.security.alerts.pwSetMsg')
          );
      } else {
          // Change existing password
          await changePasswordAPI({
            current_password: data.currentPassword,
            new_password: data.password,
            new_password_confirmation: data.confirmPassword,
          });
          showSuccess(
            t('app.settings.security.alerts.pwChangeTitle'),
            t('app.settings.security.alerts.pwChangeMsg')
          );
      }
      reset();
    } catch (error) {
      console.error(error);
      console.error(error);
      showError(
        t('app.settings.security.alerts.error'),
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
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex gap-4 items-start">
            <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-xl shrink-0">
              <Shield className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-1">
                {t('app.settings.security.setPw.title')}
              </h4>
              <p className="text-amber-700/80 dark:text-amber-300 leading-relaxed">
                {t('app.settings.security.setPw.desc')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {t('app.settings.security.changePw.new')}
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="password"
                  {...register("password", {
                    required: t('app.settings.security.validation.required'),
                    minLength: {
                      value: 8,
                      message: t('app.settings.security.validation.min'),
                    },
                  })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 dark:focus:border-gray-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {t('app.settings.security.changePw.confirm')}
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: t('app.settings.security.validation.confirmReq'),
                    validate: (val) =>
                      val === password || t('app.settings.security.validation.match'),
                  })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 dark:focus:border-gray-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 focus:ring-4 focus:ring-gray-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium w-full sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              <span>{t('app.settings.security.setPw.submit')}</span>
            </button>
          </form>
        </div>
      );
    }

    // Case 2: User HAS a password (either email login or Google user who set one)
    return (
      <div className="space-y-8">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex gap-4 items-start">
          <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shrink-0 shadow-sm">
            <Shield className="text-gray-900 dark:text-white" size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t('app.settings.security.changePw.title')}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('app.settings.security.changePw.desc')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {t('app.settings.security.changePw.current')}
                </label>
                <a href="/forgot-password" onClick={handleForgotPassword} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer">
                    {t('app.settings.security.changePw.forgot')}
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
                  required: t('app.settings.security.validation.currentReq'),
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
              {t('app.settings.security.changePw.new')}
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                {...register("password", {
                  required: t('app.settings.security.validation.required'),
                  minLength: {
                    value: 8,
                    message: t('app.settings.security.validation.min'),
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
              {t('app.settings.security.changePw.confirm')}
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                {...register("confirmPassword", {
                  required: t('app.settings.security.validation.confirmReq'),
                  validate: (val) =>
                    val === password || t('app.settings.security.validation.match'),
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
            <span>{t('app.settings.security.changePw.submit')}</span>
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderPasswordSection()}

      <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">{t('app.settings.security.danger.title')}</h3>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-semibold text-red-900 dark:text-red-200 mb-1">
              {t('app.settings.security.danger.deleteTitle')}
            </h4>
            <p className="text-sm text-red-700/80 dark:text-red-300">
              {t('app.settings.security.danger.deleteDesc')}
            </p>
          </div>
          <button
            onClick={onDeleteAccount}
            className="px-6 py-2.5 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all shadow-sm hover:shadow active:translate-y-0.5 whitespace-nowrap"
          >
            {t('app.settings.security.danger.deleteBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
