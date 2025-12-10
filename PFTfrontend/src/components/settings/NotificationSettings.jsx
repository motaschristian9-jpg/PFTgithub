import React from "react";
import { Bell, Mail } from "lucide-react";

export default function NotificationSettings({
  formData,
  setFormData,
  onSave,
  isSaving,
}) {
  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-500">
          Manage how you receive notifications.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">
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
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
