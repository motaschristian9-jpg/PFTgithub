import React from "react";
import { Bell, Mail } from "lucide-react";

export default function NotificationSettings({
  formData,
  setFormData, // Still accepted but maybe unused for this specific field now, or consistent interface
  onSave,      // Unused now for this component, but kept for props compatibility if needed
  isSaving,
  onToggle,    // New prop
}) {
  const handleChange = (e) => {
    const { checked } = e.target;
    // Call the auto-save toggle handler
    if (onToggle) {
        onToggle(checked);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage how you receive notifications.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-600">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive emails about account activity and updates.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="email_notifications_enabled"
              checked={formData.email_notifications_enabled ?? true}
              onChange={handleChange}
              disabled={isSaving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      {/* 
         Removed "Save Changes" button as requested.
         The toggle now saves automatically.
      */}
    </div>
  );
}
