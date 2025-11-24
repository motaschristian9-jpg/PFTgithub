import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import { useUserContext } from "../../context/UserContext";

export default function GoogleCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useUserContext();

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
            // Save token and user info to localStorage
            localStorage.setItem('token', decodeURIComponent(token));
            localStorage.setItem('user', decodeURIComponent(user));

            Swal.fire({
              title: "Login Successful!",
              text: "Welcome back!",
              icon: "success",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            }).then(() => {
              // Update context state to trigger re-render & navigate
              setUser(JSON.parse(decodeURIComponent(user)));
              setIsAuthenticated(true);
              navigate("/dashboard");
            });
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
  }, [searchParams, navigate, setUser, setIsAuthenticated]);

  return (
    <></>
  );
}
