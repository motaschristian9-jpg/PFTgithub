import { Link } from "react-router-dom";
import { Mail, RefreshCw, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useEmailVerificationLogic } from "../../hooks/useEmailVerificationLogic";

export default function EmailVerificationPage() {
  const {
    loading,
    isVisible,
    isEmailFromUrl,
    register,
    handleSubmit,
    errors,
    handleResendEmail,
  } = useEmailVerificationLogic();

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Left Side - Content */}
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
                <Mail size={24} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-600">
                We've sent a verification link to your email address.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                  <span>
                    Click the link in the email to verify your account and unlock full access.
                  </span>
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">Didn't receive it?</span>
                </div>
              </div>

              <form onSubmit={handleSubmit(handleResendEmail)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Email Address
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    placeholder="you@example.com"
                    className={`block w-full rounded-xl border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all ${
                      errors.email ? "ring-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                  {isEmailFromUrl && (
                    <p className="mt-1 text-xs text-gray-500">
                      Pre-filled from registration.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-gray-900 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {loading ? "Sending..." : "Resend Verification Email"}
                </button>
              </form>
            </div>
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
            <ShieldCheck size={40} />
          </div>
          
          <h2 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
            Verify your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-200">
              Identity
            </span>
          </h2>
          
          <p className="text-lg text-gray-400 leading-relaxed max-w-md mx-auto">
            To ensure the security of your financial data, we require email verification for all new accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
