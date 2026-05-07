"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Eye, EyeOff, AlertCircle, Sparkles, Loader2, Github, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://learnqhub.com";
      
      const response = await fetch(`${apiUrl}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.flag) { 
        localStorage.setItem("token", data.token);
        showToast("Login successful!", "success");
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.message);
        showToast(data.message || "Failed to log in.", "error");
      }
    } catch (err) {
      const errorMessage = "Network error. Could not connect to the server.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50" />
      <div className="fixed inset-0 -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600 tracking-tight">
            FormulaCards
          </span>
        </Link>

        <div className="rounded-3xl border border-white/50 bg-white backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <Sparkles className="absolute top-6 right-6 h-5 w-5 text-purple-300 animate-pulse" />

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-gray-900">Welcome back</h1>
            <p className="mt-2 text-base text-gray-500 font-medium">Sign in to continue studying</p>
          </div>

          {error && (
            <div className="mb-6 animate-fade-in-up">
              <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-sm rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-bold ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-white border-purple-100 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:border-transparent transition-all pr-12 font-medium placeholder:text-gray-400 text-black"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1 mr-1">
                <Label htmlFor="password" className="text-gray-700 font-bold">Password</Label>
                <Link href="#" className="text-xs font-bold text-violet-600 hover:text-violet-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-white border-purple-100 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:border-transparent transition-all pr-12 font-medium placeholder:text-gray-400 text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-black-300 bg-white/40 py-3 px-6 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm mx-auto max-w-[fit-content]">
          Don't have an account?{" "}
          <Link href="/register" className="font-black text-violet-600 hover:text-violet-500 transition-colors">
            Sign up
          </Link>
        </p>
      </div>

      {/* Global Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in-up transition-all ${
          toast.type === "error" 
            ? "bg-red-950/90 border-red-500/50 text-red-200" 
            : "bg-green-950/90 border-green-500/50 text-green-200"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
          <p className="font-semibold text-sm mr-2">{toast.message}</p>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))} 
            className={`p-1 rounded-lg transition-colors ${
              toast.type === "error" ? "hover:bg-red-900/50" : "hover:bg-green-900/50"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 50px) scale(1.05); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}