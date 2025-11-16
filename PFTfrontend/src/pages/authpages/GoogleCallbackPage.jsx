import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";

export default function GoogleCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have query params from backend redirect
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const message = searchParams.get('message');
        const action = searchParams.get('action');
        const token = searchParams.get('token');
        const user = searchParams.get('user');

        if (success === 'true') {
          // Handle successful authentication from backend redirect
          if (action === 'login') {
            // Login successful - store token and redirect to dashboard
            localStorage.setItem('token', decodeURIComponent(token));
            localStorage.setItem('user', decodeURIComponent(user));

            Swal.fire({
              title: "Login Successful!",
              text: decodeURIComponent(message),
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });

            setTimeout(() => navigate('/dashboard'), 1500);
          } else if (action === 'created_no_login') {
            // Account created successfully, redirect to login
            Swal.fire({
              title: "Account Created!",
              text: decodeURIComponent(message),
              icon: "success",
              confirmButtonText: "Continue to Login",
              showCancelButton: false,
              allowOutsideClick: false,
            }).then(() => {
              navigate('/login');
            });
          } else {
            throw new Error('Unexpected action from server');
          }
        } else if (error) {
          // Handle error from backend redirect
          let errorMessage = decodeURIComponent(message) || 'Something went wrong during authentication';

          // Handle specific error types
          if (error === 'account_exists') {
            Swal.fire({
              title: "Account Already Exists",
              text: errorMessage,
              icon: "info",
              confirmButtonText: "Go to Login",
              showCancelButton: false,
              allowOutsideClick: false,
            }).then(() => {
              navigate('/login');
            });
          } else if (error === 'email_not_verified') {
            Swal.fire({
              title: "Email Not Verified",
              text: errorMessage,
              icon: "warning",
              confirmButtonText: "Go to Login",
              showCancelButton: false,
              allowOutsideClick: false,
            }).then(() => {
              navigate('/login');
            });
          } else {
            Swal.fire({
              title: "Authentication Failed",
              text: errorMessage,
              icon: "error",
              confirmButtonText: "Try Again",
            }).then(() => {
              navigate('/login');
            });
          }
        } else {
          // No valid query parameters from backend redirect - this shouldn't happen in normal flow
          throw new Error('Invalid callback parameters. Please try logging in again.');
        }

      } catch (error) {
        console.error('Google OAuth callback error:', error);

        let errorMessage = error.message || 'Something went wrong during authentication';

        // Handle specific error types
        if (errorMessage.includes('email_not_verified')) {
          errorMessage = 'This email is already registered but not verified. Please verify your email first.';
        }

        Swal.fire({
          title: "Authentication Failed",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "Try Again",
        }).then(() => {
          // Redirect based on state or default to login
          const state = searchParams.get('state');
          if (state === 'signup') {
            navigate('/signup');
          } else {
            navigate('/login');
          }
        });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-green-200/50 to-green-300/30 rounded-2xl blur opacity-60"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-green-100">
            <div className="space-y-4">
              {loading ? (
                <>
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <Loader2 className="animate-spin h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      Completing Authentication
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Please wait while we process your Google account...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      Redirecting...
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Taking you to the next step...
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
