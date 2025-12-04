import { LogoIcon } from "./Logo";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-violet-200/40 rounded-full blur-[80px] opacity-50 animate-pulse-slow delay-700"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center">
        {/* Logo Container */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          {/* Pulsing Rings */}
          <div className="absolute inset-0 bg-blue-500/20 rounded-3xl animate-ping opacity-75 duration-1000"></div>
          <div className="absolute inset-0 bg-violet-500/10 rounded-3xl animate-pulse duration-2000"></div>
          
          {/* Logo Icon */}
          <div className="relative z-10">
            <LogoIcon size={80} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Money<span className="text-blue-600">Tracker</span>
          </h1>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-0"></div>
            <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
