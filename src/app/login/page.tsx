"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve optional role parameter from query string (?role=admin or defaults to user)
  const requestedRole = searchParams.get("role") === "admin" ? "admin" : "user";
  const queryError = searchParams.get("error");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (queryError) {
      setError(queryError);
    }
  }, [queryError]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError("");
    // Trigger Google Sign In flow using NextAuth
    signIn("google", { callbackUrl: requestedRole === "admin" ? "/admin" : "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center font-sans">
      {/* Dark premium backdrop overlay */}
      <div className="absolute inset-0 bg-emerald-deep/75 backdrop-blur-[4px] z-0" />

      {/* Centered Modal Card - Decreased width, Increased height, Tall Flex Column */}
      <div className="relative z-10 w-full max-w-[350px] min-h-[480px] mx-4 bg-white dark:bg-emerald-deep/90 border border-gold/25 p-6 py-12 rounded-sm shadow-2xl flex flex-col justify-between text-center">
        
        {/* Top: Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-rich/50 dark:text-luxury-cream/50 hover:text-gold dark:hover:text-gold transition-colors uppercase tracking-wider self-start"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        {/* Middle: Brand Monogram */}
        <div className="flex flex-col items-center gap-3 my-auto py-4">
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt="Stayora Logo" className="h-12 w-auto mx-auto object-contain" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl font-light text-emerald-rich dark:text-white leading-tight">
              Welcome to <span className="font-semibold text-gold">Stayora</span>
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Access your bespoke travel itinerary and luxury retreats.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-semibold my-2">
            {error}
          </div>
        )}

        {/* Bottom: Single Continue with Google Button */}
        <div className="flex flex-col gap-4">
          <Button
            variant="luxury"
            size="lg"
            onClick={handleGoogleLogin}
            isLoading={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 h-12 text-xs font-semibold uppercase tracking-wider"
          >
            {/* SVG Google Logo */}
            <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            By signing in, you agree to Stayora&apos;s luxury membership Terms of Service and Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  );
}
