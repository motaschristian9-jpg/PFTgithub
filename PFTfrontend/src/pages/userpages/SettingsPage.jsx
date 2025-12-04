import { Bell, Smartphone } from "lucide-react";
import SettingsHeader from "../../components/settings/SettingsHeader.jsx";
import SettingsSidebar from "../../components/settings/SettingsSidebar.jsx";
import ProfileSettings from "../../components/settings/ProfileSettings.jsx";
import SecuritySettings from "../../components/settings/SecuritySettings.jsx";

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
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <SettingsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-2">
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="lg:col-span-9">
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 lg:p-8 min-h-[500px]">
            {activeTab === "profile" && (
              <ProfileSettings
                formData={formData}
                setFormData={setFormData}
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
                setAvatarFile={setAvatarFile}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}

            {activeTab === "security" && (
              <SecuritySettings
                user={user}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activeTab === "notifications" && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <Bell className="text-gray-300" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Notifications
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Notification settings coming soon.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "app" && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
