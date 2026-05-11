"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split('; ').find(row => row.startsWith('user_consent='));
    
    if (!consent) {
      setIsVisible(true);
    } else if (consent.split('=')[1] === 'accepted') {
      loadTrackingScripts();
    }
  }, []);

  const acceptCookies = () => {
    document.cookie = "user_consent=accepted; max-age=31536000; path=/";
    setIsVisible(false);
    loadTrackingScripts();
  };

  const rejectCookies = () => {
    document.cookie = "user_consent=rejected; max-age=31536000; path=/";
    setIsVisible(false);
  };

  const loadTrackingScripts = () => {
    console.log("Analytics loaded");
  };

  if (!isVisible) return null;

  return (
    // Containerul exterior - am scos p-24 pentru a lăsa cardul să își ia mărimea naturală
    <div className="fixed bottom-6 left-6 right-6 z-50 md:right-10 md:left-auto md:max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      
      <div style="padding: 32px;" className="relative overflow-hidden rounded-[2rem] bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-8 md:p-10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)]">
        
        {/* Glow de fundal pentru vibrație */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-indigo-500/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10">
          {/* Header cu status */}
          <div className="flex items-center gap-3 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Privacy & Cookies
            </span>
          </div>

          {/* Text Content cu line-height mai mare */}
          <div className="space-y-4 mb-10">
            <h3 className="text-white text-2xl font-semibold tracking-tight">
              Control your data
            </h3>
            
            <p className="text-zinc-400 text-base leading-relaxed">
              We use cookies to create a more <span className="text-zinc-200">vibrant and personalized</span> experience for you. 
              Review our{" "}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors font-medium decoration-blue-400/30 underline underline-offset-8">
                Policy
              </Link>.
            </p>
          </div>

          {/* Butoane cu padding generos */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={acceptCookies}
              className="w-full py-4 px-6 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-lg shadow-blue-600/20 transform active:scale-[0.97] transition-all duration-200"
            >
              Accept All
            </button>
            
            <button 
              onClick={rejectCookies}
              className="w-full py-4 px-6 text-sm font-semibold text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 rounded-2xl transition-all duration-200"
            >
              Custom Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}