import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { resendVerificationEmail } from "../api/auth";
import api from "../api/axios";
import { showSuccess, showError } from "../utils/swal";

export const useEmailVerificationLogic = () => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEmailFromUrl, setIsEmailFromUrl] = useState(false);
  const [searchParams] = useSearchParams();

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
    setIsVisible(true);

    const emailParam = searchParams.get("email");
    if (emailParam) {
      setValue("email", decodeURIComponent(emailParam));
      setIsEmailFromUrl(true);
    }

    const id = searchParams.get("id");
    const hash = searchParams.get("hash");
    const signature = searchParams.get("signature");

    if (id && hash && signature) {
      handleEmailVerification(id, hash, signature);
    }
  }, [searchParams, setValue]);

  const handleEmailVerification = async (id, hash, signature) => {
    try {
      const response = await api.get(
        `/email/verify/${id}/${hash}?signature=${signature}`
      );
      if (response.data.success) {
        window.location.href = response.data.data.redirect_url;
      }
    } catch (err) {
      showError("Error", "Invalid or expired verification link.");
    }
  };

  const handleResendEmail = async (formData) => {
    setLoading(true);
    try {
      await resendVerificationEmail(formData);
      showSuccess("Success!", "Verification email sent. Please check your inbox.");
    } catch (err) {
      if (err.response && err.response.data) {
        let errorMessage = "Failed to resend verification email";

        if (err.response.data.message) {
          if (
            typeof err.response.data.message === "object" &&
            err.response.data.message.email
          ) {
            errorMessage = err.response.data.message.email[0];
          } else if (typeof err.response.data.message === "string") {
            errorMessage = err.response.data.message;
          }
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }

        showError("Error", errorMessage);
      } else {
        showError("Error", "Something went wrong. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    isVisible,
    isEmailFromUrl,
    register,
    handleSubmit,
    errors,
    handleResendEmail,
  };
};
