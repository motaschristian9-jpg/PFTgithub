import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function AppSettings() {
  const { theme, updateTheme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    {
      id: 'light',
      label: t('app.settings.app.light'),
      icon: Sun,
      description: t('app.settings.app.lightDesc'),
    },
    {
      id: 'dark',
      label: t('app.settings.app.dark'),
      icon: Moon,
      description: t('app.settings.app.darkDesc'),
    },
    {
      id: 'system',
      label: t('app.settings.app.system'),
      icon: Monitor,
      description: t('app.settings.app.systemDesc'),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1 pb-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('app.settings.app.title')}</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t('app.settings.app.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;

          return (
            <button
              key={t.id}
              onClick={() => updateTheme(t.id)}
              className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                isActive
                  ? 'border-gray-900 bg-gray-50 dark:border-white dark:bg-gray-800'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-gray-600'
              }`}
            >
              <div 
                className={`p-3 rounded-full mb-3 transition-colors ${
                  isActive 
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                <Icon size={24} />
              </div>
              <span className={`font-semibold mb-1 ${
                isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {t.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {t.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
