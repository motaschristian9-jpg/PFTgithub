import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { showSuccess, showCustomAlert } from "../utils/swal";
import { useTranslation } from "react-i18next";

export const useGoogleCallbackLogic = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useUserContext();

  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      try {
        const success = searchParams.get("success");
        const error = searchParams.get("error");
        const message = searchParams.get("message");
        const action = searchParams.get("action");
        const token = searchParams.get("token");
        const user = searchParams.get("user");

        if (success === "true") {
          if (action === "login") {
            localStorage.setItem("token", decodeURIComponent(token));
            localStorage.setItem("user", decodeURIComponent(user));

            showSuccess(t('app.swal.loginSuccess'));
            setUser(JSON.parse(decodeURIComponent(user)));
            setIsAuthenticated(true);
            navigate("/dashboard");
          } else if (action === "created_no_login") {
            showCustomAlert({
              title: "Account Created!",
              text: decodeURIComponent(message),
              icon: "success",
              confirmButtonText: "Continue to Login",
              showCancelButton: false,
              allowOutsideClick: false,
            }).then(() => {
              navigate("/login");
            });
          } else {
            throw new Error("Unexpected action from server");
          }
        } else if (error) {
          let errorMessage =
            decodeURIComponent(message) ||
            "Something went wrong during authentication";

          if (error === "account_exists") {
            showCustomAlert({
              title: "Account Already Exists",
              text: errorMessage,
              icon: "info",
              confirmButtonText: "Go to Login",
              showCancelButton: false,
              allowOutsideClick: false,
            }).then(() => {
              navigate("/login");
            });
          } else if (error === "email_not_verified") {
            showCustomAlert({
              title: "Email Not Verified",
              text: errorMessage,
              icon: "warning",
              confirmButtonText: "Go to Login",
              showCancelButton: false,
              allowOutsideClick: false,
            }).then(() => {
              navigate("/login");
            });
          } else {
            showCustomAlert({
              title: "Authentication Failed",
              text: errorMessage,
              icon: "error",
              confirmButtonText: "Try Again",
            }).then(() => {
              navigate("/login");
            });
          }
        } else {
          throw new Error(
            "Invalid callback parameters. Please try logging in again."
          );
        }
      } catch (error) {
        console.error("Google OAuth callback error:", error);

        let errorMessage =
          error.message || "Something went wrong during authentication";

        if (errorMessage.includes("email_not_verified")) {
          errorMessage =
            "This email is already registered but not verified. Please verify your email first.";
        }

        showCustomAlert({
          title: "Authentication Failed",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "Try Again",
        }).then(() => {
          const state = searchParams.get("state");
          if (state === "signup") {
            navigate("/signup");
          } else {
            navigate("/login");
          }
        });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser, setIsAuthenticated]);

  return { loading };
};
