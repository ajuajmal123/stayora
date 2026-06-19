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
  await connectToDatabase();

  // Fetch list of unique destinations for the search dropdown
  const destinations = await Destination.find().distinct("name");
  const propertyCities = await Property.distinct("city");
  const uniqueDestinations = Array.from(new Set([...destinations, ...propertyCities])).sort();

  // Fetch saved wishlist property IDs
  const wishlistedIds = await getWishlistSet();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF7] dark:bg-emerald-deep text-luxury-black dark:text-luxury-cream transition-colors duration-500 font-sans">
      <Navbar />

      {/* Hero Header & Search Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-32 pb-24">
        {/* Background image matching luxury design look */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-emerald-deep/45 backdrop-blur-[0.5px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center flex flex-col gap-6 items-center">
          
          <div className="flex items-center gap-3 text-gold uppercase tracking-[0.25em] text-xs sm:text-sm font-bold">
            <span className="h-[1px] w-8 bg-gold opacity-50" />
            Find your perfect stay
            <span className="h-[1px] w-8 bg-gold opacity-50" />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light text-white leading-[1.1] max-w-4xl tracking-wide">
            Stays that <span className="font-semibold text-gold">feel like home</span>
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-2xl font-light leading-relaxed">
            Handpicked stays in beautiful places, crafted for unforgettable experiences.
          </p>

          <Link href="/stays" className="mt-2">
            <Button
              variant="outline"
              className="border-gold text-gold hover:bg-gold/10 text-xs px-6 py-2.5 rounded-full uppercase tracking-wider font-semibold flex items-center gap-2"
            >
              Explore Stays <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          {/* Overlapping floating Search Bar Section */}
          <div className="w-full mt-10 max-w-5xl shadow-2xl relative z-20">
            <div className="bg-white dark:bg-emerald-deep rounded-sm p-4 sm:p-5 border border-gold/10 flex flex-col md:flex-row items-stretch justify-between gap-4 text-left">
              
              {/* Where input */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-gold/15">
                <div className="h-9 w-9 rounded-full bg-emerald-rich/5 flex items-center justify-center text-gold shrink-0">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gold tracking-wider">Where to?</span>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    className="text-sm font-semibold text-emerald-rich dark:text-luxury-cream placeholder:text-muted-foreground/60 bg-transparent border-none outline-none focus:ring-0 mt-0.5 w-full"
                  />
                </div>
              </div>

              {/* Dates picker mock */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-gold/15">
                <div className="h-9 w-9 rounded-full bg-emerald-rich/5 flex items-center justify-center text-gold shrink-0">
                  <CalendarIcon className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gold tracking-wider">Check In - Check Out</span>
                  <input
                    type="text"
                    placeholder="Add dates"
                    readOnly
                    className="text-sm font-semibold text-emerald-rich dark:text-luxury-cream placeholder:text-muted-foreground/60 bg-transparent border-none outline-none focus:ring-0 mt-0.5 w-full cursor-pointer"
                  />
                </div>
              </div>

              {/* Guests selection mock */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2">
                <div className="h-9 w-9 rounded-full bg-emerald-rich/5 flex items-center justify-center text-gold shrink-0">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gold tracking-wider">Guests</span>
                  <span className="text-sm font-semibold text-emerald-rich dark:text-luxury-cream mt-0.5">2 Guests</span>
                </div>
              </div>

              {/* Search button */}
              <Link href="/stays" className="self-center shrink-0">
                <Button
                  variant="primary"
                  className="bg-emerald-deep hover:bg-emerald-rich text-gold font-semibold text-xs uppercase tracking-wider py-3 px-6 h-12 flex items-center gap-2 rounded-sm border border-gold/25"
                >
                  Search Stays <Search className="h-4 w-4" />
                </Button>
              </Link>

            </div>
          </div>

        </div>
      </section>

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
              <Card key={prop.slug} className="group border border-gold/10 relative overflow-hidden bg-white dark:bg-emerald-deep/40 shadow-sm rounded-sm">
                {/* Photo container */}
                <div className="relative h-48 overflow-hidden bg-luxury-sand">
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

      {/* Brand Newsletter banner bar matching the screenshot exactly */}
      <section className="py-12 bg-emerald-deep border-y border-gold/15 w-full text-luxury-cream">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
          
          <div className="flex items-center gap-4 flex-1">
            {/* Gold emblem matching navbar */}
            <div className="h-12 w-12 rounded-full border border-gold/45 flex items-center justify-center bg-gold/5 shrink-0">
              <span className="font-display text-gold text-xl font-bold italic tracking-tighter">S</span>
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
}
