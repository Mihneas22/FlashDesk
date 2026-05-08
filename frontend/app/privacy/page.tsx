"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ShieldCheck, Cookie, Database, Scale, Mail, ChevronRight } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { 
    const t = setTimeout(() => setMounted(true), 80); 
    return () => clearTimeout(t); 
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gray-950 text-gray-100">
      
      {/* Background (Matching Profile Page) */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Assuming you want the Navbar here as well */}
      <Navbar isLoggedIn={true} /> 

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        
        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <div className={`relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gray-900/40 backdrop-blur-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-transparent pointer-events-none" />
          
          <div className="relative p-8 sm:p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-900/60">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent mb-4">
              Privacy & Cookie Policy
            </h1>
            <p className="text-gray-400 max-w-2xl text-sm sm:text-base font-medium">
              We are committed to protecting your personal data and your right to privacy. 
              This policy explains how we collect, use, and store your information when you use LearnQHub.
            </p>
          </div>
        </div>

        {/* ── CONTENT SECTIONS ───────────────────────────────────────────── */}
        <div className="space-y-6">
          
          {/* Section 1: Data We Collect */}
          <SectionCard 
            icon={<Database className="w-5 h-5 text-cyan-400" />} 
            title="1. What Data Do We Collect?"
            delay={200}
            mounted={mounted}
          >
            <p className="text-gray-300 mb-4">When you use our platform, we may collect the following types of information:</p>
            <ul className="space-y-3">
              <ListItem title="Account Data:" desc="Email address, username, and encrypted password when you register." />
              <ListItem title="Usage Data:" desc="Your learning progress, flashcard decks studied, streaks, and app preferences." />
              <ListItem title="Technical Data:" desc="IP address, browser type, and operating system, collected automatically for security and functionality purposes." />
            </ul>
          </SectionCard>

          {/* Section 2: Cookies */}
          <SectionCard 
            icon={<Cookie className="w-5 h-5 text-amber-400" />} 
            title="2. How We Use Cookies"
            delay={300}
            mounted={mounted}
          >
            <p className="text-gray-300 mb-6">
              Cookies are small text files stored on your device. We use them to provide you with a smooth and personalized user experience.
            </p>
            
            <div className="overflow-x-auto rounded-xl border border-gray-800/60 bg-gray-950/50">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-900/80 border-b border-gray-800/60 text-gray-400">
                    <th className="p-4 font-semibold">Cookie Name</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Purpose</th>
                    <th className="p-4 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  <tr className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4 font-mono text-violet-300">AuthToken</td>
                    <td className="p-4"><span className="px-2 py-1 rounded-md bg-gray-800 text-xs font-semibold">Strictly Necessary</span></td>
                    <td className="p-4">Maintains your active user session (authentication).</td>
                    <td className="p-4">Session / 7 days</td>
                  </tr>
                  <tr className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4 font-mono text-violet-300">user_consent</td>
                    <td className="p-4"><span className="px-2 py-1 rounded-md bg-gray-800 text-xs font-semibold">Strictly Necessary</span></td>
                    <td className="p-4">Remembers your choice regarding cookie acceptance or rejection.</td>
                    <td className="p-4">1 year</td>
                  </tr>
                  <tr className="hover:bg-gray-800/20 transition-colors">
                    <td className="p-4 font-mono text-violet-300">_ga (Google)</td>
                    <td className="p-4"><span className="px-2 py-1 rounded-md bg-violet-900/30 text-violet-300 border border-violet-500/20 text-xs font-semibold">Analytics</span></td>
                    <td className="p-4">Helps us understand how users interact with the site (only loaded with your consent).</td>
                    <td className="p-4">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Section 3: User Rights (GDPR) */}
          <SectionCard 
            icon={<Scale className="w-5 h-5 text-emerald-400" />} 
            title="3. Your Rights (GDPR)"
            delay={400}
            mounted={mounted}
          >
            <p className="text-gray-300 mb-4">Under European data protection laws (GDPR), you have the following rights regarding your data:</p>
            <ul className="space-y-3">
              <ListItem title="Right to Access:" desc="You can request a copy of the personal data we hold about you." />
              <ListItem title="Right to Erasure:" desc="Also known as the 'right to be forgotten'. You can request the permanent deletion of your account and all associated data." />
              <ListItem title="Right to Withdraw Consent:" desc="You can clear your browser cookies at any time to revoke tracking permissions." />
            </ul>
          </SectionCard>

          {/* Section 4: Contact */}
          <SectionCard 
            icon={<Mail className="w-5 h-5 text-pink-400" />} 
            title="4. Contact Us"
            delay={500}
            mounted={mounted}
          >
            <p className="text-gray-300">
              If you have any questions about this privacy policy or wish to exercise your data protection rights, please contact us at:
            </p>
            <a href="mailto:contact@learnqhub.com" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-gray-800/60 border border-gray-700/50 text-violet-300 hover:text-white hover:bg-violet-500/20 hover:border-violet-500/30 transition-all font-medium">
              contact@learnqhub.com
            </a>
          </SectionCard>

        </div>

        {/* Footer info */}
        <div className={`text-center pt-8 pb-12 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: '600ms' }}>
          <p className="text-sm text-gray-500 font-medium">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

      </main>

      {/* Animations (Matching Profile Page) */}
      <style>{`
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          25%      { transform: translate(20px,-50px) scale(1.1); }
          50%      { transform: translate(-20px,20px) scale(0.9); }
          75%      { transform: translate(20px,50px) scale(1.05); }
        }
        .animate-blob          { animation: blob 7s infinite; }
        .animation-delay-2000  { animation-delay: 2s; }
        .animation-delay-4000  { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function SectionCard({ icon, title, children, delay, mounted }: { icon: React.ReactNode, title: string, children: React.ReactNode, delay: number, mounted: boolean }) {
  return (
    <div 
      className={`relative rounded-3xl overflow-hidden border border-gray-800/60 bg-gray-900/40 backdrop-blur-md p-6 sm:p-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-800/60 flex items-center justify-center flex-shrink-0 border border-gray-700/50">
          {icon}
        </div>
        {title}
      </h2>
      <div className="text-sm sm:text-base">
        {children}
      </div>
    </div>
  );
}

function ListItem({ title, desc }: { title: string, desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <ChevronRight className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
      <span className="text-gray-300">
        <strong className="text-white font-semibold">{title}</strong> {desc}
      </span>
    </li>
  );
}