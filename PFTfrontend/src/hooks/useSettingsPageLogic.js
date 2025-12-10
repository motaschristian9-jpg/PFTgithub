import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { updateProfile, deleteAccount } from "../api/auth";
import { showSuccess, showError, confirmDelete } from "../utils/swal";

export const useSettingsPageLogic = () => {
  const { user, setUser } = useAuth();
  const isGoogleUser = user?.login_method === "google";

  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currency: "USD",
    email_notifications_enabled: true,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currency: user.currency || "USD",
        email_notifications_enabled: user.email_notifications_enabled ?? true,
      });
      if (user.avatar_url) {
        setPreviewUrl(user.avatar_url);
      }

      if (activeTab === "security" && isGoogleUser) {
        setActiveTab("profile");
      }
    }
  }, [user, isGoogleUser]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("currency", formData.currency);
      data.append("email_notifications_enabled", formData.email_notifications_enabled ? "1" : "0");

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const response = await updateProfile(data);

      if (response?.data?.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);

        const currentStorage = localStorage.getItem("user");
        if (currentStorage) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }

      showSuccess("Settings Saved!", "Your preferences have been updated successfully.");
    } catch (error) {
      console.error("Update failed:", error);

      showError(
        "Update Failed",
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSaving(false);
    }

  };

  const handleDeleteAccount = async () => {
    const result = await confirmDelete(
      "Are you sure?",
      "You won't be able to revert this! All your data will be permanently deleted."
    );

    if (result.isConfirmed) {
      try {
        await deleteAccount();
        showSuccess("Deleted!", "Your account has been deleted.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/login";
      } catch (error) {
        showError(
          "Error",
          error.response?.data?.message || "Failed to delete account."
        );
      }
    }
  };

  return {
    user,
    setUser,
    isGoogleUser,
    activeTab,
    setActiveTab,
    isSaving,
    formData,
    setFormData,
    avatarFile,
    setAvatarFile,
    previewUrl,
    setPreviewUrl,
    handleSave,
    handleDeleteAccount,
  };
};
