import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Globe, ChevronDown } from "lucide-react";
import { LogoIcon } from "../components/Logo";
import { useTranslation } from "react-i18next";

export default function BlogPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false);
  };

  const postImages = [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1554224155-984063584d45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];
  const posts = t('blog.posts', { returnObjects: true });

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

      <main className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('blog.title')}</h1>
          <p className="text-xl text-gray-600">
            {t('blog.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-video bg-gray-100 rounded-2xl mb-4 overflow-hidden">
                <img src={postImages[i]} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
