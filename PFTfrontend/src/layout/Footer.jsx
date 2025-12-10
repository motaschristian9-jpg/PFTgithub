import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-green-100/50 py-6 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-1">

          <span>© 2025</span>
          <span className="font-bold text-gray-900">
            Money<span className="text-blue-600">Tracker</span>
          </span>
          <span>· All rights reserved</span>
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <span>Follow us:</span>
          <div className="flex space-x-3 text-gray-400">
            <a href="#" className="hover:text-blue-600 hover:scale-110 transition-all">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-pink-600 hover:scale-110 transition-all">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:text-gray-900 hover:scale-110 transition-all">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
