"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Layers, LogIn, LogOut, User, Menu, X } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Închidem meniul mobil la schimbarea rutei
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const checkAuthorization = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || decoded.Role;
          const extractedUsername = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.nameid || decoded.sub;
          
          if (extractedUsername) setUsername(extractedUsername);

          const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
          const isAdmin = roles.some(r => r === "admin" || r === "Admin");
          setIsAuthorized(isAdmin);
        } catch (error) {
          setIsAuthorized(false);
          setUsername(null);
        }
      }
    };
    checkAuthorization();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsername(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#1b1f26]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        
        {/* Brand */}
        <Link href="/dashboard" className="group flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0a0a] border border-white/10 shadow-xl shadow-black/50 transform group-hover:scale-110 transition-all duration-300 overflow-hidden">
            <img 
              src="/favicon.png"
              alt="Logo"
              className="h-full w-full object-cover" 
            />
          </div>
          <span className="text-xl font-black tracking-tighter text-white font-syne">
            LearnQHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {isAuthorized && (
            <NavLink href="/admin" active={pathname === "/admin"}>
              Admin
            </NavLink>
          )}
          <NavLink href="/public-decks" active={pathname === "/public-decks"}>Public Decks</NavLink>
          <NavLink href="/test" active={pathname === "/test"}>Tests</NavLink>
          <NavLink href="/pricing" active={pathname === "/pricing"}>Pricing</NavLink>
          
          <div className="mx-2 h-5 w-px bg-white/10"></div>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {username && (
                <NavLink href="/user" active={pathname === "/user"}>
                  <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <User className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                </NavLink>
              )}
              <Button 
                variant="ghost" 
                className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button asChild className="h-9 px-5 bg-violet-600 hover:bg-violet-500 text-white border-0">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-white hover:bg-white/5 rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#1b1f26] overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-6">
              {username && (
                 <div className="flex items-center gap-2 text-purple-400 mb-4 px-4">
                    <User className="h-4 w-4" />
                 </div>
              )}
              <NavLink href="/public-decks" active={pathname === "/public-decks"} mobile>Public Decks</NavLink>
              <NavLink href="/test" active={pathname === "/test"} mobile>Tests</NavLink>
              <NavLink href="/lab-asist" active={pathname === "/lab-asist"} mobile>Lab Assistant</NavLink>
              {isAuthorized && (
                <NavLink href="/admin" active={pathname === "/admin"} mobile>Admin Dashboard</NavLink>
              )}
              
              <div className="pt-4 mt-2 border-t border-white/5">
                {isLoggedIn ? (
                  <Button 
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-violet-600 text-white">
                    <Link href="/login">Sign in</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
  mobile
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300",
        active
          ? "bg-violet-600/20 text-violet-400"
          : "text-gray-400 hover:text-white hover:bg-white/5",
        mobile && "text-base py-3"
      )}
    >
      {children}
    </Link>
  );
}