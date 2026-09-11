"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User as UserIcon, LogOut, Shield, MapPin, Building, Key, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn, getInitials } from "@/lib/utils";
import Button from "../ui/Button";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isLoading, isInitialized, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleNavbarLogout = async () => {
    const success = await logout();
    if (success) {
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Monitor scroll for transition effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Stays", href: "/stays" },
    { name: "Experiences", href: "/experiences" },
    { name: "Destinations", href: "/destinations" },
    { name: "Blogs", href: "/blogs" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500 bg-emerald-deep/95 backdrop-blur-md border-b border-gold/15 shadow-lg",
        isScrolled ? "py-3" : "py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/image.png" alt="Stayora Logo" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-102" />
          <span className="text-xs tracking-wider uppercase text-gold">
            Stayora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 ml-auto mr-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-xs font-semibold tracking-wider uppercase text-luxury-cream/80 hover:text-gold transition-colors duration-300 relative py-1",
                (pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))) && "text-gold"
              )}
            >
              {link.name}
              {(pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))) && (
                <motion.span
                  layoutId="activeNavBorder"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-4 min-w-[80px] justify-end">
          {isAuthenticated && user && user.role !== "admin" ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none group animate-fade-in"
              >
                <div className="h-10 w-10 rounded-full border border-gold/30 group-hover:border-gold bg-emerald-accent flex items-center justify-center text-gold font-bold transition-all text-sm overflow-hidden">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-xs uppercase tracking-wider text-luxury-cream/80 font-bold group-hover:text-gold transition-colors">
                    {user.name}
                  </p>
                  <span className="text-[9px] uppercase tracking-widest text-gold font-medium">
                    {(user.role as any) === "admin" ? "Admin" : "Traveler"}
                  </span>
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-0"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 rounded-sm bg-emerald-deep border border-gold/20 shadow-xl py-2 z-10 font-sans"
                    >
                      <div className="px-4 py-2 border-b border-gold/10">
                        <p className="text-xs text-luxury-cream/60 font-medium">Signed in as {(user.role as any) === "admin" ? "Admin" : "Traveler"}</p>
                        <p className="text-sm font-semibold text-luxury-cream truncate">{user.email}</p>
                      </div>

                      {(user.role as any) === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-luxury-cream/80 hover:bg-emerald-accent hover:text-gold transition-colors"
                        >
                          <Shield className="h-4 w-4 text-gold" /> Admin Console
                        </Link>
                      )}

                      <button
                        onClick={handleNavbarLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-emerald-accent hover:text-red-300 transition-colors border-t border-gold/10 mt-1"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-luxury-cream hover:text-gold focus:outline-none transition-colors"
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
            className="md:hidden bg-emerald-deep border-b border-gold/15 overflow-hidden font-sans"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs font-bold uppercase tracking-wider text-luxury-cream/80 hover:text-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated && user && user.role !== "admin" ? (
                <>
                  <hr className="border-gold/10 my-1" />
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border border-gold/30 bg-emerald-accent flex items-center justify-center text-gold font-bold text-sm shrink-0 overflow-hidden">
                        {user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-luxury-cream uppercase">{user.name}</p>
                        <span className="text-[10px] text-gold uppercase tracking-wider">{(user.role as any) === "admin" ? "Admin" : "Traveler"}</span>
                      </div>
                    </div>

                    {(user.role as any) === "admin" && (
                      <Link href="/admin" className="text-xs uppercase tracking-wider font-semibold text-luxury-cream/80 hover:text-gold">
                        Admin Console
                      </Link>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNavbarLogout}
                      className="w-full text-red-400 border-red-400 hover:bg-red-400/10 hover:text-red-300 mt-2"
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
