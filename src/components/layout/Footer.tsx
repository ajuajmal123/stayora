"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "../ui/Button";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const body = await response.json();

      if (body.success) {
        setStatus({ type: "success", message: body.message || "Thank you for subscribing!" });
        setEmail("");
      } else {
        setStatus({ type: "error", message: body.message || "Subscription failed." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerLinks = [
    {
      title: "Explore",
      links: [
        { name: "Private Villas", href: "#" },
        { name: "Luxury Penthouses", href: "#" },
        { name: "Curated Resorts", href: "#" },
        { name: "Destinations", href: "#" },
      ],
    },
    {
      title: "Services",
      links: [
        { name: "Chauffeur Services", href: "#" },
        { name: "Private Jet Booking", href: "#" },
        { name: "Concierge 24/7", href: "#" },
        { name: "Exclusive Events", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "Our Story", href: "#" },
        { name: "Partner With Us", href: "#" },
        { name: "Press & Media", href: "#" },
        { name: "Careers", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-emerald-deep text-luxury-cream border-t border-gold/15 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
        
        {/* Brand description */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Link href="/" className="flex items-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt="Stayora Logo" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-102" />
          </Link>
          <p className="text-sm text-luxury-cream/70 leading-relaxed max-w-sm">
            Stayora redefines the art of travel. We connect discerning travelers with the world’s most exquisite, private properties and bespoke experiences, crafted for absolute comfort and luxury.
          </p>
          <div className="flex items-center gap-4 text-gold-subtle">
            <Link href="#" className="hover:text-gold transition-colors" aria-label="Instagram">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
            <Link href="#" className="hover:text-gold transition-colors" aria-label="Facebook">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </Link>
            <Link href="#" className="hover:text-gold transition-colors" aria-label="Twitter">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Link Columns */}
        {footerLinks.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-widest text-gold font-bold">{column.title}</h4>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-luxury-cream/60 hover:text-gold transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter Signup */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-widest text-gold font-bold">Newsletter</h4>
          <p className="text-xs text-luxury-cream/60 leading-relaxed">
            Subscribe to receive exclusive access to our newest luxury destinations and travel guides.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2 relative">
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-gold/60" />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-12 rounded-sm border border-gold/20 bg-emerald-accent text-sm text-luxury-cream focus:outline-none focus:border-gold placeholder:text-luxury-cream/40"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-1 w-9 h-9 flex items-center justify-center bg-gold hover:bg-gold-dark text-emerald-deep rounded-sm transition-colors duration-300"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            {status.type && (
              <span
                className={cn(
                  "text-[11px] mt-1 font-medium tracking-wide",
                  status.type === "success" ? "text-gold" : "text-red-400"
                )}
              >
                {status.message}
              </span>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-gold/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-luxury-cream/40">
        <p>© {new Date().getFullYear()} Stayora Enterprises. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-gold transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-gold transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
