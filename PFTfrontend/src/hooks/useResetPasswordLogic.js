import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { resetPassword } from "../api/auth";
import { showSuccess, showError } from "../utils/swal";

export const useResetPasswordLogic = () => {
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
    setIsVisible(true);

    const urlToken = searchParams.get("token") || token;

    if (!urlToken) {
      setTokenValid(false);
      return;
    }
  }, [token, searchParams]);

  const handleResetPassword = async (formData) => {
    setLoading(true);
    try {
      const resetToken = searchParams.get("token") || token;
      const email = searchParams.get("email");

      if (!email) {
        setError("password", {
          message: "Invalid reset link. Email parameter missing.",
        });
        return;
      }

      await resetPassword({
        email: email,
        token: resetToken,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      showSuccess(
        "Password Reset!",
        "Your password has been successfully reset. You can now log in with your new password."
      );
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          if (errors.password) {
            setError("password", {
              message: Array.isArray(errors.password)
                ? errors.password[0]
                : errors.password,
            });
          } else if (errors.password_confirmation) {
            setError("password_confirmation", {
              message: Array.isArray(errors.password_confirmation)
                ? errors.password_confirmation[0]
                : errors.password_confirmation,
            });
          }
        } else if (err.response.data.message) {
          if (typeof err.response.data.message === "string") {
            setError("password", { message: err.response.data.message });
          } else if (typeof err.response.data.message === "object") {
            if (err.response.data.message.password) {
              setError("password", {
                message: Array.isArray(err.response.data.message.password)
                  ? err.response.data.message.password[0]
                  : err.response.data.message.password,
              });
            } else if (err.response.data.message.password_confirmation) {
              setError("password_confirmation", {
                message: Array.isArray(
                  err.response.data.message.password_confirmation
                )
                  ? err.response.data.message.password_confirmation[0]
                  : err.response.data.message.password_confirmation,
              });
            }
          }
        } else if (err.response.data.error) {
          setError("password", { message: err.response.data.error });
        } else {
          showError("Something went wrong. Try again later.");
        }
      } else {
        showError("Something went wrong. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    tokenValid,
    isVisible,
    register,
    handleSubmit,
    errors,
    password,
    handleResetPassword,
  };
};
