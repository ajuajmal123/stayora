"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import Skeleton from "@/components/ui/Skeleton";
import { MapPin, Users, BedDouble, Bath, Star, Compass, ShieldCheck, Award } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");

  const mockProperties = [
    {
      title: "Villa Céleste",
      description: "Perched high above the French Riviera, Villa Céleste offers panoramic sea vistas, infinity-edge swimming pool, and dedicated butler service.",
      type: "Villa",
      pricePerNight: 2450,
      city: "St. Tropez",
      country: "France",
      rating: 4.98,
      reviewsCount: 34,
      bedrooms: 6,
      bathrooms: 7,
      maxGuests: 12,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "The Obsidian Canopy",
      description: "An architectural marvel constructed in the Icelandic woodlands, featuring geothermal pools, full floor-to-ceiling glass walls, and northern lights viewing deck.",
      type: "Resort",
      pricePerNight: 1850,
      city: "Grímsnes",
      country: "Iceland",
      rating: 4.92,
      reviewsCount: 19,
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream dark:bg-emerald-deep text-luxury-black dark:text-luxury-cream transition-colors duration-500">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-emerald-deep/65 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col gap-6 items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-emerald-accent/60 backdrop-blur-md text-[10px] sm:text-xs text-gold uppercase tracking-[0.2em] font-bold"
          >
            <Award className="h-4 w-4" /> The Gold Standard of Stays
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl font-light text-luxury-cream leading-tight max-w-4xl"
          >
            Refining the Art of <span className="font-bold text-gold">Luxury Travel</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-luxury-cream/70 text-base md:text-lg max-w-2xl font-light leading-relaxed font-sans"
          >
            Discover and book exclusive private estates, high-end design villas, and luxury boutique resorts meticulously curated for the world’s most discerning travelers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4"
          >
            <Button variant="luxury" size="lg" onClick={() => setIsModalOpen(true)}>
              Explore Showcase
            </Button>
            <Button variant="outline" size="lg" className="border-luxury-cream text-luxury-cream hover:bg-luxury-cream/15">
              Contact Concierge
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Showcase Grid of Platform Infrastructure */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full flex flex-col gap-16">
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Reusable Core Components</span>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-emerald-rich dark:text-luxury-cream">
            Built for Scale & Luxury
          </h2>
          <hr className="w-12 mx-auto border-gold mt-2" />
        </div>

        {/* Mock Property Cards */}
        <div className="flex flex-col gap-8">
          <h3 className="font-display text-2xl font-semibold text-emerald-rich dark:text-gold-subtle border-b border-emerald-rich/5 pb-2">
            Property Display Showcase (Cards & Image Zoom)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mockProperties.map((prop) => (
              <Card key={prop.title}>
                <div className="relative h-72 overflow-hidden bg-luxury-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-deep/80 backdrop-blur-md px-3 py-1 border border-gold/20 rounded-sm">
                    <span className="text-[10px] uppercase font-bold text-gold tracking-widest">{prop.type}</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-emerald-deep/90 backdrop-blur-sm px-2 py-1 rounded-sm flex items-center gap-1 text-xs font-semibold text-emerald-rich dark:text-gold">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {prop.rating}
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{prop.title}</CardTitle>
                    <span className="text-lg font-bold text-emerald-rich dark:text-gold">
                      {formatCurrency(prop.pricePerNight)} <span className="text-xs font-normal text-muted-foreground">/ night</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/80 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-gold-dark" />
                    <span>{prop.city}, {prop.country}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="line-clamp-2">{prop.description}</CardDescription>
                  
                  {/* Property Details */}
                  <div className="grid grid-cols-3 gap-4 border-t border-emerald-rich/5 mt-6 pt-4 text-xs font-medium text-emerald-rich/80 dark:text-luxury-cream/80">
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4.5 w-4.5 text-gold" />
                      <span>{prop.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-4.5 w-4.5 text-gold" />
                      <span>{prop.bathrooms} Bathrooms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4.5 w-4.5 text-gold" />
                      <span>{prop.maxGuests} Guests</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="justify-between items-center bg-emerald-rich/[0.02] dark:bg-emerald-light/[0.01]">
                  <span className="text-[11px] text-muted-foreground">Inclusive of custom luxury amenities</span>
                  <Button variant="outline" size="sm">Book Now</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Buttons and Inputs Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          
          {/* Buttons showcase */}
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-2xl font-semibold text-emerald-rich dark:text-gold-subtle border-b border-emerald-rich/5 pb-2">
              Premium Button Variants
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary Emerald</Button>
              <Button variant="secondary">Secondary Cream</Button>
              <Button variant="outline">Gold Outline</Button>
              <Button variant="luxury">Luxury Gold Gradient</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="primary" isLoading>Loading State</Button>
            </div>
          </div>

          {/* Inputs showcase */}
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-2xl font-semibold text-emerald-rich dark:text-gold-subtle border-b border-emerald-rich/5 pb-2">
              Luxury Input Fields
            </h3>
            <div className="flex flex-col gap-4">
              <Input
                id="showcase-email"
                label="Sample Floating Label Input"
                type="email"
                placeholder="alexander@luxurystays.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Input
                id="showcase-pass"
                label="Required Validation Input"
                type="password"
                placeholder="Password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                error={testPassword.length > 0 && testPassword.length < 6 ? "Password must be at least 6 characters long" : undefined}
              />
            </div>
          </div>

        </div>

        {/* Loaders & Skeleton Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-2xl font-semibold text-emerald-rich dark:text-gold-subtle border-b border-emerald-rich/5 pb-2">
              Gold Shimmer Skeletons
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-28 w-full" />
            </div>
          </div>

          <div className="flex flex-col gap-6 justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-emerald-rich dark:text-gold-subtle border-b border-emerald-rich/5 pb-2">
                Luxury Spinner Loader
              </h3>
              <Loader size="md" text="Loading exclusive experiences..." />
            </div>

            <div className="flex flex-col gap-4 bg-emerald-rich/5 dark:bg-emerald-accent/20 border border-gold/15 p-6 rounded-sm">
              <h4 className="font-display text-lg font-bold text-emerald-rich dark:text-gold">Interactive Animated Modal</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Test the modal animation logic which uses Framer Motion spring curves and HSL backdrop-blur layers.
              </p>
              <Button variant="luxury" size="sm" onClick={() => setIsModalOpen(true)} className="self-start">
                Open Dialog Modal
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* Info Sections for Premium Quality */}
      <section className="bg-emerald-rich py-24 text-luxury-cream">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Compass className="h-8 w-8 text-gold" />
            <h3 className="font-display text-xl font-semibold tracking-wide">Curated Stays</h3>
            <p className="text-xs text-luxury-cream/70 leading-relaxed max-w-xs">
              Every property undergoes a rigorous 150-point inspection covering aesthetics, location, privacy, and services.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <ShieldCheck className="h-8 w-8 text-gold" />
            <h3 className="font-display text-xl font-semibold tracking-wide">Secure Infrastructure</h3>
            <p className="text-xs text-luxury-cream/70 leading-relaxed max-w-xs">
              HTTP-only secure auth cookies, database-level encryption tokens, and role validations secure all operations.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Users className="h-8 w-8 text-gold" />
            <h3 className="font-display text-xl font-semibold tracking-wide">Bespoke Concierge</h3>
            <p className="text-xs text-luxury-cream/70 leading-relaxed max-w-xs">
              Registered members receive access to a dedicated concierge agent to customize itineraries and coordinate flights.
            </p>
          </div>
        </div>
      </section>

      {/* Test Modal Component */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Exclusive Membership Benefits">
        <div className="flex flex-col gap-4 text-emerald-rich dark:text-luxury-cream">
          <p className="text-sm leading-relaxed">
            Welcome to the Stayora private portal. Our members gain unprecedented access to premium vacation packages, private jet brokers, and early booking schedules.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            <div className="border border-gold/15 p-4 bg-emerald-rich/5 rounded-sm flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gold uppercase tracking-wider">Premium Access</span>
              <p className="text-xs text-muted-foreground">Book boutique penthouses 30 days prior to general public listings.</p>
            </div>
            <div className="border border-gold/15 p-4 bg-emerald-rich/5 rounded-sm flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gold uppercase tracking-wider">Concierge Integration</span>
              <p className="text-xs text-muted-foreground">Direct booking link to professional personal travel hosts.</p>
            </div>
          </div>
          <Button variant="luxury" size="md" onClick={() => setIsModalOpen(false)} className="mt-4 self-end">
            Accept Invitation
          </Button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
