"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded: any = jwtDecode(token);
      const roleClaim =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded.role ||
        decoded.Role;
      const extractedUsername =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        decoded.nameid ||
        decoded.sub;
      if (extractedUsername) setUsername(extractedUsername);
      const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
      setIsAuthorized(roles.some((r) => r === "admin" || r === "Admin"));
    } catch {
      setIsAuthorized(false);
      setUsername(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsername(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-[#0F1419]/95 border-b border-[#2A3142] backdrop-blur-xl"
          : "bg-[#0F1419]/80 border-b border-transparent backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">

        {/* Brand */}
        <Link href="/dashboard" className="group flex items-center gap-2.5 shrink-0">
          <Image
            src="/favicon.png"
            alt="Logo"
            width={28}
            height={28}
            priority
            className="transition-transform duration-200 group-hover:scale-110 object-contain"
          />
          <span
            className="text-sm font-bold tracking-tight text-[#E8EAED]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            LearnQ<span className="text-[#FFB84D]">Hub</span>
            <span className="text-[#3A4152]">.exe</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {isAuthorized && (
            <NavLink href="/admin" active={pathname === "/admin"}>
              admin
            </NavLink>
          )}
          <NavLink href="/public-decks" active={pathname === "/public-decks"}>
            decks
          </NavLink>
          <NavLink href="/test" active={pathname === "/test"}>
            tests
          </NavLink>
          <NavLink href="/pricing" active={pathname === "/pricing"}>
            pricing
          </NavLink>

          <div className="mx-3 h-4 w-px bg-[#2A3142]" />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {username && (
                <Link
                  href="/user"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all duration-150",
                    "border border-[#2A3142] text-[#7A8394] hover:text-[#FFB84D] hover:border-[#FFB84D]/30 hover:bg-[#FFB84D]/5",
                    pathname === "/user" && "text-[#FFB84D] border-[#FFB84D]/30 bg-[#FFB84D]/5"
                  )}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <User className="h-3 w-3" />
                  <span>{username}</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[#2A3142] text-[#7A8394] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-150"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <LogOut className="h-3 w-3" />
                <span>logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold bg-[#FFB84D] text-[#0F1419] hover:bg-[#E69B00] transition-all duration-150"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              $ sign_in
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md text-[#7A8394] hover:text-[#E8EAED] hover:bg-[#1A1F2E] transition-all duration-150"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="md:hidden border-t border-[#2A3142] bg-[#0F1419] overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {username && (
                <div
                  className="flex items-center gap-2 px-3 py-2 mb-2 rounded-md bg-[#1A1F2E] border border-[#2A3142]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <User className="h-3 w-3 text-[#FFB84D]" />
                  <span className="text-xs text-[#FFB84D]">{username}</span>
                </div>
              )}

              <MobileNavLink href="/public-decks" active={pathname === "/public-decks"}>
                decks
              </MobileNavLink>
              <MobileNavLink href="/test" active={pathname === "/test"}>
                tests
              </MobileNavLink>
              <MobileNavLink href="/pricing" active={pathname === "/pricing"}>
                pricing
              </MobileNavLink>
              {isAuthorized && (
                <MobileNavLink href="/admin" active={pathname === "/admin"}>
                  admin
                </MobileNavLink>
              )}

              <div className="mt-3 pt-3 border-t border-[#2A3142]">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all duration-150"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    $ logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold bg-[#FFB84D] text-[#0F1419] hover:bg-[#E69B00] transition-all duration-150"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    $ sign_in
                  </Link>
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
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 rounded-md text-xs transition-all duration-150",
        "font-medium",
        active
          ? "text-[#FFB84D] bg-[#FFB84D]/8 border border-[#FFB84D]/20"
          : "text-[#7A8394] hover:text-[#E8EAED] hover:bg-[#1A1F2E] border border-transparent"
      )}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-all duration-150",
        active
          ? "text-[#FFB84D] bg-[#FFB84D]/8 border border-[#FFB84D]/20"
          : "text-[#7A8394] hover:text-[#E8EAED] hover:bg-[#1A1F2E] border border-transparent"
      )}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <span className="text-[#3A4152]">❯</span>
      {children}
    </Link>
  );
}