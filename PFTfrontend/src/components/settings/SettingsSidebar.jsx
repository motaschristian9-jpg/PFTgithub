import { User, Shield, Bell, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SettingsSidebar({ activeTab, setActiveTab }) {
  const { t } = useTranslation();
  const tabs = [
    { id: "profile", label: t('app.settings.sidebar.profile'), icon: User },
    { id: "security", label: t('app.settings.sidebar.security'), icon: Shield },
    { id: "notifications", label: t('app.settings.sidebar.notifications'), icon: Bell },
    { id: "app", label: t('app.settings.sidebar.app'), icon: Smartphone },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 overflow-hidden">
      <nav className="flex flex-col p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
