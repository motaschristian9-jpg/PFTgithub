import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Phone, Globe, ChevronDown } from "lucide-react";
import { LogoIcon } from "../components/Logo";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false);
  };

  const icons = [MessageSquare, Mail, Phone];
  const methods = t('contact.methods', { returnObjects: true });

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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('contact.title')}</h1>
          <p className="text-xl text-gray-600">
            {t('contact.intro')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {methods.map((item, i) => {
            const Icon = icons[i] || MessageSquare;
            return (
              <div key={i} className="bg-gray-50 p-8 rounded-3xl text-center border border-gray-100">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-sm">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-6">{item.desc}</p>
                <span className="text-blue-600 font-semibold">{item.action}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 max-w-2xl mx-auto shadow-xl shadow-gray-100">
          <h3 className="text-2xl font-bold mb-6">{t('contact.form.title')}</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('contact.form.firstName')}</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('contact.form.lastName')}</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('contact.form.email')}</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('contact.form.message')}</label>
              <textarea className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32" placeholder="How can we help?" />
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              {t('contact.form.button')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
