"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Sparkles, Zap, Shield, Crown, ArrowRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { jwtDecode } from "jwt-decode";

const PLANS = [
  {
    name: "Free",
    description: "The best free tier on the market. Genuinely useful, forever.",
    price: "0",
    icon: <Shield className="w-6 h-6 text-gray-400" />,
    features: [
      "10 full pre-built course decks",
      "Up to 150 cards total",
      "Full spaced repetition algorithm",
      "1 PDF → cards per day"
    ],
    buttonText: "Get started free",
    buttonStyle: "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700",
    popular: false,
    tier: "Free"
  },
  {
    name: "Core",
    description: "Everything a student needs to dominate a full semester.",
    price: "4.99",
    icon: <Zap className="w-6 h-6 text-purple-400" />,
    features: [
      "Unlimited pre-built course decks",
      "Unlimited cards",
      "5 AI PDF → cards per day",
      "Mastery heatmap per course",
      "5-minute daily mode"
    ],
    buttonText: "Get started",
    buttonStyle: "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-700/50 border border-purple-500/50",
    popular: true,
    tier: "Core"
  },
  {
    name: "Pro",
    description: "For students who study seriously — and in groups.",
    price: "8.49",
    icon: <Crown className="w-6 h-6 text-fuchsia-400" />,
    features: [
      "Everything in Core",
      "Unlimited AI PDF → cards",
      "Unlimited AI card generation",
      "Exam simulation mode",
      "Weak formula clustering insights",
      "Collaborative decks (4 people)",
      "Browser extension (highlight → card)",
      "Priority support"
    ],
    buttonText: "Get started",
    buttonStyle: "bg-gray-900 text-white border border-fuchsia-500/50 hover:bg-gray-800 shadow-[0_0_15px_rgba(217,70,239,0.15)] hover:shadow-[0_0_25px_rgba(217,70,239,0.3)]",
    popular: false,
    tier: "Pro"
  }
];

export default function PricingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Poți extrage rolul aici dacă vrei să blochezi butoanele pentru planurile deja deținute
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleSubscribe = async (planName: string) => {
    if (planName === "Free") return; // Free plan nu are nevoie de Stripe
    
    if (!isLoggedIn) {
      alert("Te rugăm să te loghezi pentru a achiziționa un plan!");
      // window.location.href = "/login";
      return;
    }

    try {
      setLoadingPlan(planName);
      const token = localStorage.getItem("token");

      const response = await fetch("https://learnqhub.com/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ planName })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Eroare la procesarea plății: " + (data.message || "Unknown error"));
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error("Eroare:", error);
      alert("A apărut o eroare de rețea.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100 font-sans">
      {/* Background Effects (Sincronizate cu Dashboard) */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 animate-fade-in">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold text-sm mb-4 animate-slide-up">
            <Sparkles className="w-4 h-4" />
            Supercharge Your Study Sessions
          </div>
          <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-slide-up" style={{ animationDelay: "100ms" }}>
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-400 animate-slide-up" style={{ animationDelay: "200ms" }}>
            Choose the perfect plan to accelerate your learning. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl bg-gray-900/60 backdrop-blur-md border animate-slide-up transition-transform duration-300 hover:-translate-y-2
                ${plan.popular ? "border-purple-500/50 shadow-[0_0_40px_rgba(139,92,246,0.15)]" : "border-gray-800 shadow-xl"}
              `}
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl bg-gray-800/50 border ${plan.popular ? 'border-purple-500/30' : 'border-gray-700'}`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                </div>

                <p className="text-gray-400 text-sm mb-6 h-10">
                  {plan.description}
                </p>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  <span className="text-gray-400 font-medium">/month</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-purple-400' : 'text-gray-500'}`} />
                      <span className="text-gray-300 text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loadingPlan === plan.tier || (plan.name === "Free" && isLoggedIn)}
                  className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group ${plan.buttonStyle} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingPlan === plan.tier ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <>
                      {plan.name === "Free" && isLoggedIn ? "Active Plan" : plan.buttonText}
                      {plan.name !== "Free" && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Global Animations (Reutilizate) */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 50px) scale(1.05); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }
      `}</style>
    </div>
  );
}