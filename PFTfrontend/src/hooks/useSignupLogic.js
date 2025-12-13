import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { registerUser } from "../api/auth";
import { showSuccess, showError } from "../utils/swal";
import { useTranslation } from "react-i18next";

export const useSignupLogic = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

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

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSignup = async (formData) => {
    setLoading(true);
    try {
      const result = await registerUser(formData);
      showSuccess(
        result.message ||
          "Account created successfully. Please check your email to verify your account."
      );
      setTimeout(
        () =>
          navigate(
            `/email-verification?email=${encodeURIComponent(formData.email)}`
          ),
        1500
      );
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          Object.keys(err.response.data.errors).forEach((field) => {
            setError(field, {
              type: "server",
              message: err.response.data.errors[field][0],
            });
          });
        } else if (err.response.data.message) {
          if (
            typeof err.response.data.message === "object" &&
            err.response.data.message.email
          ) {
            setError("email", {
              type: "server",
              message: err.response.data.message.email[0],
            });
          } else if (typeof err.response.data.message === "string") {
            showError(err.response.data.message);
          }
        } else if (err.response.data.error) {
          showError(err.response.data.error);
        } else {
          showError(
            "Registration failed. Please check your information and try again."
          );
        }
      } else {
        showError(t('app.swal.errorText'));
      }
    } finally {
      setLoading(false);
    }
  };

  const signupWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const targetUrl = `${baseUrl}/auth/google/login?state=signup&redirect_uri=${redirectUri}`;

      const response = await fetch(targetUrl);

      if (!response.ok) {
        throw new Error("Failed to get Google OAuth URL");
      }

      const data = await response.json();

      if (data.success) {
        window.location.href = data.redirect_url;
      } else {
        showError(data.message || t('app.swal.googleSignupInitError'));
      }
    } catch (err) {
      console.error("Google signup error:", err);
      showError(t('app.swal.googleSignupError'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isVisible,
    loading,
    googleLoading,
    register,
    handleSubmit,
    errors,
    password,
    handleSignup,
    signupWithGoogle,
  };
};
