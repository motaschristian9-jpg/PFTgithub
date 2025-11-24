import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { loginUser } from "../../api/auth";
import { setToken } from "../../api/axios"; // Added import for setToken helper
import { useUserContext } from "../../context/UserContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    // Trigger entrance animations
    setIsVisible(true);

    // Check for email parameter from verification page
    const emailParam = searchParams.get("email");
    if (emailParam) {
      // Pre-fill email if coming from verification
      // This would need to be handled differently with React Hook Form
    }
  }, [searchParams]);


  const userContext = useUserContext();

  // New effect to watch user changes and redirect when logged in
  useEffect(() => {
    if (!userContext.isLoading && userContext.user) {
      navigate("/dashboard");
    }
  }, [userContext.user, userContext.isLoading, navigate]);

  const { setUser } = userContext;

const handleLogin = async (formData) => {
    setLoading(true);
    try {
      const result = await loginUser(formData);

      // Use setToken helper for consistent token storage (handles remember logic)
      setToken(result.data.token, formData.remember);

      // Store user data in UserContext state (this also syncs to localStorage)
      setUser(result.data.user);

      // Added back Swal alert for login success
      await Swal.fire({
        title: "Login Successful!",
        text: "Welcome back!",
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });

      // Redirect only after user clicks OK
      navigate("/dashboard");

      // Removed direct navigate to allow useEffect handle navigation
      // navigate("/dashboard");
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) {
        let errorMessage = "Login failed";
        let errorField = "root"; // Default to root for general errors

        // Handle Laravel validation errors
        if (err.response.data.errors) {
          // Laravel ValidationException returns errors in 'errors' key
          const errors = err.response.data.errors;
          if (errors.email) {
            errorMessage = Array.isArray(errors.email) ? errors.email[0] : errors.email;
            errorField = "email";
          } else if (errors.password) {
            errorMessage = Array.isArray(errors.password) ? errors.password[0] : errors.password;
            errorField = "password";
          }
        } else if (err.response.data.message) {
          if (typeof err.response.data.message === "string") {
            errorMessage = err.response.data.message;
          } else if (typeof err.response.data.message === "object") {
            // Check for email-specific errors (non-existent email)
            if (err.response.data.message.email) {
              errorMessage = Array.isArray(err.response.data.message.email)
                ? err.response.data.message.email[0]
                : err.response.data.message.email;
              errorField = "email";
            }
            // Check for password-specific errors (wrong password)
            else if (err.response.data.message.password) {
              errorMessage = Array.isArray(err.response.data.message.password)
                ? err.response.data.message.password[0]
                : err.response.data.message.password;
              errorField = "password";
            }
          }
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }

        // Special handling for Google OAuth users trying to login with form
        if (
          errorMessage.includes("Google OAuth") ||
          errorMessage.includes("Continue with Google")
        ) {
          Swal.fire({
            title: "Google Account Detected",
            text: "This account was created using Google OAuth. Please use the 'Continue with Google' button to sign in.",
            icon: "info",
            confirmButtonText: "Continue with Google",
            showCancelButton: true,
            cancelButtonText: "Cancel",
          }).then((result) => {
            if (result.isConfirmed) {
              loginWithGoogle();
            }
          });
        } else {
          // Use React Hook Form to display validation errors for authentication issues
          setError(errorField, { message: errorMessage });
        }
      } else {
        // Network or other errors - keep Swal for these
        Swal.fire("Error", "Something went wrong. Try again later.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      // Get the Google OAuth URL from backend with login state
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/google/login?state=login&redirect_uri=http://localhost:5173/auth/google/callback"
      );

      if (!response.ok) {
        throw new Error("Failed to get Google OAuth URL");
      }

      const data = await response.json();

      if (data.success) {
        // Redirect to Google OAuth
        window.location.href = data.redirect_url;
      } else {
        Swal.fire(
          "Error",
          data.message || "Failed to initiate Google login",
          "error"
        );
      }
    } catch (err) {
      console.error("Google login error:", err);
      Swal.fire(
        "Error",
        "Something went wrong with Google login. Try again later.",
        "error"
      );
    } finally {
      setGoogleLoading(false);
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
        <Link
          to="/signup"
          className="hidden md:block text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium"
        >
          Don't have an account?{" "}
          <span className="text-green-600 font-semibold hover:text-green-700">
            Sign Up
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
                      Welcome Back to
                      <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        {" "}
                        MoneyTracker
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Continue tracking your finances and reach your goals.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Secure
                      </div>
                      <div className="text-xs text-gray-500">Login</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Fast
                      </div>
                      <div className="text-xs text-gray-500">Access</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Free
                      </div>
                      <div className="text-xs text-gray-500">Forever</div>
                    </div>
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
                {/* Title */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Welcome Back
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Sign In to Your Account
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Access your financial dashboard
                  </p>
                </div>

                {/* Form */}
                <form
                  className="space-y-4"
                  onSubmit={handleSubmit(handleLogin)}
                >
                  <div className="space-y-3">
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

                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password", {
                          required: "Password is required",
                        })}
                        placeholder="••••••••"
                        className={`w-full px-3 py-2.5 pr-10 bg-white border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm ${
                          errors.password ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-gray-500 hover:text-green-600 transition-colors duration-200"
                      >
                        {showPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          tabIndex={-1}
                          {...register("remember")}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>

                      {/* Forgot Password Link */}
                      <Link
                        to="/forgot-password"
                        tabIndex={-1}
                        className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-300"
                      >
                        Forgot password?
                      </Link>
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
                      "Sign In"
                    )}
                  </button>
                </form>

                {/* Alternative Sign In */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-3 text-xs text-gray-500 bg-white">
                      Or
                    </span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  <button
                    onClick={() => loginWithGoogle()}
                    disabled={googleLoading}
                    className="w-full bg-white border-2 border-gray-200 hover:border-green-300 text-gray-700 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        {/* Use the Google logo from public folder */}
                        <img
                          src="/google.svg"
                          alt="Google"
                          className="w-4 h-4"
                        />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Links */}
                <div className="mt-4 space-y-3">
                  <div className="text-center">
                    <Link
                      to="/email-verification"
                      tabIndex={-1}
                      className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-300"
                    >
                      Need to verify your email?
                    </Link>
                  </div>

                  {/* Mobile Sign Up Link */}
                  <div className="md:hidden text-center">
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

                {/* Security Note */}
                <div className="mt-4">
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-center text-xs text-green-700 flex items-center justify-center space-x-1">
                      <span className="text-green-600">🔒</span>
                      <span>Your data is safe and never shared</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
