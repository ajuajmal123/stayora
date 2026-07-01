import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User";
import Destination from "@/models/Destination";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StaysFilter from "@/components/stays/StaysFilter";
import WishlistToggle from "@/components/stays/WishlistToggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { MapPin, Star, BedDouble, Bath, Users, Heart } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

interface StaysPageProps {
  searchParams: Promise<{
    destination?: string;
    minPrice?: string;
    maxPrice?: string;
    guests?: string;
    rating?: string;
    amenities?: string;
    sort?: string;
    page?: string;
  }>;
}

// Extract list of unique destinations and amenities from properties to feed filters
async function getFilterFacets() {
  await connectToDatabase();
  const destinations = await Destination.find().distinct("name");
  
  // Fallback to distinct cities if no destinations collection exists
  const propertyCities = await Property.distinct("city");
  const uniqueDestinations = Array.from(new Set([...destinations, ...propertyCities])).sort();

  const allAmenities = await Property.distinct("amenities");
  const uniqueAmenities = allAmenities.sort();

  return { uniqueDestinations, uniqueAmenities };
}

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

export default async function StaysPage({ searchParams }: StaysPageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;

  const destination = params.destination || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : null;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : null;
  const guests = params.guests ? parseInt(params.guests) : null;
  const minRating = params.rating ? parseFloat(params.rating) : null;
  const selectedAmenities = params.amenities ? params.amenities.split(",").filter(Boolean) : [];
  const sortBy = params.sort || "recommended";
  const currentPage = params.page ? parseInt(params.page) : 1;
  const limit = 8;
  const skip = (currentPage - 1) * limit;

  await connectToDatabase();

  // Build MongoDB query
  const query: Record<string, any> = { status: "published" };

  if (destination) {
    const matchedDest = await Destination.findOne({ name: { $regex: destination, $options: "i" } });
    
    query.$or = [
      { city: { $regex: destination, $options: "i" } },
      { country: { $regex: destination, $options: "i" } },
      { address: { $regex: destination, $options: "i" } },
    ];

    if (matchedDest) {
      query.$or.push({ destination: matchedDest._id });
    }
  }

  if (minPrice !== null || maxPrice !== null) {
    query.pricePerNight = {};
    if (minPrice !== null) query.pricePerNight.$gte = minPrice;
    if (maxPrice !== null) query.pricePerNight.$lte = maxPrice;
  }

  if (guests !== null) {
    query.maxGuests = { $gte: guests };
  }

  if (minRating !== null) {
    query.rating = { $gte: minRating };
  }

  if (selectedAmenities.length > 0) {
    query.amenities = { $all: selectedAmenities };
  }

  // Sorting
  let sortObj: Record<string, any> = {};
  if (sortBy === "price_asc") {
    sortObj = { pricePerNight: 1 };
  } else if (sortBy === "price_desc") {
    sortObj = { pricePerNight: -1 };
  } else if (sortBy === "rating_desc") {
    sortObj = { rating: -1 };
  } else {
    // recommended
    sortObj = { rating: -1, pricePerNight: -1 };
  }

  // Execute query
  const properties = await Property.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const totalProperties = await Property.countDocuments(query);
  const totalPages = Math.ceil(totalProperties / limit);

  // Get facets and wishlist
  const { uniqueDestinations, uniqueAmenities } = await getFilterFacets();
  const wishlistedIds = await getWishlistSet();

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream dark:bg-emerald-deep font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-emerald-rich text-luxury-cream pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1486082521694-51d912a3d200?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col gap-3 items-center text-center justify-center">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Stayora Portfolio</span>
          <h1 className="font-display text-4xl sm:text-5xl font-light tracking-wide">
            Luxury <span className="font-semibold text-gold">Stays & Villas</span>
          </h1>
          <p className="text-xs sm:text-sm text-luxury-cream/70 max-w-xl mx-auto">
            Explore curated boutique listings spanning sun-drenched coastlines, historic sanctuaries, and high-alpine ski chalets.
          </p>
        </div>
      </section>

      {/* Workspace Grid */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full flex flex-col gap-8">
        
        {/* Top Dropdowns Filter Bar */}
        <div className="w-full">
          <StaysFilter
            destinations={uniqueDestinations}
            availableAmenities={uniqueAmenities}
          />
        </div>

        {/* Listings Display */}
        <main className="flex flex-col gap-8">
          
          {/* Header count and active sorting details */}
          <div className="flex items-center justify-between pb-4 border-b border-emerald-rich/5">
            <span className="text-xs uppercase tracking-wider text-emerald-rich/70 dark:text-luxury-cream/70 font-semibold">
              Showing {properties.length} of {totalProperties} Premium Listings
            </span>
          </div>

          {/* Cards Grid */}
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((prop) => {
                const isSaved = wishlistedIds.has(prop._id.toString());
                return (
                  <Card key={prop.slug} className="relative group h-[30rem] flex flex-col justify-between border border-gold/10 bg-white dark:bg-emerald-deep/40 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-500 hover:-translate-y-1">
                    
                    {/* Image gallery container */}
                    <div className="relative h-56 overflow-hidden bg-luxury-sand shrink-0">
                      <Link href={`/stays/${prop.slug}`} className="block h-full w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prop.images[0] || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"}
                          alt={prop.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </Link>
                      
                      {/* Floating Category tag */}
                      <div className="absolute top-4 left-4 bg-emerald-deep/80 backdrop-blur-md px-3 py-1 border border-gold/20 rounded-sm">
                        <span className="text-[9px] uppercase font-bold text-gold tracking-widest">{prop.type}</span>
                      </div>

                      {/* Floating Price tag */}
                      <div className="absolute bottom-4 left-4 bg-emerald-deep/90 backdrop-blur-md px-2.5 py-1 border border-gold/25 rounded-sm flex items-baseline gap-1 shadow-md">
                        <span className="text-xs font-semibold text-gold font-display">
                          {formatCurrency(prop.pricePerNight)}
                        </span>
                        <span className="text-[8px] font-medium text-luxury-cream/80 uppercase tracking-widest">/ night</span>
                      </div>

                      {/* Floating Rating tag */}
                      {prop.rating > 0 && (
                        <div className="absolute top-4 right-4 bg-white/95 dark:bg-emerald-deep/90 backdrop-blur-sm px-2 py-1 rounded-sm flex items-center gap-1 text-[10px] font-semibold text-emerald-rich dark:text-gold">
                          <Star className="h-3 w-3 fill-gold text-gold" /> {prop.rating}
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

                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <Link href={`/stays/${prop.slug}`} className="truncate block flex-grow">
                          <CardTitle className="text-base font-bold text-emerald-rich dark:text-luxury-cream hover:text-gold transition-colors truncate">{prop.title}</CardTitle>
                        </Link>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/80 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-gold-dark shrink-0" />
                        <span>{prop.city}, {prop.country}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 py-0 flex-grow">
                      <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                        {prop.description}
                      </CardDescription>
                      
                      {/* Details specs */}
                      <div className="grid grid-cols-3 gap-2 border-t border-emerald-rich/5 mt-3 pt-2 text-[11px] font-medium text-emerald-rich/80 dark:text-luxury-cream/80">
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
                          <span>{prop.maxGuests} Max</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="justify-between items-center bg-emerald-rich/[0.01] dark:bg-emerald-light/[0.005] border-t border-emerald-rich/5 px-4 py-3 mt-0 shrink-0">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Luxury Standard</span>
                      <Link href={`/stays/${prop.slug}`}>
                        <Button variant="luxury" size="sm" className="h-8 text-[10px] py-0 tracking-wider font-bold uppercase px-4">
                          Explore Estate
                        </Button>
                      </Link>
                    </CardFooter>

                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-gold/20 rounded-sm bg-white dark:bg-emerald-deep">
              <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold mb-2">No Properties Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                We couldn&apos;t find any properties matching your current filter criteria. Try resetting filters or choosing another destination.
              </p>
              <Link href="/stays">
                <Button variant="primary">Reset Filters</Button>
              </Link>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 border-t border-emerald-rich/5 pt-8">
              <Link
                href={currentPage > 1 ? `/stays?${new URLSearchParams({ ...params, page: (currentPage - 1).toString() }).toString()}` : "#"}
                className={cn(
                  "px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-sm transition-colors",
                  currentPage === 1
                    ? "pointer-events-none opacity-40 border-muted-foreground/10 text-muted-foreground"
                    : "border-gold/30 hover:bg-gold/5 text-emerald-rich dark:text-gold"
                )}
              >
                Previous
              </Link>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-rich/60 dark:text-luxury-cream/60">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={currentPage < totalPages ? `/stays?${new URLSearchParams({ ...params, page: (currentPage + 1).toString() }).toString()}` : "#"}
                className={cn(
                  "px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-sm transition-colors",
                  currentPage === totalPages
                    ? "pointer-events-none opacity-40 border-muted-foreground/10 text-muted-foreground"
                    : "border-gold/30 hover:bg-gold/5 text-emerald-rich dark:text-gold"
                )}
              >
                Next
              </Link>
            </div>
          )}

        </main>
      </section>

      <Footer />
    </div>
  );
}
