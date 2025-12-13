import { useRef } from "react";
import { User, Mail, CreditCard, ChevronRight, Camera, Save, Loader2, Globe } from "lucide-react";
import { SUPPORTED_CURRENCIES } from "../../utils/currency";
import { useTranslation } from "react-i18next";

export default function ProfileSettings({
  formData,
  setFormData,
  previewUrl,
  setPreviewUrl,
  setAvatarFile,
  onSave,
  isSaving,
}) {
  const fileInputRef = useRef(null);
  const { t, i18n } = useTranslation();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    let newCurrency = formData.currency;

    // Smart Sync: Update currency based on language
    if (lang === 'zh') newCurrency = 'CNY';
    if (lang === 'fil') newCurrency = 'PHP';
    if (lang === 'en') newCurrency = 'USD';

    setFormData({ ...formData, language: lang, currency: newCurrency });
    i18n.changeLanguage(lang);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-8 border-b border-gray-100">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500 border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewUrl(null)}
              />
            ) : (
              <span>{formData.name?.[0]?.toUpperCase() || "U"}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-1 right-1 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Camera size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('app.settings.profile.title')}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-base">
            {t('app.settings.profile.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {t('app.settings.profile.fullName')}
          </label>
          <div className="relative">
            <User
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 dark:focus:border-gray-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder={t('app.settings.profile.namePlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {t('app.settings.profile.email')}
          </label>
          <div className="relative">
            <Mail
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 text-base cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
            {t('app.settings.profile.emailImmutable')}
          </p>
        </div>

        {/* Language Selector */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {t('app.settings.profile.language')}
          </label>
          <div className="relative">
            <Globe
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <select
              value={formData.language}
              onChange={handleLanguageChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 dark:focus:border-gray-500 outline-none appearance-none cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <option value="en">English</option>
              <option value="fil">Filipino</option>
              <option value="zh">中文 (Chinese)</option>
            </select>
            <ChevronRight
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 rotate-90 pointer-events-none"
            />
          </div>
        </div>

        {/* Currency Selector */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {t('app.settings.profile.currency')}
          </label>
          <div className="relative">
            <CreditCard
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 dark:focus:border-gray-500 outline-none appearance-none cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} - {c.name}
                </option>
              ))}
            </select>
            <ChevronRight
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 rotate-90 pointer-events-none"
            />
          </div>
        </div>
      </div>


      <div className="flex justify-end pt-8 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>{isSaving ? t('app.settings.profile.savingBtn') : t('app.settings.profile.saveBtn')}</span>
        </button>
      </div>
    </div>
  );
}
