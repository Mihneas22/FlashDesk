import React from 'react';

export function Footer(): React.JSX.Element {
  return (
    <footer className="bg-[#1A1F2E] border-t border-[#2A3142] text-[#E8EAED] px-6 py-12 md:px-8 text-sm font-sans tracking-wide">
      {/* Grid Principal */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 mb-12">
        
        {/* Coloana 1: Brand & Info */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <div className="text-xl font-bold tracking-tight text-[#E8EAED]">
            FlashDesk<span className="text-[#00D9FF]">.</span>
          </div>
          <p className="text-[#7A8394] max-w-sm leading-relaxed">
            Platforma ta favorită pentru învățare și organizare rapidă.
          </p>
          
          {/* Status Platformă */}
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]"></span>
            </span>
            <span className="text-[#7A8394] text-xs font-medium">Toate sistemele sunt operaționale</span>
          </div>
        </div>

        {/* Coloana 2: Platformă */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[#E8EAED] text-base font-semibold mb-1">Platformă</h4>
          <a href="/probleme" className="text-[#7A8394] hover:text-[#00D9FF] transition-colors duration-200 no-underline">Probleme</a>
          <a href="/concursuri" className="text-[#7A8394] hover:text-[#00D9FF] transition-colors duration-200 no-underline">Concursuri</a>
          <a href="/clasament" className="text-[#7A8394] hover:text-[#00D9FF] transition-colors duration-200 no-underline">Clasament</a>
        </div>

        {/* Coloana 3: Comunitate */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[#E8EAED] text-base font-semibold mb-1">Comunitate</h4>
          <a href="/discord" className="text-[#7A8394] hover:text-[#00D9FF] transition-colors duration-200 no-underline" target="_blank" rel="noreferrer">Discord</a>
          <a href="/forum" className="text-[#7A8394] hover:text-[#00D9FF] transition-colors duration-200 no-underline">Forum</a>
        </div>

        {/* Coloana 4: Suport */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[#E8EAED] text-base font-semibold mb-1">Suport</h4>
          <a href="/termeni" className="text-[#7A8394] hover:text-[#00D9FF] transition-colors duration-200 no-underline">Termeni</a>
          <a href="/confidentialitate" className="text-[#7A8394] hover:text-[#00D9FF] transition-colors duration-200 no-underline">Confidențialitate</a>
          <a href="/contact" className="text-[#7A8394] hover:text-[#00D9FF] transition-colors duration-200 no-underline">Contact</a>
        </div>

      </div>

      {/* Separator */}
      <div className="border-t border-[#2A3142] max-w-6xl mx-auto" />

      {/* Zona de jos */}
      <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#7A8394] text-xs font-medium">
        <div>
          {/* Randerem anul direct inline ca să nu mai existe riscul de ReferenceError */}
          &copy; {new Date().getFullYear()} FlashDesk. Toate drepturile rezervate.
        </div>
        <div className="flex items-center gap-1">
          <span>Făcut cu</span>
          <span className="text-[#FF6B6B] animate-pulse">❤️</span>
          <span>pentru programatori.</span>
        </div>
      </div>
    </footer>
  );
}