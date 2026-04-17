"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Eye, EyeOff, Check, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State-uri pentru form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(formData.password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validare simplă client-side înainte de trimitere
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${apiUrl}/api/User/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.flag) {
        // Înregistrare reușită - trimitem utilizatorul la login
        router.push("/login");
      } else {
        // Eroare de la backend (ex: "User already exists")
        setError(data.message);
      }
    } catch (err) {
      setError("Connection error. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50" />
      <div className="fixed inset-0 -z-10 opacity-40">
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

        <div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <Sparkles className="absolute top-6 right-6 h-5 w-5 text-purple-300 animate-pulse" />

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-gray-900">Create an account</h1>
            <p className="mt-2 text-base text-gray-500 font-medium">Start mastering formulas today</p>
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
              <Label htmlFor="username" className="text-gray-700 font-bold ml-1">Username</Label>
              <Input
                id="username"
                placeholder="johndoe22"
                required
                value={formData.username}
                onChange={handleChange}
                className="h-12 rounded-xl bg-white/50 border-purple-100 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:border-transparent transition-all placeholder:text-gray-400 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-bold ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="h-12 rounded-xl bg-white/50 border-purple-100 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:border-transparent transition-all placeholder:text-gray-400 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-bold ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 rounded-xl bg-white/50 border-purple-100 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:border-transparent transition-all pr-12 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Requirements visualization */}
              {formData.password.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-white/40 border border-purple-50 animate-fade-in-up">
                  <ul className="space-y-2">
                    {passwordRequirements.map((req) => (
                      <li key={req.label} className={cn("flex items-center gap-2 text-xs font-bold transition-colors duration-300", req.met ? "text-emerald-600" : "text-gray-400")}>
                        <div className={cn("flex items-center justify-center w-4 h-4 rounded-full transition-colors duration-300", req.met ? "bg-emerald-100" : "bg-gray-100")}>
                          <Check className={cn("h-3 w-3", req.met ? "opacity-100 text-emerald-600" : "opacity-30 text-gray-400")} />
                        </div>
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-bold ml-1">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="h-12 rounded-xl bg-white/50 border-purple-100 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:border-transparent transition-all font-medium"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-gray-500 bg-white/40 py-3 px-6 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm mx-auto max-w-[fit-content]">
          Already have an account?{" "}
          <Link href="/login" className="font-black text-violet-600 hover:text-violet-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 50px) scale(1.05); }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}