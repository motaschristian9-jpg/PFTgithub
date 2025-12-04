import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100 animate-float">
          <AlertCircle className="text-blue-600" size={48} />
        </div>
        
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Page Not Found
        </h2>
        
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <Home size={20} />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
