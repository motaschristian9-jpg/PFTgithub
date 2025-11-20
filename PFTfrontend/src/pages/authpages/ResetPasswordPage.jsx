import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { resetPassword } from "../../api/auth";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm({
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    // Trigger entrance animations
    setIsVisible(true);

    // Get token from URL params
    const urlToken = searchParams.get('token') || token;

    if (!urlToken) {
      setTokenValid(false);
      return;
    }
  }, [token, searchParams]);

  const handleResetPassword = async (formData) => {
    setLoading(true);
    try {
      const resetToken = searchParams.get('token') || token;
      const email = searchParams.get('email');

      if (!email) {
        setError("password", { message: "Invalid reset link. Email parameter missing." });
        return;
      }

      await resetPassword({
        email: email,
        token: resetToken,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      Swal.fire({
        title: "Password Reset!",
        text: "Your password has been successfully reset. You can now log in with your new password.",
        icon: "success",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigate("/login");
      });
    } catch (err) {
      if (err.response && err.response.data) {
        // Handle Laravel validation errors
        if (err.response.data.errors) {
          // Laravel ValidationException returns errors in 'errors' key
          const errors = err.response.data.errors;
          if (errors.password) {
            setError("password", {
              message: Array.isArray(errors.password) ? errors.password[0] : errors.password
            });
          } else if (errors.password_confirmation) {
            setError("password_confirmation", {
              message: Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation
            });
          }
        } else if (err.response.data.message) {
          if (typeof err.response.data.message === "string") {
            setError("password", { message: err.response.data.message });
          } else if (typeof err.response.data.message === "object") {
            // Check for password-specific errors
            if (err.response.data.message.password) {
              setError("password", {
                message: Array.isArray(err.response.data.message.password)
                  ? err.response.data.message.password[0]
                  : err.response.data.message.password
              });
            } else if (err.response.data.message.password_confirmation) {
              setError("password_confirmation", {
                message: Array.isArray(err.response.data.message.password_confirmation)
                  ? err.response.data.message.password_confirmation[0]
                  : err.response.data.message.password_confirmation
              });
            }
          }
        } else if (err.response.data.error) {
          setError("password", { message: err.response.data.error });
        } else {
          // Network or other errors - keep Swal for these
          Swal.fire("Error", "Something went wrong. Try again later.", "error");
        }
      } else {
        // Network or other errors - keep Swal for these
        Swal.fire("Error", "Something went wrong. Try again later.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 text-sm mb-4">
              This password reset link is invalid or has expired.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                    <span className="text-2xl">🔐</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                      Set New Password
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Choose a strong password for your account.
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
                    Reset Password
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Create New Password
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Enter your new password below
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit(handleResetPassword)}>
                  <div className="space-y-3">
                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                          },
                        })}
                        placeholder="••••••••"
                        className={`w-full px-3 py-2.5 pr-10 bg-white border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm ${
                          errors.password ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        className="absolute right-3 top-8 text-gray-500 hover:text-green-600 transition-colors duration-200"
                      >
                        {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("password_confirmation", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        placeholder="••••••••"
                        className={`w-full px-3 py-2.5 pr-10 bg-white border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm ${
                          errors.password_confirmation ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                        className="absolute right-3 top-8 text-gray-500 hover:text-green-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      {errors.password_confirmation && (
                        <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>

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
