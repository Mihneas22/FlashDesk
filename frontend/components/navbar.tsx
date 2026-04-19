"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Layers, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
      const checkAuthorization = () => {
        const token = localStorage.getItem("token");
        
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || decoded.Role;
            
            const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid || decoded.sub;
            const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
            const isAdmin = roles.some(r => r === "admin" || r === "Admin");
  
            setIsAuthorized(isAdmin);
          } catch (error) {
            console.error("Invalid token:", error);

            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      };
  
      checkAuthorization();
    }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-purple-100/50 bg-[#1b1f26] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 shadow-lg shadow-violet-500/30 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <Layers className="h-5 w-5 text-white" />
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          {isAuthorized ? (
            <div className="flex items-center gap-2">
            <NavLink href="/admin" active={pathname === "/admin"}>
              <BookOpen className="h-4 w-4" />
                Admin Dashboard
            </NavLink>
          </div>
          ) : null}

          <div className="flex items-center gap-2">
            <NavLink href="/public-decks" active={pathname === "/public-decks"}>
              <BookOpen className="h-4 w-4" />
              Public Decks
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <NavLink href="/test" active={pathname === "/test"}>
              <BookOpen className="h-4 w-4" />
              Tests
            </NavLink>
          </div>

          <div className="h-6 w-px bg-purple-100/60 hidden sm:block"></div>

          {/* Authentication Logic */}
          {isLoggedIn ? (
            <Button 
              variant="ghost" 
              className="h-10 px-4 rounded-xl gap-2 font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          ) : (
            <Button asChild className="h-10 px-6 rounded-xl gap-2 font-bold bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 border-0">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          )}
        </nav>
      </div>
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
        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300",
        active
          ? "bg-violet-50 text-violet-700"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {children}
    </Link>
  );
}