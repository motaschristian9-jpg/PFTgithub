import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Globe, ChevronDown } from "lucide-react";
import { LogoIcon } from "../components/Logo";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false);
  };

  const icons = [Shield, Lock, Eye];
  const sections = t('privacy.sections', { returnObjects: true });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <nav className="border-b border-gray-100 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
            <LogoIcon size={28} />
            <span className="text-xl font-bold text-gray-900">MoneyTracker</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <Globe size={18} />
                <span className="uppercase">{i18n.language === 'zh' ? 'CN' : i18n.language}</span>
                <ChevronDown size={14} />
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'fil', label: 'Filipino' },
                    { code: 'zh', label: '中文 (CN)' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${i18n.language === lang.code ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => navigate("/")} className="text-sm font-medium text-gray-600 hover:text-blue-600">
              {t('common.backToHome')}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('privacy.title')}</h1>
          <p className="text-gray-500">{t('privacy.lastUpdated')}</p>
        </div>

        <div className="prose prose-lg text-gray-600">
          <p>
            {t('privacy.intro')}
          </p>

          {sections.map((section, i) => {
            const Icon = icons[i] || Shield;
            return (
              <div key={i}>
                <h3 className="text-gray-900 font-bold mt-8 mb-4 flex items-center gap-2">
                  <Icon size={20} className="text-blue-600" /> {section.title}
                </h3>
                <p>
                  {section.content}
                </p>
              </div>
            );
          })}

          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">{t('privacy.contact.title')}</h4>
            <p className="text-sm">
              {t('privacy.contact.text')} <br />
              <span className="text-blue-600 font-medium">privacy@moneytracker.com</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
