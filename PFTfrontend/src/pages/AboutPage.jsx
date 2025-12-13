import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Award, Globe, ChevronDown } from "lucide-react";
import { LogoIcon } from "../components/Logo";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false);
  };

  const icons = [Users, Award, Globe];
  const values = t('about.values', { returnObjects: true });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Simple Nav */}
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

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {t('about.intro')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {values.map((item, i) => {
            const Icon = icons[i] || Globe;
            return (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="prose prose-lg text-gray-600">
          <p>
            {t('about.history.p1')}
          </p>
          <p>
            {t('about.history.p2')}
          </p>
        </div>
      </main>
    </div>
  );
}
