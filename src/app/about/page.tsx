import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { Compass, ShieldCheck, Heart, Sparkles } from "lucide-react";

export const metadata = {
  title: "Our Story | Stayora Luxury Travel",
  description: "Learn about Stayora's journey, our commitment to exquisite sanctuaries, and how we craft bespoke experiences for discerning travelers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF7] dark:bg-emerald-deep text-luxury-black dark:text-luxury-cream transition-colors duration-500 font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-emerald-rich text-luxury-cream pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col gap-4 items-center">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold flex items-center gap-1.5 animate-pulse">
            <Sparkles className="h-4 w-4" /> Since 2024
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light tracking-wide leading-tight">
            The Story of <span className="font-semibold text-gold">Stayora</span>
          </h1>
          <hr className="w-12 border-gold" />
          <p className="text-xs sm:text-sm text-luxury-cream/70 max-w-xl leading-relaxed">
            From a single stone sanctuary in the hills of Tuscany to a curated global portfolio of luxury retreats.
          </p>
        </div>
      </section>

      {/* Story Sections */}
      <main className="flex-grow max-w-4xl mx-auto px-6 py-20 flex flex-col gap-16 text-left">
        
        {/* Origin Story */}
        <section className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-dark">Chapter I</span>
            <h2 className="font-display text-3xl font-light text-emerald-rich dark:text-gold leading-tight">
              A Pursuit of <span className="font-semibold">True Sanctuary</span>
            </h2>
            <p className="text-sm leading-relaxed text-emerald-rich/80 dark:text-luxury-cream/80 font-light">
              Stayora began with a simple observation: in a world that is constantly accelerating, the ultimate luxury is unhurried time. Our founders, lifelong travelers and curators, realized that standard premium accommodations often lacked soul. They set out to find spaces that were not merely lodging, but sanctuaries.
            </p>
            <p className="text-sm leading-relaxed text-emerald-rich/80 dark:text-luxury-cream/80 font-light">
              Our very first property was an ancient, stone-walled estate overlooking Tuscan olive groves. It had no signs, no formal reception desks, only the gentle chime of afternoon bells and a view that captured the heart. We realized that true luxury lies in absolute privacy, historic depth, and exquisite design.
            </p>
          </div>
          <div className="flex-1 w-full h-80 rounded-sm overflow-hidden border border-gold/15 relative shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
              alt="Tuscan Estate Sanctuary"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-emerald-rich/5" />
          </div>
        </section>

        {/* Curation Philosophy */}
        <section className="flex flex-col md:flex-row-reverse gap-12 items-center">
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-dark">Chapter II</span>
            <h2 className="font-display text-3xl font-light text-emerald-rich dark:text-gold leading-tight">
              Crafting <span className="font-semibold">Bespoke Journeys</span>
            </h2>
            <p className="text-sm leading-relaxed text-emerald-rich/80 dark:text-luxury-cream/80 font-light">
              We soon realized that a beautiful space is only half the canvas. The other half is the memories built within it. To complement our stays, we established the Stayora Concierge network—connecting travelers with certified local hosts, Michelin chefs, helicopter transfers, and private charters.
            </p>
            <p className="text-sm leading-relaxed text-emerald-rich/80 dark:text-luxury-cream/80 font-light">
              We vet every single property on our platform against strict standards: architectural relevance, acoustic serenity, custom furnishings, and proximity to cultural sanctuaries. If a place doesn’t inspire peace and wanderlust, it doesn't belong in the Stayora portfolio.
            </p>
          </div>
          <div className="flex-1 w-full h-80 rounded-sm overflow-hidden border border-gold/15 relative shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=800&q=80"
              alt="Luxury Experiences Charter"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-emerald-rich/5" />
          </div>
        </section>

        {/* Commitment Banner */}
        <section className="border border-gold/25 bg-emerald-rich/5 dark:bg-emerald-deep/40 p-8 sm:p-10 rounded-sm relative overflow-hidden flex flex-col items-center text-center gap-6 mt-6">
          <div className="absolute -top-12 -left-12 h-24 w-24 bg-gold/5 rounded-full blur-xl" />
          <div className="absolute -bottom-12 -right-12 h-24 w-24 bg-gold/5 rounded-full blur-xl" />
          
          <Compass className="h-10 w-10 text-gold animate-spin-slow" />
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold">Our Continuous Philosophy</h3>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed font-light">
              Stayora is not just a booking agency. We are a family of travel connoisseurs committed to sustainable preservation, heritage architecture appreciation, and exceptional personal concierge service. Your escape is our masterpiece.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <Link href="/stays">
              <Button variant="primary" size="md" className="uppercase font-bold tracking-wider text-xs h-10 px-6">Explore Stays</Button>
            </Link>
            <Link href="/experiences">
              <Button variant="outline" size="md" className="uppercase font-bold tracking-wider text-xs h-10 px-6">Explore Experiences</Button>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
