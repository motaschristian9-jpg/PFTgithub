import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader2, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { forgotPassword } from "../../api/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleForgotPassword = async (formData) => {
    setLoading(true);
    try {
      await forgotPassword(formData.email);

      setEmailSent(true);
      Swal.fire({
        title: "Email Sent!",
        text: "We've sent a password reset link to your email address.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      let errorMessage = "Something went wrong. Try again later.";
      let isGoogleError = false;

      if (err.response && err.response.data) {
        const responseData = err.response.data;

        // Check for the specific Google login method error message from the backend
        if (
          responseData.message &&
          typeof responseData.message === "string" &&
          responseData.message.includes("Google")
        ) {
          errorMessage = responseData.message;
          isGoogleError = true;
        } else if (responseData.errors?.email) {
          // Handle Laravel validation errors (422)
          errorMessage = Array.isArray(responseData.errors.email)
            ? responseData.errors.email[0]
            : responseData.errors.email;
        } else if (responseData.message) {
          // General error message
          errorMessage = responseData.message;
        }
      }

      // Display specific error feedback
      if (isGoogleError) {
        Swal.fire({
          icon: "info",
          title: "Google Account Detected",
          text: "This account was created using Google. Please use the 'Continue with Google' button to sign in.",
          confirmButtonText: "Go to Login",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          }
        });
      } else {
        // Apply the error message to the email field or show general Swal
        if (
          errorMessage.includes("email") ||
          errorMessage.includes("account found")
        ) {
          setError("email", { message: errorMessage });
        } else {
          Swal.fire("Error", errorMessage, "error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-green-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/40 to-green-200/30 rounded-full blur-2xl"></div>
      </div>

      {/* Header / Branding */}
      <header
        className={`relative z-10 flex justify-between items-center py-4 px-6 max-w-6xl mx-auto w-full flex-shrink-0 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
      >
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            MoneyTracker
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 max-w-6xl mx-auto w-full overflow-hidden">
        {/* Left side */}
        <div
          className={`hidden lg:flex flex-1 items-center justify-center p-8 transition-all duration-1000 delay-300 ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-10"
          }`}
        >
          <div className="text-center space-y-6 max-w-sm">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-green-200/50 to-green-300/30 rounded-2xl blur opacity-60"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl">🔑</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                      Reset Your Password
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Enter your email address and we'll send you a link to
                      reset your password.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
          <div
            className={`w-full max-w-md my-auto transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6">
                {/* Back Link */}
                <div className="mb-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-300"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                  </Link>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Forgot Password
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Reset Your Password
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Enter your email address and we'll send you a reset link
                  </p>
                </div>

                {!emailSent ? (
                  /* Form */
                  <form
                    className="space-y-4"
                    onSubmit={handleSubmit(handleForgotPassword)}
                  >
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email Address
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
                        className={`w-full px-3 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm ${
                          errors.email ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </form>
                ) : (
                  /* Success Message */
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Check Your Email
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        We've sent a password reset link to{" "}
                        <span className="font-medium text-gray-800">
                          {getValues("email")}
                        </span>
                      </p>
                      <p className="text-gray-500 text-xs">
                        Didn't receive the email? Check your spam folder or{" "}
                        <button
                          onClick={() => setEmailSent(false)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          try again
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="mt-6 text-center">
                  <Link
                    to="/signup"
                    className="text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium text-sm"
                  >
                    Don't have an account?{" "}
                    <span className="text-green-600 font-semibold hover:text-green-700">
                      Sign Up
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
