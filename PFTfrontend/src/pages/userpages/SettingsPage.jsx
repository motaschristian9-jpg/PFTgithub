import { motion, AnimatePresence } from "framer-motion";
import { Bell, Smartphone } from "lucide-react";
import SettingsHeader from "../../components/settings/SettingsHeader.jsx";
import SettingsSidebar from "../../components/settings/SettingsSidebar.jsx";
import ProfileSettings from "../../components/settings/ProfileSettings.jsx";
import SecuritySettings from "../../components/settings/SecuritySettings.jsx";
import NotificationSettings from "../../components/settings/NotificationSettings.jsx";

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
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 lg:p-8 min-h-[500px] overflow-hidden">
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
                  className="flex flex-col items-center justify-center h-full text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                    <Smartphone className="text-gray-300" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      App Settings
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Application preferences coming soon.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
