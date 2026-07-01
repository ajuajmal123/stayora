import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { Compass, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Our Story | Stayora Luxury Travel",
  description: "Welcome to Stayora: Where Exceptional Stays Begin. Read about our vision, our promise, and the Stayora experience.",
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
            <Sparkles className="h-4 w-4" /> Welcome to Stayora
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light tracking-wide leading-tight">
            Where Exceptional <span className="font-semibold text-gold">Stays Begin</span>
          </h1>
          <hr className="w-12 border-gold" />
          <p className="text-sm text-luxury-cream/70 max-w-2xl leading-relaxed italic font-light">
            At Stayora, we believe that travel is more than just reaching a destination—it is about the environment you step into, the ambiance you experience, and the memories you take home.
          </p>
        </div>
      </section>

      {/* Story Content */}
      <main className="flex-grow max-w-3xl mx-auto px-6 py-20 flex flex-col gap-12 text-left">
        
        {/* Redefining modern getaway */}
        <section className="flex flex-col gap-6">
          <p className="text-base leading-relaxed text-emerald-rich/80 dark:text-luxury-cream/85 font-light">
            We are dedicated to redefining the modern getaway by offering curated, premium accommodations that seamlessly blend profound comfort with striking, sophisticated design.
          </p>
        </section>

        {/* Vision */}
        <section className="flex flex-col gap-4 border-t border-gold/15 pt-8">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-dark font-semibold">Our Vision</span>
          <h2 className="font-display text-2xl font-light text-emerald-rich dark:text-gold leading-tight">
            Elevating the <span className="font-semibold">Standard of Hospitality</span>
          </h2>
          <p className="text-sm leading-relaxed text-emerald-rich/80 dark:text-luxury-cream/80 font-light mt-2">
            We created Stayora with a singular vision: to elevate the standard of hospitality. Whether you are seeking a tranquil retreat immersed in nature or a highly refined escape, our goal is to provide spaces that feel both cinematic and deeply welcoming. We view every stay as an opportunity to provide a beautifully crafted backdrop for your journey.
          </p>
        </section>

        {/* Experience */}
        <section className="flex flex-col gap-4 border-t border-gold/15 pt-8">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-dark font-semibold">The Experience</span>
          <h2 className="font-display text-2xl font-light text-emerald-rich dark:text-gold leading-tight">
            We Understand that <span className="font-semibold">Details Matter</span>
          </h2>
          <p className="text-sm leading-relaxed text-emerald-rich/80 dark:text-luxury-cream/80 font-light mt-2 mb-4">
            Our spaces are meticulously designed to offer a high-end, editorial aesthetic without compromising on warmth or functionality. When you book with Stayora, you can expect:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-emerald-rich dark:text-gold uppercase tracking-wider">Curated Excellence</span>
                <span className="text-xs text-muted-foreground font-light leading-relaxed">Accommodations chosen and designed with an uncompromising eye for quality and style.</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-emerald-rich dark:text-gold uppercase tracking-wider">Unrivaled Ambiance</span>
                <span className="text-xs text-muted-foreground font-light leading-relaxed">Environments crafted to transport you, offering the perfect balance of luxury and relaxation.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-emerald-rich dark:text-gold uppercase tracking-wider">Absolute Privacy</span>
                <span className="text-xs text-muted-foreground font-light leading-relaxed">A commitment to your peace of mind, ensuring your time with us is secure, private, and entirely your own.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-emerald-rich dark:text-gold uppercase tracking-wider">Seamless Hospitality</span>
                <span className="text-xs text-muted-foreground font-light leading-relaxed">From the moment you discover us to the moment you check out, we provide a smooth, professional, and personalized experience.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Promise & Call-to-action */}
        <section className="border border-gold/25 bg-emerald-rich/5 dark:bg-emerald-deep/40 p-8 sm:p-10 rounded-sm relative overflow-hidden flex flex-col items-center text-center gap-6 mt-6">
          <div className="absolute -top-12 -left-12 h-24 w-24 bg-gold/5 rounded-full blur-xl" />
          <div className="absolute -bottom-12 -right-12 h-24 w-24 bg-gold/5 rounded-full blur-xl" />
          
          <Compass className="h-10 w-10 text-gold animate-spin-slow" />
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold">Our Promise</h3>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed font-light">
              Travel should inspire. At Stayora, we are passionate about hosting you in spaces that reflect the beauty of their surroundings and the elegance of premium design. We invite you to step out of the ordinary and experience a new standard of stay.
            </p>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <Link href="/stays">
              <Button variant="primary" size="md" className="uppercase font-bold tracking-wider text-xs h-10 px-8">Discover Your Next Escape</Button>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
