import { Facebook, Instagram, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-green-100/50 dark:border-gray-800 py-6 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-1">

          <span>© 2025</span>
          <span className="font-bold text-gray-900 dark:text-white">
            Money<span className="text-blue-600 dark:text-blue-400">Tracker</span>
          </span>
          <span>· {t('app.footer.rights')}</span>
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <span>{t('app.footer.followUs')}</span>
          <div className="flex space-x-3 text-gray-400">
            <a href="https://web.facebook.com/profile.php?id=61584426275753&_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/yourpersonal.moneytracker/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 dark:hover:text-pink-400 hover:scale-110 transition-all">
              <Instagram size={20} />
            </a>
            <a href="https://x.com/money_tracker01" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white hover:scale-110 transition-all">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
