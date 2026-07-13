"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Sparkles, Zap, Shield, Crown, ArrowRight, Loader2, Code2, Terminal } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "react-hot-toast";

const PLANS = [
  {
    name: "Free",
    description: "The best free tier on the market. Genuinely useful, forever.",
    price: { Monthly: "0", Annually: "0" },
    icon: <Shield className="w-6 h-6 text-[#7A8394]"/>,
    features: [
      "10 full pre-built course decks",
      "Up to 150 cards total",
      "Full spaced repetition algorithm",
      "1 PDF → cards per day"
    ],
    buttonText: "Get started free",
    theme: "muted",
    popular: false,
    tier: "Free"
  },
  {
    name: "Core",
    description: "Everything a student needs to dominate a full semester.",
    price: { Monthly: "4.99", Annually: "39.96" },
    icon: <Zap className="w-6 h-6 text-[#00D9FF]"/>,
    features: [
      "Unlimited pre-built course decks",
      "Unlimited cards",
      "5 AI PDF → cards per day",
      "Mastery heatmap per course",
    ],
    buttonText: "Get started",
    theme: "cyan",
    popular: true,
    tier: "Core"
  },
  {
    name: "Pro",
    description: "For students who study seriously — and in groups.",
    price: { Monthly: "8.49", Annually: "84.96" },
    icon: <Crown className="w-6 h-6 text-[#FFB84D]"/>,
    features: [
      "Everything in Core",
      "Unlimited AI PDF → cards",
      "Unlimited AI card generation",
      "Exam simulation mode",
      "Weak formula clustering insights",
      "Priority support"
    ],
    buttonText: "Get started",
    theme: "amber",
    popular: false,
    tier: "Pro"
  }
];

