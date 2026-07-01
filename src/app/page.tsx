import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Property from "@/models/Property";
import Destination from "@/models/Destination";
import TourPackage from "@/models/TourPackage";
import User from "@/models/User";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomeHero from "@/components/home/HomeHero";
import WishlistToggle from "@/components/stays/WishlistToggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Compass,
  Users,
  ShieldCheck,
  Award,
  MapPin,
  Star,
  BedDouble,
  Bath,
  ArrowRight,
  Sparkles,
  Search,
  Calendar as CalendarIcon,
  ShieldAlert,
  Heart,
  Clock
} from "lucide-react";
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
  try {
    await connectToDatabase();

    // Fetch list of unique destinations for the search dropdown
    const destinations = await Destination.find().distinct("name");
    const propertyCities = await Property.distinct("city");
    const uniqueDestinations = Array.from(new Set([...destinations, ...propertyCities])).sort();

    // Fetch saved wishlist property IDs
    const wishlistedIds = await getWishlistSet();

    // Fetch featured properties (published properties, sorted by rating desc, limited to 4)
    const dbProperties = await Property.find({ status: "published" }).sort({ rating: -1 }).limit(4);

    // Fetch featured destinations
    const dbFeaturedDestinations = await Destination.find({ isFeatured: true }).limit(3);
    const destinationsList = dbFeaturedDestinations.map(d => ({
      name: d.name,
      description: d.description,
      image: d.image,
      propertiesCount: d.propertiesCount || 0,
      popularSpots: d.popularSpots || []
    }));

    // Fetch featured packages
    const dbFeaturedPackages = await TourPackage.find({ isFeatured: true }).limit(2);
    const packagesList = dbFeaturedPackages.map(p => ({
      title: p.title,
      description: p.description,
      duration: p.duration,
      price: p.price,
      location: p.location,
      image: p.image
    }));

    return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF7] dark:bg-emerald-deep text-luxury-black dark:text-luxury-cream transition-colors duration-500 font-sans">
      <Navbar />

      {/* Dynamic Interactive Home Hero with Video loop support */}
      <HomeHero destinations={uniqueDestinations} />

      {/* Trust Badges Section */}
      <section className="py-14 bg-white dark:bg-emerald-deep/40 border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          
          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-full border border-gold/25 flex items-center justify-center text-gold bg-gold/5 group-hover:bg-gold/15 transition-all duration-500 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold tracking-wide uppercase text-emerald-rich dark:text-gold">Trusted & Verified</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Quality stays you can trust.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-full border border-gold/25 flex items-center justify-center text-gold bg-gold/5 group-hover:bg-gold/15 transition-all duration-500 shrink-0">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold tracking-wide uppercase text-emerald-rich dark:text-gold">Best Price Guarantee</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Get the best deals always.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-full border border-gold/25 flex items-center justify-center text-gold bg-gold/5 group-hover:bg-gold/15 transition-all duration-500 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold tracking-wide uppercase text-emerald-rich dark:text-gold">24/7 Support</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                We&apos;re here for you anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-full border border-gold/25 flex items-center justify-center text-gold bg-gold/5 group-hover:bg-gold/15 transition-all duration-500 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold tracking-wide uppercase text-emerald-rich dark:text-gold">Secure Booking</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Book with absolute confidence.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Stays Section */}
      {dbProperties.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-6 w-full flex flex-col gap-10 text-left">
          <div className="flex items-end justify-between border-b border-gold/10 pb-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-3xl font-light text-emerald-rich dark:text-luxury-cream">
                Featured <span className="font-semibold text-gold">Stays</span>
              </h2>
            </div>
            <Link href="/stays" className="text-xs font-bold text-gold hover:text-gold-light flex items-center gap-1 hover:underline tracking-wide uppercase">
              View all stays <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dbProperties.map((prop) => {
              const isSaved = wishlistedIds.has(prop._id.toString());
              return (
                <Card key={prop.slug} className="group border border-gold/10 relative overflow-hidden bg-white dark:bg-emerald-deep/40 shadow-sm hover:shadow-xl hover:border-gold/30 rounded-sm h-[30rem] flex flex-col justify-between transition-all duration-500 hover:-translate-y-1">
                  {/* Photo container */}
                  <div className="relative h-56 overflow-hidden bg-luxury-sand shrink-0">
                    <Link href={`/stays/${prop.slug}`} className="block h-full w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>

                    {/* Floating Category tag */}
                    <div className="absolute top-3 left-3 bg-emerald-deep/80 backdrop-blur-md px-2 py-0.5 border border-gold/20 rounded-sm">
                      <span className="text-[9px] uppercase font-bold text-gold tracking-widest">{prop.type}</span>
                    </div>

                    {/* Heart Toggle */}
                    <div className="absolute top-3 right-3 z-10">
                      <WishlistToggle
                        propertyId={prop._id.toString()}
                        initialIsWishlisted={isSaved}
                      />
                    </div>
                  </div>

                  <CardHeader className="p-4 flex flex-col gap-1 text-left">
                    <Link href={`/stays/${prop.slug}`}>
                      <CardTitle className="text-base font-bold text-emerald-rich dark:text-luxury-cream hover:text-gold transition-colors truncate block">
                        {prop.title}
                      </CardTitle>
                    </Link>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <MapPin className="h-3 w-3 text-gold-dark shrink-0" />
                      {prop.city}, {prop.country}
                    </p>
                  </CardHeader>

                  <CardContent className="px-4 py-0 flex-grow text-left">
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground font-light">
                      {prop.description}
                    </p>
                    
                    {/* Details specs */}
                    <div className="grid grid-cols-3 gap-2 border-t border-emerald-rich/5 mt-3 pt-2 text-[10px] font-medium text-emerald-rich/80 dark:text-luxury-cream/80">
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="h-4 w-4 text-gold-dark shrink-0" />
                        <span>{prop.bedrooms} Bed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4 text-gold-dark shrink-0" />
                        <span>{prop.bathrooms} Bath</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gold-dark shrink-0" />
                        <span>{prop.maxGuests} Guests</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-3 justify-between items-center border-t border-emerald-rich/5 mt-2 bg-emerald-rich/[0.01]">
                    <div className="bg-emerald-rich dark:bg-gold/10 px-3 py-1 rounded-sm border border-gold/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-gold font-display leading-none">
                        {formatCurrency(prop.pricePerNight)}
                      </span>
                      <span className="text-[8px] font-bold text-luxury-cream/80 dark:text-gold/80 uppercase tracking-widest mt-0.5 leading-none">/ night</span>
                    </div>
                    {prop.rating > 0 && (
                      <span className="bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-sm flex items-center gap-1 text-[9px] font-bold">
                        <Star className="h-3 w-3 fill-gold text-gold" /> {prop.rating}
                      </span>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Curated Destinations Section */}
      {destinationsList.length > 0 && (
        <section className="py-20 bg-emerald-rich/5 border-b border-gold/10 text-left">
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-10">
            <div className="flex items-end justify-between border-b border-gold/10 pb-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-display text-3xl font-light text-emerald-rich dark:text-luxury-cream">
                  Curated <span className="font-semibold text-gold">Destinations</span>
                </h2>
              </div>
              <Link href="/destinations" className="text-xs font-bold text-gold hover:text-gold-light flex items-center gap-1 hover:underline tracking-wide uppercase">
                View all destinations <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {destinationsList.map((dest) => (
                <div key={dest.name} className="group relative h-96 rounded-sm overflow-hidden border border-gold/10 shadow-sm flex flex-col justify-end p-6">
                  {/* Background image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
                  
                  {/* Stays Count Badge */}
                  <div className="absolute top-4 left-4 z-10 bg-emerald-deep/80 backdrop-blur-md px-3 py-1 border border-gold/20 rounded-sm">
                    <span className="text-[9px] font-bold text-gold tracking-widest uppercase">
                      {dest.propertiesCount} {dest.propertiesCount === 1 ? "Stay" : "Stays"}
                    </span>
                  </div>

                  <div className="relative z-10 flex flex-col gap-2">
                    <h3 className="font-display text-2xl font-semibold text-white group-hover:text-gold transition-colors">{dest.name}</h3>
                    <p className="text-xs text-white/70 line-clamp-2 font-light leading-relaxed">{dest.description}</p>
                    
                    {/* Popular Spots horizontal thumbnails row / list */}
                    {dest.popularSpots && dest.popularSpots.length > 0 && (
                      <div className="flex flex-col gap-1 mt-1 text-left">
                        <span className="text-[9px] font-bold text-gold uppercase tracking-wider">
                          Highlights:
                        </span>
                        <div className="flex flex-wrap gap-1.5 pb-1">
                          {dest.popularSpots.map((spot: any, idx: number) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-md px-2 py-0.5 border border-white/10 rounded-sm text-[9px] text-white shrink-0" title={spot.activities.join(', ')}>
                              {spot.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href={`/stays?destination=${encodeURIComponent(dest.name)}`} className="mt-2 self-start">
                      <Button variant="outline" size="sm" className="border-gold/30 hover:border-gold text-gold hover:bg-gold/10 text-[10px] uppercase font-bold py-1 px-3 h-8">
                        Explore Stays
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bespoke Tour Packages Section */}
      {packagesList.length > 0 && (
        <section className="py-20 border-b border-gold/10 text-left">
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-10">
            <div className="flex items-end justify-between border-b border-gold/10 pb-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-display text-3xl font-light text-emerald-rich dark:text-luxury-cream">
                  Bespoke <span className="font-semibold text-gold">Excursions & Packages</span>
                </h2>
              </div>
              <Link href="/experiences" className="text-xs font-bold text-gold hover:text-gold-light flex items-center gap-1 hover:underline tracking-wide uppercase">
                View all excursions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {packagesList.map((pack) => (
                <Card key={pack.title} className="group border border-gold/10 relative overflow-hidden bg-white dark:bg-emerald-deep/40 shadow-sm rounded-sm h-[30rem] flex flex-col justify-between">
                  {/* Photo container */}
                  <div className="relative h-56 overflow-hidden bg-luxury-sand shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pack.image}
                      alt={pack.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader className="p-4 flex flex-col gap-1 text-left flex-grow">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-base font-bold text-emerald-rich dark:text-luxury-cream hover:text-gold transition-colors line-clamp-1 block">
                        {pack.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground font-semibold mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-gold-dark shrink-0" /> {pack.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-gold-dark shrink-0" /> {pack.duration}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-2 font-light">
                      {pack.description}
                    </p>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 justify-between items-center border-t border-emerald-rich/5 mt-2 bg-emerald-rich/[0.01] shrink-0">
                    <span className="text-sm font-bold text-emerald-rich dark:text-gold font-display">
                      {formatCurrency(pack.price)}
                    </span>
                    <Link href="/experiences">
                      <Button variant="luxury" size="sm" className="h-8 py-0 px-4 text-xs font-bold">Inquire Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
    );
  } catch (error: any) {
    console.error("❌ Error loading home page database content:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-luxury-cream dark:bg-emerald-deep px-6 text-center font-sans">
        <div className="max-w-md border border-gold/15 p-8 sm:p-10 rounded-sm bg-white dark:bg-emerald-deep/40 shadow-xl flex flex-col items-center gap-6 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-gold/5 blur-xl" />
          <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-gold/5 blur-xl" />
          <div className="h-16 w-16 rounded-full border border-gold/25 flex items-center justify-center text-gold bg-emerald-rich/5 shrink-0 animate-pulse">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">
              Database Connection Alert
            </span>
            <h1 className="font-display text-3xl font-bold text-emerald-rich dark:text-gold leading-tight">
              Unable to reach the server database
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1 font-light">
              We encountered an issue connecting to the database server. This usually happens if your IP address is not whitelisted on MongoDB Atlas, or if the cluster is currently unreachable.
            </p>
          </div>
          <div className="w-full bg-red-500/5 border border-red-500/10 p-3 rounded-sm text-left max-h-28 overflow-y-auto">
            <span className="text-[9px] font-mono text-red-500/80 font-bold uppercase tracking-wider block">
              Error Details
            </span>
            <p className="text-[10px] font-mono text-red-600 dark:text-red-400 mt-0.5 break-all">
              {error.message || error.toString()}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
