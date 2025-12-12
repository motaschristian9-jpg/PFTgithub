import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Bell, Smartphone } from "lucide-react";
import SettingsHeader from "../../components/settings/SettingsHeader.jsx";
import SettingsSidebar from "../../components/settings/SettingsSidebar.jsx";
import ProfileSettings from "../../components/settings/ProfileSettings.jsx";
import SecuritySettings from "../../components/settings/SecuritySettings.jsx";
import NotificationSettings from "../../components/settings/NotificationSettings.jsx";
import AppSettings from "../../components/settings/AppSettings.jsx";

import { useSettingsPageLogic } from "../../hooks/useSettingsPageLogic";

export default function SettingsPage() {
  const {
    user,
    activeTab,
    setActiveTab,
    isSaving,
    formData,
    setFormData,
    setAvatarFile,
    previewUrl,
    setPreviewUrl,
    handleSave,
    handleDeleteAccount,
    handleNotificationToggle,
  } = useSettingsPageLogic();

  return (
    <motion.div 
      className="space-y-8 p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <SettingsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div 
          className="lg:col-span-3 space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </motion.div>

        <motion.div 
          className="lg:col-span-9"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 p-6 lg:p-8 min-h-[500px] overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfileSettings
                    formData={formData}
                    setFormData={setFormData}
                    previewUrl={previewUrl}
                    setPreviewUrl={setPreviewUrl}
                    setAvatarFile={setAvatarFile}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SecuritySettings
                    user={user}
                    onDeleteAccount={handleDeleteAccount}
                  />
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <NotificationSettings
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    isSaving={isSaving}
                    onToggle={handleNotificationToggle}
                  />
                </motion.div>
              )}

              {activeTab === "app" && (
                <motion.div
                  key="app"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AppSettings />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
