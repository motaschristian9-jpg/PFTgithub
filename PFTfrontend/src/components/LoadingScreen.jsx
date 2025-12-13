import { LogoIcon } from "./Logo";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-1000 ease-in-out">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-[100px] opacity-50 animate-pulse-slow transition-colors duration-1000"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-violet-200/40 dark:bg-violet-500/10 rounded-full blur-[80px] opacity-50 animate-pulse-slow delay-700 transition-colors duration-1000"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center">
        {/* Logo Container */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          {/* Pulsing Rings */}
          <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-3xl animate-ping opacity-75 duration-1000 transition-colors"></div>
          <div className="absolute inset-0 bg-violet-500/10 dark:bg-violet-400/10 rounded-3xl animate-pulse duration-2000 transition-colors"></div>
          
          {/* Logo Icon */}
          <div className="relative z-10">
            <LogoIcon size={80} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-1000">
            Money<span className="text-blue-600 dark:text-blue-400 transition-colors duration-1000">Tracker</span>
          </h1>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce delay-0 transition-colors duration-1000"></div>
            <div className="w-2 h-2 bg-violet-600 dark:bg-violet-400 rounded-full animate-bounce delay-150 transition-colors duration-1000"></div>
            <div className="w-2 h-2 bg-teal-600 dark:bg-teal-400 rounded-full animate-bounce delay-300 transition-colors duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
