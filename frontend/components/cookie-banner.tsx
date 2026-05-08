"use client"; // Această linie este obligatorie!

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificăm dacă userul a luat deja o decizie când se încarcă pagina (în browser)
    const consent = document.cookie.split('; ').find(row => row.startsWith('user_consent='));
    
    if (!consent) {
      setIsVisible(true);
    } else if (consent.split('=')[1] === 'accepted') {
      loadTrackingScripts();
    }
  }, []);

  const acceptCookies = () => {
    document.cookie = "user_consent=accepted; max-age=31536000; path=/"; // Valabil 1 an
    setIsVisible(false);
    loadTrackingScripts();
  };

  const rejectCookies = () => {
    document.cookie = "user_consent=rejected; max-age=31536000; path=/";
    setIsVisible(false);
  };

  const loadTrackingScripts = () => {
    console.log("Scripturi de analiză încărcate (ex: Google Analytics)");
    // Aici vei adăuga dinamic scripturile tale de tracking pe viitor
  };

  // Dacă nu trebuie să fie vizibil, nu randăm nimic
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 text-zinc-300 p-6 shadow-lg border-t border-zinc-800">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p className="mb-2">
            <strong className="text-white">Hello! We want to offer you the most pleasant experience possible.</strong> We use cookies for the proper functioning of the site and performance analysis.
          </p>
          <p>
            Find out more details in{" "}
            <Link href="/privacy" className="text-blue-400 hover:underline">
              Cookie Policy
            </Link>.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button 
            onClick={rejectCookies}
            className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors"
          >
            Refuse All
          </button>
          <button 
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}