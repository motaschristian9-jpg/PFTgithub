import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SettingsHeader() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t('app.settings.header.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('app.settings.header.subtitle')}
        </p>
      </div>
    </div>
  );
}
