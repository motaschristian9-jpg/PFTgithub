import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { registerUser } from "../../api/auth";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    // Trigger entrance animations
    setIsVisible(true);
  }, []);

  const handleSignup = async (formData) => {
    setLoading(true);
    try {
      const result = await registerUser(formData);

      // Success - use SweetAlert for positive feedback
      Swal.fire("Success!", result.message || "Account created successfully. Please check your email to verify your account.", "success");

      setTimeout(() => navigate(`/email-verification?email=${encodeURIComponent(formData.email)}`), 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        // Handle Laravel validation errors - set them in form state for inline display
        if (err.response.data.errors) {
          // Laravel validation errors format: { errors: { field: [messages] } }
          Object.keys(err.response.data.errors).forEach(field => {
            setError(field, {
              type: "server",
              message: err.response.data.errors[field][0]
            });
          });
        } else if (err.response.data.message) {
          if (typeof err.response.data.message === 'object' && err.response.data.message.email) {
            // Alternative Laravel format: { message: { email: [...] } }
            setError("email", {
              type: "server",
              message: err.response.data.message.email[0]
            });
          } else if (typeof err.response.data.message === 'string') {
            // General server message - use SweetAlert for non-form errors
            Swal.fire("Error", err.response.data.message, "error");
          }
        } else if (err.response.data.error) {
          // Alternative error format
          Swal.fire("Error", err.response.data.error, "error");
        } else {
          // Fallback for unexpected error format
          Swal.fire("Error", "Registration failed. Please check your information and try again.", "error");
        }
      } else {
        // Network or other critical errors - use SweetAlert
        Swal.fire("Error", "Something went wrong. Please check your connection and try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const signupWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      // Get the Google OAuth URL from backend with signup state
      const response = await fetch("http://127.0.0.1:8000/api/auth/google/login?state=signup&redirect_uri=http://localhost:5173/auth/google/callback");
      console.log(response);

      if (!response.ok) {
        throw new Error('Failed to get Google OAuth URL');
      }

      const data = await response.json();

      if (data.success) {
        // Redirect to Google OAuth
        window.location.href = data.redirect_url;
      } else {
        Swal.fire("Error", data.message || "Failed to initiate Google signup", "error");
      }
    } catch (err) {
      console.error('Google signup error:', err);
      Swal.fire("Error", "Something went wrong with Google signup. Try again later.", "error");
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
          to="/login"
          className="hidden md:block text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium"
        >
          Already have an account?{" "}
          <span className="text-green-600 font-semibold hover:text-green-700">
            Sign In
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
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                      Take Control of Your
                      <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        {" "}
                        Finances
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Track income, expenses, and savings effortlessly.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        10K+
                      </div>
                      <div className="text-xs text-gray-500">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        4.9★
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
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
                    Get Started Free
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Start tracking your finances in minutes
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit(handleSignup)}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...register("name", {
                          required: "Full name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                          },
                        })}
                        placeholder="John Doe"
                        className={`w-full px-3 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 hover:border-green-300 text-sm ${
                          errors.name ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>

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
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Confirm Password
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
                        tabIndex={-1}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-8 text-gray-500 hover:text-green-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
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
                      "Sign Up"
                    )}
                  </button>
                </form>

                {/* Alternative Sign Up */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-3 text-xs text-gray-500 bg-white">
                      Or
                    </span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  <button
                    onClick={() => signupWithGoogle()}
                    disabled={googleLoading}
                    className="w-full bg-white border-2 border-gray-200 hover:border-green-300 text-gray-700 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        {/* Use the Google logo from public folder */}
                        <img src="/google.svg" alt="Google" className="w-4 h-4" />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Security Note & Mobile Sign In */}
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-center text-xs text-green-700 flex items-center justify-center space-x-1">
                      <span className="text-green-600">🔒</span>
                      <span>Your data is safe and never shared</span>
                    </p>
                  </div>

                  {/* Mobile Sign In Link */}
                  <div className="md:hidden text-center">
                    <Link
                      to="/login"
                      className="text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium text-sm"
                    >
                      Already have an account?{" "}
                      <span className="text-green-600 font-semibold hover:text-green-700">
                        Sign In
                      </span>
                    </Link>
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
