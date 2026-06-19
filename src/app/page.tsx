import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Property from "@/models/Property";
import Destination from "@/models/Destination";
import User from "@/models/User";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomeSearch from "@/components/home/HomeSearch";
import WishlistToggle from "@/components/stays/WishlistToggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Compass, Users, ShieldCheck, Award, MapPin, Star, BedDouble, Bath, ArrowRight, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

// Fetch user wishlist if authenticated
async function getWishlistSet(): Promise<Set<string>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return new Set();

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) return new Set();

  await connectToDatabase();
  const user = await User.findById(decoded.id).select("wishlist");
  if (!user || !user.wishlist) return new Set();

  return new Set(user.wishlist.map((id: any) => id.toString()));
}

export default async function HomePage() {
  await connectToDatabase();

  // 1. Fetch featured properties (top rated first)
  const featuredStays = await Property.find({ status: "published" })
    .sort({ rating: -1, pricePerNight: -1 })
    .limit(4);

  // 2. Fetch list of unique destinations for the search dropdown
  const destinations = await Destination.find().distinct("name");
  const propertyCities = await Property.distinct("city");
  const uniqueDestinations = Array.from(new Set([...destinations, ...propertyCities])).sort();

  // 3. Fetch featured destinations cards (top 3)
  const featuredDestinations = await Destination.find({ isFeatured: true }).limit(3);

  // 4. Fetch saved wishlist property IDs
  const wishlistedIds = await getWishlistSet();

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream dark:bg-emerald-deep text-luxury-black dark:text-luxury-cream transition-colors duration-500">
      <Navbar />

      {/* Hero Header & Search Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
        {/* Background image */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-emerald-deep/65 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col gap-8 items-center mt-12">
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-emerald-accent/60 backdrop-blur-md text-[10px] sm:text-xs text-gold uppercase tracking-[0.2em] font-bold">
            <Award className="h-4 w-4" /> The Gold Standard of Stays
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light text-luxury-cream leading-tight max-w-4xl">
            Refining the Art of <span className="font-bold text-gold">Luxury Travel</span>
          </h1>

          <p className="text-luxury-cream/70 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed font-sans">
            Discover and book exclusive private estates, high-end design villas, and luxury boutique resorts meticulously curated for the world’s most discerning travelers.
          </p>

          {/* Hero search bar component */}
          <div className="w-full mt-4">
            <HomeSearch destinations={uniqueDestinations} />
          </div>

        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-20 bg-white dark:bg-emerald-deep/40 border-y border-gold/15">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          
          <div className="flex flex-col items-center gap-4 group">
            <div className="h-14 w-14 rounded-full border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-emerald-deep transition-all duration-500">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold tracking-wide">Curated Portfolio</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Every private villa and penthouse is vetted through our 150-point luxury inspection.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 group">
            <div className="h-14 w-14 rounded-full border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-emerald-deep transition-all duration-500">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold tracking-wide">Bespoke Concierge</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Direct, 24/7 access to personal travel hosts to customize dining, transport, and itineraries.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 group">
            <div className="h-14 w-14 rounded-full border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-emerald-deep transition-all duration-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold tracking-wide">Absolute Privacy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Secluded properties with advanced security integrations, private lifts, and secured beachheads.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 group">
            <div className="h-14 w-14 rounded-full border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-emerald-deep transition-all duration-500">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold tracking-wide">5-Star Standards</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Premium linens, fine art collections, custom spas, and professional chef services standard.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Stays Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full flex flex-col gap-12 text-left">
        <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Handpicked Retreats</span>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-emerald-rich dark:text-luxury-cream">
              Featured <span className="font-bold text-gold">Stays</span>
            </h2>
          </div>
          <Link href="/stays">
            <Button variant="outline" className="flex items-center gap-2 text-xs">
              View All Properties <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredStays.map((prop) => {
            const isSaved = wishlistedIds.has(prop._id.toString());
            return (
              <Card key={prop.slug} className="group">
                <div className="relative h-72 overflow-hidden bg-luxury-sand">
                  <Link href={`/stays/${prop.slug}`} className="block h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <div className="absolute top-4 left-4 bg-emerald-deep/80 backdrop-blur-md px-3 py-1 border border-gold/20 rounded-sm">
                    <span className="text-[10px] uppercase font-bold text-gold tracking-widest">{prop.type}</span>
                  </div>
                  {prop.rating > 0 && (
                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-emerald-deep/90 backdrop-blur-sm px-2 py-1 rounded-sm flex items-center gap-1 text-[10px] font-semibold text-emerald-rich dark:text-gold">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {prop.rating}
                    </div>
                  )}
                  {/* Floating Wishlist Heart */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <WishlistToggle
                      propertyId={prop._id.toString()}
                      initialIsWishlisted={isSaved}
                    />
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/stays/${prop.slug}`}>
                      <CardTitle className="hover:text-gold transition-colors">{prop.title}</CardTitle>
                    </Link>
                    <div className="text-right">
                      <span className="text-base font-bold text-emerald-rich dark:text-gold">
                        {formatCurrency(prop.pricePerNight)}
                      </span>
                      <span className="text-[10px] block text-muted-foreground font-normal">/ night</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/80 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-gold-dark" />
                    <span>{prop.city}, {prop.country}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="line-clamp-2 text-xs">{prop.description}</CardDescription>
                  
                  {/* Specs details */}
                  <div className="grid grid-cols-3 gap-2 border-t border-emerald-rich/5 mt-4 pt-3 text-[11px] font-medium text-emerald-rich/80 dark:text-luxury-cream/80">
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4 text-gold-dark" />
                      <span>{prop.bedrooms} Bed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4 text-gold-dark" />
                      <span>{prop.bathrooms} Bath</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gold-dark" />
                      <span>{prop.maxGuests} Max Guests</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="justify-between items-center bg-emerald-rich/[0.01] dark:bg-emerald-light/[0.005] border-t border-emerald-rich/5 py-3">
                  <span className="text-[10px] text-muted-foreground">Premium Concierge Standard</span>
                  <Link href={`/stays/${prop.slug}`}>
                    <Button variant="outline" size="sm" className="h-9 py-0">Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured Destinations Showcase */}
      <section className="py-24 bg-emerald-deep text-luxury-cream text-left relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-5" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
          
          <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Wanderlust Collections</span>
              <h2 className="font-display text-4xl sm:text-5xl font-light text-luxury-cream">
                Featured <span className="font-bold text-gold">Destinations</span>
              </h2>
            </div>
            <Link href="/destinations">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold/10 flex items-center gap-2 text-xs">
                View All Destinations <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDestinations.map((dest) => (
              <div key={dest.slug} className="group relative h-96 rounded-sm overflow-hidden border border-gold/15 shadow-lg flex flex-col justify-end p-6">
                <div className="absolute inset-0 z-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/40 to-transparent" />
                </div>
                
                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-wider bg-gold/15 text-gold border border-gold/20 px-2 py-0.5 rounded-sm font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Featured
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-luxury-cream">{dest.name}</h3>
                  <p className="text-xs text-luxury-cream/70 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                  <Link href={`/stays?destination=${encodeURIComponent(dest.name)}`} className="text-xs font-semibold text-gold hover:text-gold-light mt-2 flex items-center gap-1.5 self-start">
                    Explore Stays <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Brand Newsletter banner */}
      <section className="py-24 bg-white dark:bg-emerald-deep border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Exclusive Invitations</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-emerald-rich dark:text-luxury-cream">
            Join the Private Circle
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
            Subscribe to receive member-only travel deals, notifications of new estate reviews, and curated guides for world-class boutique tours.
          </p>
          <div className="w-full max-w-md border border-gold/15 p-4 rounded-sm bg-emerald-rich/[0.01]">
            <Link href="/register">
              <Button variant="luxury" size="lg" className="w-full">
                Register as Member
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
