import { LogoIcon } from "../../components/Logo";

import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLoginLogic } from "../../hooks/useLoginLogic";

export default function LoginPage() {
  const {
    showPassword,
    setShowPassword,
    isVisible,
    loading,
    googleLoading,
    register,
    handleSubmit,
    errors,
    handleLogin,
    loginWithGoogle,
  } = useLoginLogic();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-8">
              <LogoIcon size={40} />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                Money<span className="text-blue-600">Tracker</span>
              </span>
            </Link>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              {t('auth.login.welcome')}
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              {t('auth.login.subtitle')}
            </p>

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.login.emailLabel')}
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: t('auth.login.validation.emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('auth.login.validation.emailInvalid'),
                    },
                  })}
                  className={`block w-full rounded-xl border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all ${
                    errors.email ? "ring-red-500 focus:ring-red-500" : ""
                  }`}
                  placeholder={t('auth.login.emailPlaceholder')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.login.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: t('auth.login.validation.passwordRequired') })}
                    className={`block w-full rounded-xl border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all pr-10 ${
                      errors.password ? "ring-red-500 focus:ring-red-500" : ""
                    }`}
                    placeholder={t('auth.login.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    tabIndex={-1}
                    {...register("remember")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                    {t('auth.login.rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    tabIndex={-1}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-gray-900 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('auth.login.signIn')}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">{t('auth.login.orContinueWith')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={googleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus-visible:ring-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
              >
                {googleLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <img src="/google.svg" alt="Google" className="h-5 w-5" />
                    <span className="text-sm font-medium">{t('auth.login.google')}</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              {t('auth.login.noAccount')}{" "}
              <Link to="/signup" tabIndex={-1} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                {t('auth.login.signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
        
        {/* Abstract Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-400/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

        <div className="relative z-10 flex flex-col justify-center px-12 text-white max-w-2xl mx-auto">
          <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm font-medium backdrop-blur-sm w-fit">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            {t('auth.login.rightSide.trustedBy')}
          </div>
          
          <h2 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
            {t('auth.login.rightSide.heroTitle')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-200">
              {t('auth.login.rightSide.heroHighlight')}
            </span>
          </h2>
          
          <p className="text-lg text-gray-400 mb-12 leading-relaxed">
            {t('auth.login.rightSide.testimonial')}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-gray-900 bg-gray-800 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 5}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex gap-1 text-blue-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <CheckCircle2 key={i} size={16} fill="currentColor" className="text-blue-500" />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-400">{t('auth.login.rightSide.rating')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
