import { Wallet } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 flex items-center justify-center">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-green-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/30 to-green-200/20 rounded-full blur-2xl"></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Icon with Spinner */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet className="text-white" size={32} />
          </div>
          {/* Spinner Overlay */}
          <div className="absolute inset-0 rounded-2xl border-4 border-green-200 border-t-green-600 animate-spin"></div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
          MoneyTracker
        </h1>

        {/* Loading Text */}
        <p className="text-gray-600 text-sm">Loading your financial dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
