export default function Footer() {
  return (
    <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-green-100/50 py-6 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <span>© 2025</span>
          <span className="font-semibold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            MoneyTracker
          </span>
          <span>· All rights reserved</span>
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <span>Follow us:</span>
          <div className="flex space-x-2 text-lg">
            <span className="hover:scale-110 transition-transform cursor-pointer">
              🌐
            </span>
            <span className="hover:scale-110 transition-transform cursor-pointer">
              📘
            </span>
            <span className="hover:scale-110 transition-transform cursor-pointer">
              🐦
            </span>
            <span className="hover:scale-110 transition-transform cursor-pointer">
              📸
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
