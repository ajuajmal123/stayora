"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema } from "@/validations/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeft, User, Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, error: authError, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "agent",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleRoleSelect = (role: "user" | "agent") => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = registerSchema.safeParse(formData);
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

    const success = await register(formData);
    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-emerald-deep font-sans">
      {/* Visual luxury side panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center items-center justify-center">
        <div className="absolute inset-0 bg-emerald-deep/75 backdrop-blur-[2px]" />
        <div className="relative z-10 p-12 text-center max-w-lg flex flex-col gap-6">
          <Link href="/" className="font-display text-4xl font-bold tracking-[0.25em] text-gold">
            STAYORA
          </Link>
          <hr className="w-16 mx-auto border-gold/40" />
          <h2 className="font-display text-3xl md:text-4xl text-luxury-cream font-medium tracking-wide">
            Your Gateway to Unrivaled Hospitality
          </h2>
          <p className="text-luxury-cream/70 text-sm leading-relaxed">
            Create an account to gain exclusive access to curated properties, boutique services, and unique travel experiences tailored for you.
          </p>
        </div>
      </div>

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
              Create Account
            </h1>
            <p className="text-sm text-emerald-rich/60 dark:text-luxury-cream/60">
              Begin your luxury travel journey with Stayora.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {authError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-medium">
                {authError}
              </div>
            )}

            <Input
              id="name"
              name="name"
              label="Full Name"
              type="text"
              placeholder="e.g. Alexander Mercer"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

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
              id="phoneNumber"
              name="phoneNumber"
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+1 (555) 019-2834"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
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

            {/* Role selection */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
                Account Type
              </span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("user")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3.5 border rounded-sm transition-all duration-300 text-center",
                    formData.role === "user"
                      ? "border-gold bg-gold/5 text-emerald-rich dark:text-gold"
                      : "border-emerald-rich/10 dark:border-luxury-cream/10 text-emerald-rich/60 dark:text-luxury-cream/60 hover:border-gold/50"
                  )}
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Traveler</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("agent")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3.5 border rounded-sm transition-all duration-300 text-center",
                    formData.role === "agent"
                      ? "border-gold bg-gold/5 text-emerald-rich dark:text-gold"
                      : "border-emerald-rich/10 dark:border-luxury-cream/10 text-emerald-rich/60 dark:text-luxury-cream/60 hover:border-gold/50"
                  )}
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Property Agent</span>
                </button>
              </div>
            </div>

            <Button variant="primary" size="lg" type="submit" isLoading={isLoading} className="mt-2">
              Register
            </Button>
          </form>

          <p className="text-center text-sm text-emerald-rich/60 dark:text-luxury-cream/60">
            Already have an account?{" "}
            <Link href="/login" className="text-gold font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
