"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/validations/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = loginSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const success = await login(formData);
    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-emerald-deep font-sans">
      {/* Forms panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-luxury-cream dark:bg-emerald-deep">
        <div className="w-full max-w-md flex flex-col gap-8">
          
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-rich/60 dark:text-luxury-cream/60 hover:text-gold dark:hover:text-gold transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="h-4.5 w-4.5" /> Back to Home
            </Link>
            <h1 className="font-display text-4xl font-semibold text-emerald-rich dark:text-luxury-cream tracking-wide">
              Sign In
            </h1>
            <p className="text-sm text-emerald-rich/60 dark:text-luxury-cream/60">
              Welcome back. Access your personalized luxury stays.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {authError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-medium">
                {authError}
              </div>
            )}

            <Input
              id="email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="alexander@luxury.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <Button variant="primary" size="lg" type="submit" isLoading={isLoading} className="mt-2">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-emerald-rich/60 dark:text-luxury-cream/60">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-gold font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Visual luxury side panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center items-center justify-center">
        <div className="absolute inset-0 bg-emerald-deep/75 backdrop-blur-[2px]" />
        <div className="relative z-10 p-12 text-center max-w-lg flex flex-col gap-6">
          <Link href="/" className="font-display text-4xl font-bold tracking-[0.25em] text-gold">
            STAYORA
          </Link>
          <hr className="w-16 mx-auto border-gold/40" />
          <h2 className="font-display text-3xl md:text-4xl text-luxury-cream font-medium tracking-wide">
            Your Premium Escape Awaits
          </h2>
          <p className="text-luxury-cream/70 text-sm leading-relaxed">
            Log in to manage your bookings, message property hosts, and check exclusive, member-only luxury itineraries.
          </p>
        </div>
      </div>
    </div>
  );
}
