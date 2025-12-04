import React from "react";

export const Logo = ({ className = "", textClassName = "", iconSize = 32 }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient
              id="logoGradient"
              x1="0"
              y1="0"
              x2="40"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#2563EB" /> {/* Royal Blue */}
              <stop offset="50%" stopColor="#7C3AED" /> {/* Violet */}
              <stop offset="100%" stopColor="#0D9488" /> {/* Teal */}
            </linearGradient>
          </defs>
          <rect
            width="40"
            height="40"
            rx="10"
            fill="url(#logoGradient)"
          />
          <path
            d="M11 27V13L20 22L29 13V27"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text */}
      <div className={`flex flex-col ${textClassName}`}>
        <span className="font-bold text-gray-900 tracking-tight leading-none text-lg">
          Money<span className="text-blue-600">Tracker</span>
        </span>
      </div>
    </div>
  );
};

export const LogoIcon = ({ size = 32, className = "" }) => {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient
            id="logoIconGradient"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#2563EB" /> {/* Royal Blue */}
            <stop offset="50%" stopColor="#7C3AED" /> {/* Violet */}
            <stop offset="100%" stopColor="#0D9488" /> {/* Teal */}
          </linearGradient>
        </defs>
        <rect
          width="40"
          height="40"
          rx="12"
          fill="url(#logoIconGradient)"
        />
        <path
          d="M11 27V13L20 22L29 13V27"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
