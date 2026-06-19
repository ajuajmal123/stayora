import React from "react";
import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import Property from "@/models/Property";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let userId: string | null = null;

  if (accessToken) {
    const decoded = verifyAccessToken(accessToken);
    if (decoded) {
      userId = decoded.id;
    }
  }

  if (!userId && refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded) {
      const userObj = await User.findOne({ _id: decoded.id, refreshTokens: refreshToken });
      if (userObj) {
        userId = userObj._id.toString();
      }
    }
  }

  if (!userId) {
    redirect("/login");
  }

  // Fetch user, populate wishlist
  const user = await User.findById(userId).populate({
    path: "wishlist",
    model: Property,
    select: "_id title slug images city country pricePerNight",
  });

  if (!user || user.isBlocked) {
    redirect("/login");
  }

  // Fetch bookings, populate property reference
  const bookings = await Booking.find({ user: userId })
    .populate({
      path: "property",
      model: Property,
      select: "_id title images city country pricePerNight",
    })
    .sort({ createdAt: -1 });

  // Fetch reviews, populate property reference
  const reviews = await Review.find({ user: userId })
    .populate({
      path: "property",
      model: Property,
      select: "title slug",
    })
    .sort({ createdAt: -1 });

  // Map user
  const initialUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber || "",
    avatar: user.avatar || "",
    role: user.role,
  };

  const formattedBookings = bookings.map((b) => ({
    _id: b._id.toString(),
    property: {
      _id: b.property ? b.property._id.toString() : "",
      title: b.property ? b.property.title : "Property Removed",
      images: b.property ? (b.property.images || []) : [],
      city: b.property ? b.property.city : "",
      country: b.property ? b.property.country : "",
      pricePerNight: b.property ? b.property.pricePerNight : 0,
    },
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
    totalPrice: b.totalPrice,
    guests: b.guests,
    status: b.status,
    paymentStatus: b.paymentStatus,
    upiTransactionId: b.upiTransactionId || "",
    upiReceiptScreenshot: b.upiReceiptScreenshot || "",
  }));

  const formattedWishlist = (user.wishlist || [])
    .filter((w: any) => w !== null)
    .map((w: any) => ({
      _id: w._id.toString(),
      title: w.title,
      slug: w.slug,
      images: w.images || [],
      city: w.city,
      country: w.country,
      pricePerNight: w.pricePerNight,
    }));

  const formattedReviews = reviews
    .filter((r) => r.property !== null)
    .map((r) => ({
      _id: r._id.toString(),
      property: {
        title: r.property.title,
        slug: r.property.slug,
      },
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }));

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream dark:bg-emerald-deep text-luxury-black dark:text-luxury-cream transition-colors duration-500">
      <Navbar />
      <main className="flex-grow py-24 max-w-7xl mx-auto px-6 w-full">
        <DashboardClient
          initialUser={initialUser}
          bookings={formattedBookings}
          wishlist={formattedWishlist}
          reviews={formattedReviews}
        />
      </main>
      <Footer />
    </div>
  );
}
