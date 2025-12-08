import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginUser } from "../api/auth";
import { setToken } from "../api/axios";
import { useUserContext } from "../context/UserContext";
import { showSuccess, showError } from "../utils/swal";

export const useLoginLogic = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, isLoading: userLoading, user } = useUserContext();

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
    setIsVisible(true);
    const emailParam = searchParams.get("email");
    if (emailParam) {
      // Logic to pre-fill if needed, currently just checking existence
    }

    const error = searchParams.get("error");
    const message = searchParams.get("message");
    if (error && message) {
      showError(decodeURIComponent(message));
      // Clean up URL
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);



  const handleLogin = async (formData) => {
    setLoading(true);
    try {
      const result = await loginUser(formData);
      setToken(result.data.token, formData.remember);
      setUser(result.data.user);
      showSuccess("Login Successful! Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data) {
        let errorMessage = "Login failed";
        let errorField = "root";

        if (err.response.data.errors) {
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
            if (err.response.data.message.email) {
              errorMessage = Array.isArray(err.response.data.message.email)
                ? err.response.data.message.email[0]
                : err.response.data.message.email;
              errorField = "email";
            } else if (err.response.data.message.password) {
              errorMessage = Array.isArray(err.response.data.message.password)
                ? err.response.data.message.password[0]
                : err.response.data.message.password;
              errorField = "password";
            }
          }
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }

        if (
          errorMessage.includes("Google OAuth") ||
          errorMessage.includes("Continue with Google")
        ) {
          showError(errorMessage);
        } else {
          setError(errorField, { message: errorMessage });
          if (errorField === "root") {
            showError(errorMessage);
          }
        }
      } else {
        showError("Something went wrong. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/google/login?state=login&redirect_uri=http://localhost:5173/auth/google/callback"
      );

      if (!response.ok) {
        throw new Error("Failed to get Google OAuth URL");
      }

      const data = await response.json();

      if (data.success) {
        window.location.href = data.redirect_url;
      } else {
        showError(data.message || "Failed to initiate Google login");
      }
    } catch (err) {
      console.error("Google login error:", err);
      showError("Something went wrong with Google login. Try again later.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    showPassword,
    setShowPassword,
    isVisible,
    loading,
    googleLoading,
    register,
    handleSubmit,
    errors,
    handleLogin,
    loginWithGoogle,
  };
};
