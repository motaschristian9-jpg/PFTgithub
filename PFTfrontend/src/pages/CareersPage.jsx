import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Clock, Globe, ChevronDown } from "lucide-react";
import { LogoIcon } from "../components/Logo";
import { useTranslation } from "react-i18next";

export default function CareersPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false);
  };

  const jobs = t('careers.jobs', { returnObjects: true });

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

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('careers.title')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('careers.intro')}
          </p>
        </div>

        <div className="space-y-4">
          {jobs.map((job, i) => (
            <div key={i} className="group bg-white border border-gray-200 p-6 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.role}</h3>
                  <p className="text-gray-500 mt-1">{job.dept}</p>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} /> {job.loc}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} /> {job.type}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">{t('careers.cta.title')}</h3>
          <p className="text-gray-600 mb-6">
            {t('careers.cta.text')}
          </p>
          <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
            {t('careers.cta.button')}
          </button>
        </div>
      </main>
    </div>
  );
}
