import React from "react";
import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import Destination from "@/models/Destination";
import HeroBanner from "@/models/HeroBanner";
import Newsletter from "@/models/Newsletter";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminClient from "@/components/admin/AdminClient";

export default async function AdminPage() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let userId: string | null = null;
  let role: string | null = null;

  if (accessToken) {
    const decoded = verifyAccessToken(accessToken);
    if (decoded) {
      userId = decoded.id;
      role = decoded.role;
    }
  }

  if (!userId && refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded) {
      const userObj = await User.findOne({ _id: decoded.id, refreshTokens: refreshToken });
      if (userObj) {
        userId = userObj._id.toString();
        role = userObj.role;
      }
    }
  }

  if (!userId || role !== "admin") {
    redirect("/login");
  }

  const adminUser = await User.findById(userId);
  if (!adminUser || adminUser.isBlocked) {
    redirect("/login");
  }

  // Retrieve administration lists
  const properties = await Property.find().sort({ createdAt: -1 });
  const bookings = await Booking.find()
    .populate({
      path: "property",
      model: Property,
      select: "_id title city images pricePerNight",
    })
    .populate({
      path: "user",
      model: User,
      select: "_id name email phoneNumber",
    })
    .sort({ createdAt: -1 });

  const users = await User.find().select("-password -refreshTokens").sort({ createdAt: -1 });
  const destinations = await Destination.find().sort({ name: 1 });
  const banners = await HeroBanner.find().sort({ order: 1, createdAt: -1 });
  const subscribers = await Newsletter.find().sort({ createdAt: -1 });

  // Deep clone to plain objects to ensure safe client passing
  const serializedProperties = JSON.parse(JSON.stringify(properties));
  const serializedBookings = JSON.parse(JSON.stringify(bookings));
  const serializedUsers = JSON.parse(JSON.stringify(users));
  const serializedDestinations = JSON.parse(JSON.stringify(destinations));
  const serializedBanners = JSON.parse(JSON.stringify(banners));
  const serializedSubscribers = JSON.parse(JSON.stringify(subscribers));

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream dark:bg-emerald-deep text-luxury-black dark:text-luxury-cream transition-colors duration-500">
      <Navbar />
      <main className="flex-grow py-24 max-w-7xl mx-auto px-6 w-full">
        <AdminClient
          initialProperties={serializedProperties}
          initialBookings={serializedBookings}
          initialUsers={serializedUsers}
          initialDestinations={serializedDestinations}
          initialBanners={serializedBanners}
          initialSubscribers={serializedSubscribers}
        />
      </main>
      <Footer />
    </div>
  );
}
