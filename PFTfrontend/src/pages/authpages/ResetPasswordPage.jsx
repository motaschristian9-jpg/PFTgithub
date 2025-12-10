import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { useResetPasswordLogic } from "../../hooks/useResetPasswordLogic";

export default function ResetPasswordPage() {
  const {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    tokenValid,
    isVisible,
    register,
    handleSubmit,
    errors,
    password,
    handleResetPassword,
  } = useResetPasswordLogic();

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-gray-900">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h2>
            <p className="text-gray-600 mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Request New Link
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link 
              to="/login" 
              tabIndex={-1}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to login
            </Link>

            <div className="mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <LockKeyhole size={24} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                Set new password
              </h2>
              <p className="text-sm text-gray-600">
                Your new password must be different to previously used passwords.
              </p>
            </div>

            <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className={`block w-full rounded-xl border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all pr-10 ${
                      errors.password ? "ring-red-500 focus:ring-red-500" : ""
                    }`}
                    placeholder="••••••••"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("password_confirmation", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                    className={`block w-full rounded-xl border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all pr-10 ${
                      errors.password_confirmation ? "ring-red-500 focus:ring-red-500" : ""
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-gray-900 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Reset password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
        
        {/* Abstract Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-400/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

        <div className="relative z-10 flex flex-col justify-center px-12 text-white max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-blue-400 backdrop-blur-sm mx-auto mb-8 animate-float">
            <LockKeyhole size={40} />
          </div>
          
          <h2 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
            Protecting your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-200">
              digital assets.
            </span>
          </h2>
          
          <p className="text-lg text-gray-400 leading-relaxed max-w-md mx-auto">
            Security is our top priority. We use advanced encryption to ensure your data and account remain safe and private.
          </p>
        </div>
      </div>
    </div>
  );
}
