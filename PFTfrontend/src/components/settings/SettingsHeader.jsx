import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";

export default function SettingsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account preferences and security
        </p>
      </div>
    </div>
  );
}
