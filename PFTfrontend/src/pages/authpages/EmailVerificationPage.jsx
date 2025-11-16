import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { resendVerificationEmail } from "../../api/auth";
import api from "../../api/axios";

export default function EmailVerificationPage() {
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEmailFromUrl, setIsEmailFromUrl] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    // Trigger entrance animations
    setIsVisible(true);

    // Get email from URL params if available
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setValue("email", decodeURIComponent(emailParam));
      setIsEmailFromUrl(true);
    }

    // Check if this is a verification callback from email
    const id = searchParams.get('id');
    const hash = searchParams.get('hash');
    const signature = searchParams.get('signature');

    if (id && hash && signature) {
      // This is a verification link from email - verify automatically
      handleEmailVerification(id, hash, signature);
    }
  }, [searchParams, setValue]);

  const handleEmailVerification = async (id, hash, signature) => {
    try {
      const response = await api.get(`/email/verify/${id}/${hash}?signature=${signature}`);
      if (response.data.success) {
        // Redirect directly to the login page URL returned from backend
        window.location.href = response.data.data.redirect_url;
      }
    } catch (err) {
      Swal.fire("Error", "Invalid or expired verification link.", "error");
    }
  };

  const handleResendEmail = async (formData) => {
    setLoading(true);
    try {
      await resendVerificationEmail(formData);
      Swal.fire("Success!", "Verification email sent. Please check your inbox.", "success");
    } catch (err) {
      if (err.response && err.response.data) {
        let errorMessage = "Failed to resend verification email";

        // Handle Laravel validation errors
        if (err.response.data.message) {
          if (typeof err.response.data.message === 'object' && err.response.data.message.email) {
            // Laravel validation error format: { message: { email: [...] } }
            errorMessage = err.response.data.message.email[0];
          } else if (typeof err.response.data.message === 'string') {
            // Simple string message
            errorMessage = err.response.data.message;
          }
        } else if (err.response.data.error) {
          // Alternative error format
          errorMessage = err.response.data.error;
        }

        Swal.fire("Error", errorMessage, "error");
      } else {
        Swal.fire("Error", "Something went wrong. Try again later.", "error");
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
        className={`relative z-10 flex justify-between items-center py-4 px-6 max-w-6xl mx-auto w-full transition-all duration-1000 ${
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
          Already verified?{" "}
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
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                      Verify Your
                      <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        {" "}
                        Email
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Check your inbox for a verification link to complete your account setup.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Secure
                      </div>
                      <div className="text-xs text-gray-500">Process</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        Instant
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
                    Email Verification Required
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Check Your Email
                  </h1>
                  <p className="text-gray-600 text-sm">
                    We've sent a verification link to your email address
                  </p>
                </div>

                {/* Email Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4 mb-6">
                  <div className="text-center">
                    <p className="text-gray-700 text-sm mb-2">
                      Didn't receive the email? Check your spam folder or click below to resend.
                    </p>
                  </div>

                  {/* Email Input for Resend */}
                  <form className="space-y-3" onSubmit={handleSubmit(handleResendEmail)}>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Your Email Address {isEmailFromUrl && <span className="text-green-600 text-xs">(from registration)</span>}
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
                      {isEmailFromUrl && (
                        <p className="text-xs text-gray-500 mt-1">
                          This email was provided during registration. You can change it if needed.
                        </p>
                      )}
                    </div>

                    {/* Resend Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm cursor-pointer mb-4"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      {loading ? "Sending..." : "Resend Verification Email"}
                    </button>
                  </form>
                </div>



                {/* Security Note */}
                <div className="mt-4">
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-center text-xs text-green-700 flex items-center justify-center space-x-1">
                      <span className="text-green-600">🔒</span>
                      <span>Your email verification is secure and encrypted</span>
                    </p>
                  </div>
                </div>

                {/* Mobile Sign In Link */}
                <div className="md:hidden text-center mt-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium text-sm"
                  >
                    Already verified?{" "}
                    <span className="text-green-600 font-semibold hover:text-green-700">
                      Sign In
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
