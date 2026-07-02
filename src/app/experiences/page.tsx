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
  description: "Enhance your stay with Stayora's exclusive experiences, including private yacht charters, helicopter transfers, and Michelin-starred dining.",
};

export default async function ExperiencesPage() {
  await connectToDatabase();
  const dbPackages = await TourPackage.find().sort({ createdAt: -1 });

  const experiences = dbPackages.map((p) => ({
    title: p.title,
    description: p.description,
    duration: p.duration,
    price: p.price,
    location: p.location,
    image: p.image,
  }));

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
            Enhance your stay with our tailored add-ons. From high-alpine transfers to personal chefs and private cruises, our concierge handles every detail.
          </p>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-20 w-full flex flex-col gap-12 text-left">
        {experiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((exp) => (
              <Card key={exp.title} className="group border border-gold/10 relative overflow-hidden bg-white dark:bg-emerald-deep/40 shadow-sm rounded-sm h-[30rem] flex flex-col justify-between">
                {/* Image Panel */}
                <div className="relative h-56 overflow-hidden bg-luxury-sand shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Details Header */}
                <CardHeader className="p-4 flex flex-col gap-1 text-left flex-grow">
                  <CardTitle className="text-base font-bold text-emerald-rich dark:text-luxury-cream hover:text-gold transition-colors line-clamp-1 block">
                    {exp.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3 text-gold-dark shrink-0" /> {exp.location.split(",")[0]}</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3 text-gold-dark shrink-0" /> {exp.duration.split(" ")[0]} {exp.duration.split(" ")[1] || ""}</span>
                  </div>
                  <CardDescription className="line-clamp-3 text-xs leading-relaxed mt-2">
                    {exp.description}
                  </CardDescription>
                </CardHeader>

                {/* Price & Action Footer */}
                <CardFooter className="p-4 pt-0 justify-between items-center border-t border-emerald-rich/5 mt-2 bg-emerald-rich/[0.01] shrink-0">
                  <span className="text-sm font-bold text-emerald-rich dark:text-gold font-display">
                    From {formatCurrency(exp.price)}{" "}
                  </span>
                  <a
                    href={`https://wa.me/919876543210?text=Hi%20Stayora%2C%20I%20am%20interested%20in%20inquiring%20details%20about%20the%20experience%3A%20${encodeURIComponent(exp.title)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="luxury" size="sm" className="h-8 py-0 px-4 text-xs font-bold">
                      Inquire Details
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-gold/20 rounded-sm bg-white dark:bg-emerald-deep">
            <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold mb-2">No Experiences Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              We couldn&apos;t find any bespoke excursions in our portfolio at this time. Please contact our concierge desk for custom bookings.
            </p>
          </div>
        )}

        {/* Banner Section */}
        <div className="mt-12 p-8 border border-gold/20 bg-emerald-rich/5 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 text-gold mt-1 shrink-0" />
            <div className="text-left">
              <h3 className="font-display text-xl font-bold text-emerald-rich dark:text-gold">Custom Itinerary</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Have a specific request? Our concierge hosts specialize in organizing customized private jet flights, chef service hires, event planning, and secure security escorts anywhere in the world.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/919876543210?text=Hi%20Stayora%2C%20I%20would%20like%20to%20request%20a%20Custom%20Itinerary%20for%20my%20upcoming%20travels."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="primary" size="md" className="w-full">Request Custom Itinerary</Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