export default function PricingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Annually">("Monthly");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Checking if token is valid
        if (decoded) setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleSubscribe = async (planName: string) => {
    if (planName === "Free") return;
    
    if (!isLoggedIn) {
      toast.error("Please log in to subscribe.");
      setTimeout(() => { window.location.href = "/login"; }, 1500);
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
        body: JSON.stringify({ 
          planName: planName, 
          billingCycle: billingCycle 
        })
      });

      const data = await response.json();

      if (data.url) {
        toast.success("Redirecting to secure checkout...");
        window.location.href = data.url;
      } else {
        toast.error("Payment error: " + (data.message || "Unknown error"));
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error("Eroare:", error);
      toast.error("Network error. Please try again later.");
      setLoadingPlan(null);
    }
  };

  const getThemeStyles = (theme: string, isPopular: boolean) => {
    switch (theme) {
      case "cyan":
        return {
          border: "border-[#00D9FF]",
          button: "bg-[#00D9FF] hover:bg-[#00B8D4] text-[#0F1419] shadow-[0_0_15px_rgba(0,217,255,0.15)]",
          badge: "bg-[#00D9FF] text-[#0F1419]",
          text: "text-[#00D9FF]",
          glow: "shadow-[0_0_30px_rgba(0,217,255,0.05)]"
        };
      case "amber":
        return {
          border: "border-[#FFB84D]/50 hover:border-[#FFB84D]",
          button: "bg-[#252D3D] text-[#FFB84D] border border-[#FFB84D]/30 hover:border-[#FFB84D] hover:bg-[#FFB84D]/10",
          badge: "bg-[#FFB84D] text-[#0F1419]",
          text: "text-[#FFB84D]",
          glow: ""
        };
      default:
        return {
          border: "border-[#2A3142] hover:border-[#7A8394]",
          button: "bg-[#252D3D] text-[#E8EAED] border border-[#2A3142] hover:bg-[#2A3142]",
          badge: "bg-[#252D3D] text-[#7A8394]",
          text: "text-[#E8EAED]",
          glow: ""
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#E8EAED] font-sans selection:bg-[#00D9FF]/30">
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: '#1A1F2E',
            color: '#E8EAED',
            border: '1px solid #2A3142',
            fontSize: '14px',
            fontWeight: '500'
          },
        }}
      />

      {/* Subtle tech background pattern */}
      <div className="fixed inset-0 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#2A3142 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.15 }} />

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 relative z-10 animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#252D3D] border border-[#2A3142] text-[#00D9FF] font-mono text-xs uppercase tracking-widest font-bold animate-slide-up">
            <Terminal className="w-3.5 h-3.5"/>
            System Upgrades
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#E8EAED] tracking-tight animate-slide-up" style={{ animationDelay: "100ms" }}>
            Invest in your <span className="text-[#00D9FF]">neural</span> weights.
          </h1>
          <p className="text-base text-[#7A8394] max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "200ms" }}>
            Compile knowledge faster. Choose the computational tier that fits your study load. No hidden dependencies, cancel anytime.
          </p>
        </div>

        {/* Toggle Monthly / Annually */}
        <div className="flex justify-center items-center gap-4 mb-14 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <span className={`text-sm font-bold transition-colors ${billingCycle === "Monthly" ? "text-[#E8EAED]" : "text-[#7A8394]"}`}>
            Monthly
          </span>
          
          <button
            onClick={() => setBillingCycle(prev => prev === "Monthly" ? "Annually" : "Monthly")}
            className="w-14 h-7 bg-[#1A1F2E] rounded-full relative transition-all focus:outline-none border border-[#2A3142] hover:border-[#00D9FF]/50"
          >
            <div className={`w-5 h-5 rounded-full absolute top-[3px] shadow-md transition-all duration-300 flex items-center justify-center
              ${billingCycle === "Annually" ? "translate-x-[30px] bg-[#FFB84D]" : "translate-x-1 bg-[#00D9FF]"}`} 
            >
              <Code2 className="w-3 h-3 text-[#0F1419]"/>
            </div>
          </button>

          <span className={`text-sm font-bold flex items-center gap-2 transition-colors ${billingCycle === "Annually" ? "text-[#E8EAED]" : "text-[#7A8394]"}`}>
            Annual
            <span className="font-mono text-[10px] font-black text-[#0F1419] bg-[#4ADE80] px-2 py-0.5 rounded-md uppercase tracking-wider">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => {
            const styles = getThemeStyles(plan.theme, plan.popular);
            
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl bg-[#1A1F2E] border transition-all duration-300 hover:-translate-y-1 animate-slide-up
                  ${styles.border} ${styles.glow}`}
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                    <div className={`${styles.badge} text-[10px] font-black px-3 py-1 rounded-md flex items-center gap-1.5 border border-[#00B8D4]/20 tracking-widest uppercase`}>
                      <Sparkles className="w-3 h-3"/>
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8 flex-1 flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black text-[#E8EAED]">{plan.name}</h3>
                    <div className="p-2 rounded-xl bg-[#252D3D] border border-[#2A3142]">
                      {plan.icon}
                    </div>
                  </div>

                  <p className="text-[#7A8394] text-sm mb-6 min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* Price Area */}
                  <div className="mb-8 flex items-baseline gap-1.5 pb-8 border-b border-[#2A3142]">
                    <span className="text-4xl font-mono font-black text-[#E8EAED]">
                      €{plan.price[billingCycle]}
                    </span>
                    <span className="text-[#7A8394] text-sm font-bold uppercase tracking-wider">
                      /{billingCycle === "Monthly" ? "mo" : "yr"}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 shrink-0 ${styles.text}`} />
                        <span className="text-[#E8EAED] text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <button
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={loadingPlan === plan.tier || (plan.name === "Free" && isLoggedIn)}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
                  >
                    {loadingPlan === plan.tier ? (
                      <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</>
                    ) : (
                      <>
                        {plan.name === "Free" && isLoggedIn ? "Active Plan" : plan.buttonText}
                        {plan.name !== "Free" && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out backwards;
        }
      `}</style>
    </div>
  );
}