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

  const handleNotificationToggle = async (enabled) => {
    // Optimistic Update
    setFormData((prev) => ({ ...prev, email_notifications_enabled: enabled }));

    try {
      const data = new FormData();
      // We need to send other required fields if the backend requires them for a "profile update", 
      // but typically we should send what we have. 
      // Based on typical updateProfile implementations, it often updates whatever is passed.
      // Safest is to pass current state for others + new value for toggle.
      // BUT current formData might be stale? No, it's state.
      data.append("name", formData.name);
      data.append("currency", formData.currency);
      data.append("email_notifications_enabled", enabled ? "1" : "0");
      
      // We don't append avatar here as we aren't changing it and don't want to re-upload undefined

      const response = await updateProfile(data);

      if (response?.data?.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        const currentStorage = localStorage.getItem("user");
        if (currentStorage) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
      
      // Optional: Show a small toast
      showSuccess("Preferences Updated", enabled ? "Email notices enabled" : "Email notices disabled");
    } catch (error) {
      console.error("Toggle failed", error);
      // Revert optimism
      setFormData((prev) => ({ ...prev, email_notifications_enabled: !enabled }));
      showError("Update Failed", "Could not update preference");
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
    handleNotificationToggle,
  };
};
