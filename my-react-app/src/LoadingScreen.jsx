import React from 'react';

export default function LoadingScreen({ message = "Loading Renew Placenta..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#FDFBF7] py-16 px-4 text-center">
      {/* Top spacer */}
      <div className="h-8"></div>

      {/* Center content: Logo + Animated Pulsing/Spinning Effect */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center">
          {/* Subtle glowing animated ring around logo */}
          <div className="absolute h-32 w-32 rounded-full border-4 border-emerald-600/20 border-t-emerald-600 animate-spin"></div>
          
          {/* Company Logo / Favicon */}
          <img
            src="/favicon.png"
            alt="Renew Placenta Logo"
            className="h-20 w-20 object-contain animate-pulse relative z-10"
          />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-emerald-900 tracking-wide">
            Renew Placenta
          </h2>
          <p className="text-sm font-medium text-emerald-700/80 animate-pulse">
            {message}
          </p>
        </div>
      </div>

      {/* Footer Tagline */}
      <p className="text-xs text-gray-400 uppercase tracking-widest font-sans">
        Herbal Beauty Since 1998
      </p>
    </div>
  );
}