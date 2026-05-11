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
    console.log("Scripturi de analiză încărcate");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 p-24 right-4 z-50 md:bottom-8 md:right-8 md:left-auto md:max-w-md animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Accent Decorativ Vibrant */}
        <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-600/10 blur-3xl rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Cookie Policy</span>
          </div>

          <h3 className="text-white font-semibold text-lg mb-2">
            We value your privacy
          </h3>
          
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            We use cookies to enhance your browsing experience and analyze our traffic. 
            By clicking <span className="text-zinc-200 font-medium">"Accept All"</span>, you consent to our use of cookies. 
            Details in our{" "}
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
              Cookie Policy
            </Link>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={rejectCookies}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 hover:text-white border border-zinc-700 rounded-xl transition-all duration-200"
            >
              Refuse All
            </button>
            <button 
              onClick={acceptCookies}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] rounded-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}