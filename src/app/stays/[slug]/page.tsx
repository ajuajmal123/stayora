import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User";
import Review from "@/models/Review";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DetailInteractive from "@/components/stays/DetailInteractive";
import WishlistToggle from "@/components/stays/WishlistToggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { MapPin, Star, BedDouble, Bath, Users, Key, Coffee, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

interface PropertyDetailsPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO Metadata
export async function generateMetadata({
  params,
}: PropertyDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const property = await Property.findOne({ slug });

  if (!property) {
    return {
      title: "Property Not Found | Stayora",
    };
  }

  return {
    title: `${property.title} | Stays in ${property.city} | Stayora`,
    description: property.description.substring(0, 160),
    openGraph: {
      title: `${property.title} | Stayora`,
      description: property.description.substring(0, 160),
      images: [{ url: property.images[0] }],
    },
  };
}

// Fetch user wishlist status
async function checkIsWishlisted(propertyId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return false;

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) return false;

  await connectToDatabase();
  const user = await User.findById(decoded.id).select("wishlist");
  if (!user || !user.wishlist) return false;

  return user.wishlist.some((id: any) => id.toString() === propertyId);
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { slug } = await params;
  await connectToDatabase();

  // 1. Fetch property
  const property = await Property.findOne({ slug })
    .populate("agent", "name avatar email phoneNumber")
    .populate("destination");
  if (!property) {
    notFound();
  }

  // 2. Fetch reviews
  const reviewDocs = await Review.find({ property: property._id })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });

  // Map reviews to plain objects for client component
  const reviews = reviewDocs.map((doc) => ({
    _id: doc._id.toString(),
    rating: doc.rating,
    comment: doc.comment,
    createdAt: doc.createdAt.toISOString(),
    user: {
      name: doc.user.name,
      avatar: doc.user.avatar,
    },
  }));

  // 3. Fetch related properties (same city, or same country)
  let relatedProperties = await Property.find({
    _id: { $ne: property._id },
    city: property.city,
    status: "published",
  }).limit(3);

  if (relatedProperties.length < 3) {
    const additional = await Property.find({
      _id: { $ne: property._id },
      city: { $ne: property.city },
      status: "published",
    }).limit(3 - relatedProperties.length);
    relatedProperties = [...relatedProperties, ...additional];
  }

  // Check if saved
  const isSaved = await checkIsWishlisted(property._id.toString());

  // JSON-LD Structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": property.title,
    "image": property.images,
    "description": property.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.city,
      "addressCountry": property.country,
      "streetAddress": property.address,
    },
    "aggregateRating": property.rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": property.rating,
      "reviewCount": property.reviewsCount,
    } : undefined,
    "priceRange": `₹₹₹₹ (INR ${property.pricePerNight} per night)`,
  };

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream dark:bg-emerald-deep font-sans">
      <Navbar />

      {/* Structured SEO Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Details Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-32 pb-24 w-full flex flex-col gap-10">
        
        {/* Navigation Breadcrumbs & Top Meta */}
        <div className="flex flex-col gap-3 text-left">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link href="/stays" className="hover:text-gold transition-colors">Stays</Link>
            <span>/</span>
            <span className="text-emerald-rich dark:text-gold font-bold">{property.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-light text-emerald-rich dark:text-luxury-cream leading-tight">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground/90 mt-2 font-medium">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gold-dark" />
                  <span>{property.address}, {property.city}, {property.country}</span>
                </div>
                {property.rating > 0 && (
                  <div className="flex items-center gap-1 border-l border-emerald-rich/10 pl-4">
                    <Star className="h-4 w-4 fill-gold text-gold" />
                    <span className="font-bold text-emerald-rich dark:text-gold">{property.rating}</span>
                    <span>({property.reviewsCount} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Image Gallery, Booking and Reviews */}
        <DetailInteractive
          propertyId={property._id.toString()}
          images={property.images}
          pricePerNight={property.pricePerNight}
          maxGuests={property.maxGuests}
          initialReviews={reviews}
          isWishlisted={isSaved}
          unavailableDates={property.unavailableDates || []}
        />

        {/* Static Description & Specifications */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-emerald-rich/5 pt-10">
          <div className="lg:col-span-2 flex flex-col gap-8 text-left">
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold">
                The Stay Experience
              </h3>
              <p className="text-sm leading-relaxed text-emerald-rich/80 dark:text-luxury-cream/80 font-light whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Specifications Details */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs uppercase tracking-widest text-gold font-bold">Amenities Included</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((amenity: string) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-3.5 border border-gold/10 bg-emerald-rich/[0.02] rounded-sm text-xs font-semibold text-emerald-rich dark:text-luxury-cream"
                  >
                    <Sparkles className="h-4 w-4 text-gold" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Host Agent specifications */}
          <div className="lg:col-span-1 text-left flex flex-col gap-6 p-6 border border-gold/10 bg-emerald-rich/[0.01] rounded-sm">
            <h3 className="font-display text-xl font-bold text-emerald-rich dark:text-gold border-b border-emerald-rich/5 pb-2">
              Your Personal Host
            </h3>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-accent flex items-center justify-center font-bold text-gold border border-gold/20 overflow-hidden">
                {property.agent.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={property.agent.avatar} alt={property.agent.name} className="h-full w-full object-cover" />
                ) : (
                  property.agent.name[0]
                )}
              </div>
              <div className="text-left leading-snug">
                <p className="text-sm uppercase tracking-wider font-bold text-emerald-rich dark:text-gold">
                  {property.agent.name}
                </p>
                <span className="text-[10px] text-muted-foreground">Certified Stayora Agent</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Available 24/7 during your stay. Marcus coordinates logistics, bookings for local Michelin chefs, private yachts, and local tour operators.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs font-medium text-emerald-rich/70 dark:text-luxury-cream/70">
              <div className="flex items-center gap-2">
                <span>Email:</span>
                <span className="text-emerald-rich dark:text-luxury-cream font-bold">{property.agent.email}</span>
              </div>
              {property.agent.phoneNumber && (
                <div className="flex items-center gap-2">
                  <span>Phone:</span>
                  <span className="text-emerald-rich dark:text-luxury-cream font-bold">{property.agent.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related properties */}
        <section className="border-t border-emerald-rich/5 pt-12 flex flex-col gap-8 text-left">
          <h3 className="font-display text-3xl font-light text-emerald-rich dark:text-luxury-cream">
            Similar <span className="font-semibold text-gold">Stays You May Like</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProperties.map((related) => (
              <Card key={related.slug} className="group h-[30rem] flex flex-col justify-between">
                <div className="relative h-56 overflow-hidden bg-luxury-sand shrink-0">
                  <Link href={`/stays/${related.slug}`} className="block h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={related.images[0]}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  {related.rating > 0 && (
                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-emerald-deep/90 backdrop-blur-sm px-2 py-0.5 rounded-sm flex items-center gap-1 text-[10px] font-semibold text-emerald-rich dark:text-gold">
                      <Star className="h-3 w-3 fill-gold text-gold" /> {related.rating}
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 flex flex-col gap-1 text-left flex-grow">
                  <Link href={`/stays/${related.slug}`}>
                    <CardTitle className="text-base font-bold text-emerald-rich dark:text-luxury-cream hover:text-gold transition-colors truncate block">{related.title}</CardTitle>
                  </Link>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <MapPin className="h-3 w-3 text-gold-dark shrink-0" /> {related.city}, {related.country}
                  </p>
                </CardHeader>
                <CardFooter className="p-4 pt-0 justify-between items-center border-t border-emerald-rich/5 mt-2 bg-emerald-rich/[0.01] shrink-0">
                  <span className="text-sm font-bold text-emerald-rich dark:text-gold font-display">
                    {formatCurrency(related.pricePerNight)} <span className="text-[9px] font-normal text-muted-foreground uppercase font-sans">/ night</span>
                  </span>
                  <Link href={`/stays/${related.slug}`}>
                    <Button variant="outline" size="sm" className="h-8 py-0 px-4 text-xs font-bold">Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
