export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Destination from "@/models/Destination";
import Property from "@/models/Property";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Compass, Sparkles, MapPin } from "lucide-react";

export const metadata = {
  title: "Exclusive Destinations | Stayora Curated Travel",
  description: "Explore Stayora's portfolio of curated world-class travel locations including the French Riviera, Amalfi Coast, and Swiss Alps.",
};

export default async function DestinationsPage() {
  await connectToDatabase();
  const destinations = await Destination.find().sort({ isFeatured: -1, name: 1 });

  // Dynamically query property counts for each destination to ensure data accuracy
  const destinationsWithCounts = await Promise.all(
    destinations.map(async (dest) => {
      // Find properties matching the destination city name or description keywords
      const count = await Property.countDocuments({
        status: "published",
        $or: [
          { destination: dest._id },
          { city: { $regex: dest.name, $options: "i" } },
          { country: { $regex: dest.name, $options: "i" } },
        ],
      });
      return {
        ...dest.toObject(),
        propertiesCount: count || dest.propertiesCount || 0,
      };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream dark:bg-emerald-deep font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-emerald-rich text-luxury-cream pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col gap-4 items-center">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold flex items-center gap-1.5">
            <Compass className="h-4 w-4" /> Curated Worlds
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light tracking-wide">
            Our <span className="font-semibold text-gold">Exclusive Destinations</span>
          </h1>
          <hr className="w-12 border-gold" />
          <p className="text-xs sm:text-sm text-luxury-cream/70 max-w-xl leading-relaxed">
            From private sun-soaked coves to majestic alpine valleys, we present a collection of destinations that redefine luxury and offer absolute peace.
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-20 w-full flex flex-col gap-12 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinationsWithCounts.map((dest) => (
            <Link
              key={dest.slug}
              href={`/stays?destination=${encodeURIComponent(dest.name)}`}
              className="group flex flex-col h-full"
            >
              <Card className="flex flex-col w-full h-full relative overflow-hidden justify-between transition-all duration-500 hover:shadow-xl hover:border-gold/50 hover:-translate-y-1">
                {/* Image Container */}
                <div className="h-56 overflow-hidden relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 bg-emerald-deep/80 backdrop-blur-md px-3.5 py-1.5 border border-gold/30 rounded-full">
                    <span className="text-[10px] font-bold text-gold tracking-widest uppercase">
                      {dest.propertiesCount} {dest.propertiesCount === 1 ? "Stay" : "Stays"}
                    </span>
                  </div>
                </div>

                <CardHeader className="flex-1 p-6 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl sm:text-2xl font-semibold group-hover:text-gold transition-colors duration-300 font-display">
                      {dest.name}
                    </CardTitle>
                    {dest.isFeatured && (
                      <span className="flex items-center gap-1 shrink-0 text-[9px] uppercase tracking-wider bg-gold-dark/10 text-gold-dark dark:bg-gold/10 dark:text-gold px-2 py-1 border border-gold-dark/20 dark:border-gold/20 rounded-full font-bold">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                    )}
                  </div>
                  <CardDescription className="line-clamp-3 text-[13px] text-emerald-rich/70 dark:text-luxury-cream/70 leading-relaxed font-light mt-1">
                    {dest.description}
                  </CardDescription>

                  {/* Popular Spots horizontal thumbnail badges wrapper */}
                  {dest.popularSpots && dest.popularSpots.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 border-t border-gold/10 pt-3 text-left">
                      <span className="text-[10px] font-bold text-gold-dark dark:text-gold uppercase tracking-wider">
                        Popular Spots & Excursions:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {dest.popularSpots.slice(0, 3).map((spot: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 bg-emerald-rich/5 dark:bg-emerald-deep/40 px-2.5 py-1 border border-gold/15 rounded-full text-[11px] text-emerald-rich dark:text-luxury-cream/90"
                            title={`Activities: ${spot.activities?.join(', ') || 'Various activities'}`}
                          >
                            {spot.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={spot.image}
                                alt={spot.name}
                                className="h-4 w-4 object-cover rounded-full shrink-0"
                              />
                            )}
                            <span className="font-semibold text-[10px]">{spot.name}</span>
                          </div>
                        ))}
                        {dest.popularSpots.length > 3 && (
                          <span className="text-[10px] font-semibold text-muted-foreground self-center px-1">
                            +{dest.popularSpots.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="px-6 pb-6 pt-0 shrink-0">
                  <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-2 group-hover:bg-gold group-hover:text-emerald-deep group-hover:border-gold transition-all duration-300">
                    Explore Stays <ArrowIcon />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
