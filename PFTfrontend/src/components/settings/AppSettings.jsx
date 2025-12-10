import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function AppSettings() {
  const { theme, updateTheme } = useTheme();

  const themes = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Clean and bright interface',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes in low light',
    },
    {
      id: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Matches your device settings',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1 pb-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Appearance</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Customize how the application looks on your device.
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
