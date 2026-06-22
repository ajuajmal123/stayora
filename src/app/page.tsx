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
  Heart
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

// 4 Dummy properties matching user's design image exactly
const dummyStays = [
  {
    _id: "dummy1",
    title: "The Forest Hideaway",
    slug: "the-forest-hideaway",
    type: "cabin",
    rating: 4.8,
    pricePerNight: 6500,
    city: "Manali",
    country: "Himachal Pradesh",
    description: "Nestled in dense pine woods, offering rustic luxury and panoramic valley views.",
    images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
  },
  {
    _id: "dummy2",
    title: "Oceanview Villa",
    slug: "oceanview-villa",
    type: "villa",
    rating: 4.9,
    pricePerNight: 9200,
    city: "Goa",
    country: "India",
    description: "Seaside architectural masterpiece with private beach access and sunset infinity pool.",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
  },
  {
    _id: "dummy3",
    title: "The Alpine Retreat",
    slug: "the-alpine-retreat",
    type: "resort",
    rating: 4.7,
    pricePerNight: 7800,
    city: "Auli",
    country: "Uttarakhand",
    description: "Luxury ski-in, ski-out resort facing the majestic snow-capped peaks of Nanda Devi.",
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"],
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
  },
  {
    _id: "dummy4",
    title: "Desert Serenity",
    slug: "desert-serenity",
    type: "mansion",
    rating: 4.6,
    pricePerNight: 5100,
    city: "Jaisalmer",
    country: "Rajasthan",
    description: "A heritage golden-sandstone palace offering royal dunes glamping and stargazing courtyard.",
    images: ["https://images.unsplash.com/photo-1585983224974-084a8e065e76?auto=format&fit=crop&w=800&q=80"],
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
  },
];

export default async function HomePage() {
  try {
    await connectToDatabase();

    // Fetch list of unique destinations for the search dropdown
    const destinations = await Destination.find().distinct("name");
    const propertyCities = await Property.distinct("city");
    const uniqueDestinations = Array.from(new Set([...destinations, ...propertyCities])).sort();

    // Fetch saved wishlist property IDs
    const wishlistedIds = await getWishlistSet();

    // Fetch featured destinations
    const dbFeaturedDestinations = await Destination.find({ isFeatured: true }).limit(3);
    const destinationsList = dbFeaturedDestinations.length > 0
      ? dbFeaturedDestinations.map(d => ({ name: d.name, description: d.description, image: d.image }))
      : [
          {
            name: "Amalfi Coast",
            description: "Stunning cliffside villages, pastel buildings, and turquoise seas on Italy's southern coastline.",
            image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Swiss Alps",
            description: "Snow-capped peaks, alpine lakes, and world-class luxury ski resorts in Switzerland.",
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Kyoto",
            description: "Historic temples, bamboo forests, and luxury ryokans reflecting ancient Japanese heritage.",
            image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
          }
        ];

    // Fetch featured packages
    const dbFeaturedPackages = await TourPackage.find({ isFeatured: true }).limit(2);
    const packagesList = dbFeaturedPackages.length > 0
      ? dbFeaturedPackages.map(p => ({ title: p.title, description: p.description, duration: p.duration, price: p.price, location: p.location, image: p.image }))
      : [
          {
            title: "Mediterranean Yacht Charter",
            description: "Cruise the French Riviera or Amalfi Coast aboard a private luxury yacht. Day includes chef seafood lunch, champagne bar, and water sports.",
            duration: "Full Day (8 Hours)",
            price: 360000,
            location: "St. Tropez / Positano",
            image: "https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=800&q=80",
          },
          {
            title: "Alpine Helicopter Transfer",
            description: "Skip the roads and glide over the Swiss Alps with a scenic helicopter flight to Zermatt, featuring Matterhorn views and direct landing.",
            duration: "Flight (45 Minutes)",
            price: 150000,
            location: "Zermatt, Switzerland",
            image: "https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=800&q=80",
          }
        ];

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

        {/* Hardcoded 4 Dummy properties cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyStays.map((prop) => {
            const isSaved = wishlistedIds.has(prop._id);
            return (
              <Card key={prop.slug} className="group border border-gold/10 relative overflow-hidden bg-white dark:bg-emerald-deep/40 shadow-sm rounded-sm h-[30rem] flex flex-col justify-between">
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

                  {/* Heart Toggle */}
                  <div className="absolute top-3 right-3 z-10">
                    <WishlistToggle
                      propertyId={prop._id}
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

                <CardFooter className="p-4 pt-0 justify-between items-center border-t border-emerald-rich/5 mt-2 bg-emerald-rich/[0.01]">
                  <span className="text-sm font-bold text-emerald-rich dark:text-gold font-display">
                    ₹{prop.pricePerNight.toLocaleString("en-IN")}{" "}
                    <span className="text-[9px] font-normal text-muted-foreground uppercase font-sans">/ night</span>
                  </span>
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

      {/* Curated Destinations Section */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="relative z-10 flex flex-col gap-2">
                  <h3 className="font-display text-2xl font-semibold text-white group-hover:text-gold transition-colors">{dest.name}</h3>
                  <p className="text-xs text-white/70 line-clamp-2 font-light leading-relaxed">{dest.description}</p>
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

      {/* Bespoke Tour Packages Section */}
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
              <Card key={pack.title} className="group flex flex-col sm:flex-row h-auto sm:h-76 overflow-hidden border border-gold/10 bg-white dark:bg-emerald-deep/40 shadow-sm rounded-sm">
                <div className="w-full sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-luxury-sand shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pack.image}
                    alt={pack.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-bold text-emerald-rich dark:text-luxury-cream hover:text-gold transition-colors">{pack.title}</h3>
                      <span className="text-sm font-bold text-gold shrink-0">₹{pack.price.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
                      <span>📍 {pack.location}</span>
                      <span>⏱️ {pack.duration}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-2 font-light">{pack.description}</p>
                  </div>
                  <Link href="/experiences" className="self-end mt-4">
                    <Button variant="luxury" size="sm" className="h-8 py-0 px-4 text-[10px]">Inquire Details</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Newsletter banner bar matching the screenshot exactly */}
      <section className="py-12 bg-emerald-deep border-y border-gold/15 w-full text-luxury-cream">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
          
          <div className="flex items-center gap-4 flex-1">
            {/* Logo matching navbar */}
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/image.png" alt="Stayora Logo" className="h-10 w-auto object-contain" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold">Stay inspired. Stay rewarded.</span>
              <h2 className="text-sm sm:text-base font-light text-white/90 max-w-xl font-sans leading-relaxed">
                Join Stayora and get exclusive deals & travel inspiration.
              </h2>
            </div>
          </div>

          <form className="flex w-full lg:w-auto max-w-md items-center gap-2 border border-gold/25 p-1 rounded-sm bg-emerald-rich/20">
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="px-4 py-2 bg-transparent text-sm text-luxury-cream placeholder:text-muted-foreground outline-none border-none flex-grow min-w-0 focus:ring-0"
            />
            <Button
              type="submit"
              variant="luxury"
              className="bg-gold hover:bg-gold-light text-emerald-deep font-semibold text-xs py-2 px-5 shrink-0 rounded-sm"
            >
              Subscribe
            </Button>
          </form>

        </div>
      </section>

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
