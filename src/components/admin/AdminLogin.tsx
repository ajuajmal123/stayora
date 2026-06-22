"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const AdminLogin: React.FC = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();

      if (body.success && body.data) {
        setUser(body.data);
        router.refresh();
      } else {
        setError(body.message || "Invalid administrative credentials");
      }
    } catch (err: any) {
      setError("Network error connecting to administration gateway.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans">
      {/* Centered Modal Card - Decreased width, Increased height, Tall Flex Column */}
      <div className="w-full max-w-[350px] min-h-[480px] bg-white dark:bg-emerald-deep/90 border border-gold/25 p-6 py-12 rounded-sm shadow-2xl flex flex-col justify-between text-center">
        
        {/* Top: Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-rich/50 dark:text-luxury-cream/50 hover:text-gold dark:hover:text-gold transition-colors uppercase tracking-wider self-start"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Lounge
        </Link>

        {/* Middle: Brand Logo */}
        <div className="flex flex-col items-center gap-3 my-auto py-2">
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt="Stayora Logo" className="h-12 w-auto mx-auto object-contain animate-fade-in" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-light text-emerald-rich dark:text-white leading-tight">
              Admin <span className="font-semibold text-gold">Console</span>
            </h1>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
              Authorized access gateway. Please enter credentials.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-[10px] font-semibold my-2 flex items-center gap-2 text-left">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <Input
            id="admin-email"
            label="Authorized Administrator Account"
            type="text"
            placeholder="Admin@stayora"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-xs"
          />

          <Input
            id="admin-password"
            label="Confidential Access Key"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="text-xs"
          />

          <Button
            type="submit"
            variant="luxury"
            size="md"
            isLoading={isLoading}
            className="w-full h-11 text-xs font-semibold uppercase tracking-wider mt-2"
          >
            Authorize Console Access
          </Button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
