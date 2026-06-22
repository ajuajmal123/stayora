import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Compass, Clock, Award, ShieldCheck, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import TourPackage from "@/models/TourPackage";

export const metadata = {
  title: "Bespoke Experiences | Stayora Curated Travel",
  description: "Enhance your stay with Stayora's exclusive luxury experiences, including private yacht charters, helicopter transfers, and Michelin-starred dining.",
};

const defaultExperiences = [
  {
    title: "Mediterranean Yacht Charter",
    description: "Cruise the French Riviera or Amalfi Coast aboard a private 80ft luxury yacht. The day includes a dedicated skipper, chef-curated seafood lunch, champagne bar, and water sports equipment.",
    duration: "Full Day (8 Hours)",
    price: 4500,
    location: "St. Tropez / Positano",
    image: "https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Alpine Helicopter Transfer",
    description: "Skip the roads and glide over the Swiss Alps with a scenic helicopter flight to Zermatt, featuring panoramic Matterhorn views and direct landing access.",
    duration: "Flight (45 Minutes)",
    price: 1800,
    location: "Zermatt, Switzerland",
    image: "https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Private Kaiseki Dining",
    description: "A multi-course Japanese culinary masterpiece prepared in your private Ryokan kitchen by a Michelin-starred master chef, featuring seasonal Kyoto ingredients and sake pairing.",
    duration: "Evening (3 Hours)",
    price: 650,
    location: "Kyoto, Japan",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Desert Slot Canyon Exploration",
    description: "A private, geologist-led excursion into private slot canyons in southern Utah. Includes gourmet desert picnic, custom photography session, and sunset wine tasting.",
    duration: "Half Day (5 Hours)",
    price: 1200,
    location: "Canyon Point, Utah",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
  },
];

export default async function ExperiencesPage() {
  await connectToDatabase();
  const dbPackages = await TourPackage.find().sort({ createdAt: -1 });

  // Map database entries or fall back to high-res design items
  const experiences = dbPackages.length > 0 
    ? dbPackages.map((p) => ({
        title: p.title,
        description: p.description,
        duration: p.duration,
        price: p.price,
        location: p.location,
        image: p.image,
      }))
    : defaultExperiences;

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream dark:bg-emerald-deep font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-emerald-rich text-luxury-cream pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col gap-4 items-center">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold flex items-center gap-1.5">
            <Award className="h-4 w-4" /> Bespoke Services
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light tracking-wide">
            Bespoke <span className="font-semibold text-gold">Travel Experiences</span>
          </h1>
          <hr className="w-12 border-gold" />
          <p className="text-xs sm:text-sm text-luxury-cream/70 max-w-xl leading-relaxed">
            Enhance your luxury stay with our tailored add-ons. From high-alpine transfers to personal chefs and private cruises, our concierge handles every detail.
          </p>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-20 w-full flex flex-col gap-12 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiences.map((exp) => (
            <Card key={exp.title} className="group flex flex-col md:flex-row h-auto md:h-80 overflow-hidden border border-gold/10">
              {/* Image Panel */}
              <div className="w-full md:w-2/5 h-56 md:h-auto overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Details Panel */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-xl font-bold hover:text-gold transition-colors">{exp.title}</CardTitle>
                    <span className="text-sm font-bold text-emerald-rich dark:text-gold shrink-0">
                      From {formatCurrency(exp.price)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground font-semibold mt-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gold-dark" /> {exp.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gold-dark" /> {exp.duration}</span>
                  </div>
                  <CardDescription className="line-clamp-4 text-xs leading-relaxed mt-4">
                    {exp.description}
                  </CardDescription>
                </div>

                <CardFooter className="p-0 border-t-0 mt-4 self-end">
                  <Button variant="luxury" size="sm">
                    Inquire Details
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>

        {/* Banner Section */}
        <div className="mt-12 p-8 border border-gold/20 bg-emerald-rich/5 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 text-gold mt-1 shrink-0" />
            <div className="text-left">
              <h3 className="font-display text-xl font-bold text-emerald-rich dark:text-gold">Custom Luxury Itinerary</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Have a specific request? Our concierge hosts specialize in organizing customized private jet flights, chef service hires, event planning, and secure security escorts anywhere in the world.
              </p>
            </div>
          </div>
          <Button variant="primary" size="md" className="shrink-0">Request Custom Itinerary</Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
