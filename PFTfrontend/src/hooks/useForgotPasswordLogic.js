import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { forgotPassword } from "../api/auth";
import MySwal, { showSuccess, showError } from "../utils/swal";

export const useForgotPasswordLogic = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleForgotPassword = async (formData) => {
    setLoading(true);
    try {
      await forgotPassword(formData.email);

      setEmailSent(true);
      showSuccess(
        "Email Sent!",
        "We've sent a password reset link to your email address."
      );
    } catch (err) {
      let errorMessage = "Something went wrong. Try again later.";
      let isGoogleError = false;

      if (err.response && err.response.data) {
        const responseData = err.response.data;

        if (
          responseData.message &&
          typeof responseData.message === "string" &&
          responseData.message.includes("Google")
        ) {
          errorMessage = responseData.message;
          isGoogleError = true;
        } else if (responseData.errors?.email) {
          errorMessage = Array.isArray(responseData.errors.email)
            ? responseData.errors.email[0]
            : responseData.errors.email;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      }

      if (isGoogleError) {
        MySwal.fire({
          icon: "info",
          title: "Google Account Detected",
          text: "This account was created using Google. Please use the 'Continue with Google' button to sign in.",
          confirmButtonText: "Go to Login",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          }
        });
      } else {
        if (
          errorMessage.includes("email") ||
          errorMessage.includes("account found")
        ) {
          setError("email", { message: errorMessage });
        } else {
          showError("Error", errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    emailSent,
    setEmailSent,
    isVisible,
    register,
    handleSubmit,
    errors,
    getValues,
    handleForgotPassword,
  };
};
