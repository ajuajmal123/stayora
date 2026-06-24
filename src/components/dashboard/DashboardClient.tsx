"use client";

import React, { useState } from "react";
import { User, Calendar, Heart, MessageSquare, ShieldAlert, Phone, Mail, Upload, Trash2, Key, CheckCircle, Clock, XCircle, FileImage, Camera, MapPin, Star, Compass } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { Card, CardHeader, CardTitle, CardFooter } from "../ui/Card";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface DashboardClientProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    role: string;
  };
  bookings: Array<{
    _id: string;
    property: {
      _id: string;
      title: string;
      images: string[];
      city: string;
      country: string;
      pricePerNight: number;
    };
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    guests: number;
    status: string;
    paymentStatus: string;
    upiTransactionId?: string;
    upiReceiptScreenshot?: string;
  }>;
  wishlist: Array<{
    _id: string;
    title: string;
    slug: string;
    images: string[];
    city: string;
    country: string;
    pricePerNight: number;
  }>;
  reviews: Array<{
    _id: string;
    property: {
      title: string;
      slug: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({
  initialUser,
  bookings: initialBookings,
  wishlist: initialWishlist,
  reviews,
}) => {
  const { setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "wishlist" | "reviews">("profile");

  // Hydrate client-side store with server-verified traveler credentials on mount
  React.useEffect(() => {
    if (initialUser) {
      setUser({
        id: initialUser.id,
        name: initialUser.name,
        email: initialUser.email,
        role: initialUser.role as "admin" | "agent" | "user",
        avatar: initialUser.avatar,
        phoneNumber: initialUser.phoneNumber,
      });
    }
  }, [initialUser, setUser]);

  // Profile states
  const [profileData, setProfileData] = useState({
    name: initialUser.name,
    email: initialUser.email,
    phoneNumber: initialUser.phoneNumber || "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(initialUser.avatar || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  // Bookings list state
  const [bookings, setBookings] = useState(initialBookings);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  // Wishlist list state
  const [wishlist, setWishlist] = useState(initialWishlist);

  // UPI submit modal state
  const [selectedBookingForUpi, setSelectedBookingForUpi] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [receiptBase64, setReceiptBase64] = useState("");
  const [isSubmittingUpi, setIsSubmittingUpi] = useState(false);
  const [upiError, setUpiError] = useState("");
  const [upiSuccess, setUpiSuccess] = useState("");

  // Handle avatar file read
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileMessage({ type: "error", text: "Avatar image must be smaller than 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setProfileData((prev) => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage({ type: null, text: "" });

    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const body = await response.json();

      if (body.success && body.data) {
        setProfileMessage({ type: "success", text: "Profile details updated successfully!" });
        setUser(body.data); // Update Zustand store
      } else {
        setProfileMessage({ type: "error", text: body.message || "Failed to update profile details" });
      }
    } catch (err) {
      console.error(err);
      setProfileMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Booking Cancellation trigger
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
    setIsCancelling(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const body = await response.json();

      if (body.success) {
        // Update local booking list state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled", paymentStatus: b.paymentStatus === "paid" ? "refunded" : b.paymentStatus } : b
          )
        );
        alert("Booking cancelled successfully.");
      } else {
        alert(body.message || "Failed to cancel booking.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Failed to cancel booking.");
    } finally {
      setIsCancelling(null);
    }
  };

  // Remove from Wishlist
  const handleRemoveWishlist = async (propertyId: string) => {
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      const body = await response.json();

      if (body.success && !body.data.isAdded) {
        setWishlist((prev) => prev.filter((p) => p._id !== propertyId));
      }
    } catch (error) {
      console.error("Failed to sync wishlist", error);
    }
  };

  // Receipt Screenshot upload base64
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setUpiError("Receipt photo must be smaller than 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit UTR and receipt screenshot
  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForUpi || !utrNumber) return;

    setIsSubmittingUpi(true);
    setUpiError("");
    setUpiSuccess("");

    try {
      const response = await fetch("/api/bookings/submit-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingForUpi,
          upiTransactionId: utrNumber,
          upiReceiptScreenshot: receiptBase64,
        }),
      });

      const body = await response.json();

      if (body.success && body.data) {
        setUpiSuccess("Payment receipt uploaded successfully! Awaiting verification.");
        // Update local booking list state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBookingForUpi
              ? { ...b, upiTransactionId: utrNumber, upiReceiptScreenshot: body.data.upiReceiptScreenshot }
              : b
          )
        );
        setTimeout(() => {
          setSelectedBookingForUpi(null);
          setUtrNumber("");
          setReceiptBase64("");
          setUpiSuccess("");
        }, 1500);
      } else {
        setUpiError(body.message || "Failed to submit receipt.");
      }
    } catch (err) {
      console.error(err);
      setUpiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingUpi(false);
    }
  };

  // Render status badges helper
  const renderStatus = (status: string) => {
    const styles = {
      pending: "bg-amber-400/10 text-amber-500 border-amber-500/20",
      confirmed: "bg-emerald-400/10 text-emerald-500 border-emerald-500/20",
      cancelled: "bg-red-400/10 text-red-500 border-red-500/20",
      completed: "bg-blue-400/10 text-blue-500 border-blue-500/20",
    };
    const icons = {
      pending: <Clock className="h-3 w-3 shrink-0" />,
      confirmed: <CheckCircle className="h-3 w-3 shrink-0" />,
      cancelled: <XCircle className="h-3 w-3 shrink-0" />,
      completed: <CheckCircle className="h-3 w-3 shrink-0" />,
    };
    const s = status.toLowerCase() as keyof typeof styles;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border", styles[s])}>
        {icons[s]} {status}
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start text-left font-sans">
      {/* Sidebar menu Navigation */}
      <div className="w-full md:w-64 bg-white dark:bg-emerald-deep border border-gold/15 rounded-sm p-4 flex flex-col gap-1 shrink-0">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider transition-colors text-left",
            activeTab === "profile"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <User className="h-4.5 w-4.5" /> Profile Settings
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider transition-colors text-left",
            activeTab === "bookings"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <Calendar className="h-4.5 w-4.5" /> Booking History
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider transition-colors text-left",
            activeTab === "wishlist"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <Heart className="h-4.5 w-4.5" /> Saved Wishlist
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-semibold uppercase tracking-wider transition-colors text-left",
            activeTab === "reviews"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <MessageSquare className="h-4.5 w-4.5" /> Submitted Reviews
        </button>
      </div>

      {/* Primary Panels Content */}
      <div className="flex-1 w-full bg-white dark:bg-emerald-deep border border-gold/15 p-6 sm:p-8 rounded-sm shadow-sm min-h-[25rem]">
        
        {/* Tab 1: Profile Settings */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6 max-w-xl">
            <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold border-b border-emerald-rich/5 pb-2">
              Profile Settings
            </h3>

            {profileMessage.text && (
              <div
                className={cn(
                  "p-4 rounded-sm text-xs font-semibold border",
                  profileMessage.type === "success"
                    ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-500"
                    : "bg-red-400/10 border-red-400/20 text-red-500"
                )}
              >
                {profileMessage.text}
              </div>
            )}

            {/* Avatar upload */}
            <div className="flex items-center gap-6">
              <div className="relative h-20 w-20 rounded-full border border-gold/30 bg-emerald-accent flex items-center justify-center text-gold font-bold text-lg overflow-hidden group">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt={profileData.name} className="h-full w-full object-cover" />
                ) : (
                  profileData.name.substring(0, 2).toUpperCase()
                )}
                
                {/* Upload overlay */}
                <label className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-luxury-cream text-[9px] uppercase tracking-wide cursor-pointer font-bold">
                  <Camera className="h-4.5 w-4.5 text-gold mb-0.5" /> Change
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider text-gold-dark font-bold">Profile Avatar</span>
                <p className="text-xs text-muted-foreground mt-0.5">Click photo to upload a JPEG/PNG (max 2MB).</p>
              </div>
            </div>

            <Input
              id="p-name"
              label="Distinguished Guest Name"
              type="text"
              name="name"
              value={profileData.name}
              onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <Input
              id="p-email"
              label="Preferred Communication Email"
              type="email"
              name="email"
              value={profileData.email}
              onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />

            <Input
              id="p-phone"
              label="Primary Contact Line"
              type="tel"
              name="phoneNumber"
              value={profileData.phoneNumber}
              placeholder="+91 XXXXX XXXXX"
              onChange={(e) => setProfileData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            />

            <Button variant="primary" type="submit" isLoading={isUpdatingProfile} className="self-start mt-2">
              Save Profile Details
            </Button>
          </form>
        )}

        {/* Tab 2: Booking History */}
        {activeTab === "bookings" && (
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold border-b border-emerald-rich/5 pb-2">
              My Booking Stays
            </h3>

            {bookings.length > 0 ? (
              <div className="flex flex-col gap-6">
                {bookings.map((booking) => {
                  const checkInDate = new Date(booking.checkIn);
                  const isCancellable =
                    ["pending", "confirmed"].includes(booking.status) &&
                    (checkInDate.getTime() - Date.now()) / (1000 * 60 * 60) >= 48;

                  return (
                    <div
                      key={booking._id}
                      className="border border-gold/15 p-5 rounded-sm flex flex-col md:flex-row gap-5 items-stretch shadow-sm"
                    >
                      {/* Photo */}
                      <div className="w-full md:w-40 h-28 shrink-0 rounded-sm overflow-hidden bg-luxury-sand relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={booking.property.images[0]}
                          alt={booking.property.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Specs */}
                      <div className="flex-1 flex flex-col justify-between text-left gap-2">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h4 className="font-display text-lg font-bold text-emerald-rich dark:text-luxury-cream">
                              {booking.property.title}
                            </h4>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-gold-dark" />
                              {booking.property.city}, {booking.property.country}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            {renderStatus(booking.status)}
                          </div>
                        </div>

                        {/* Dates grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-emerald-rich/80 dark:text-luxury-cream/80 border-t border-emerald-rich/5 pt-2 mt-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Check-In</span>
                            <span>{formatDate(booking.checkIn)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Check-Out</span>
                            <span>{formatDate(booking.checkOut)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Guests</span>
                            <span>{booking.guests} Guests</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Paid Cost</span>
                            <span className="text-emerald-rich dark:text-gold font-bold">{formatCurrency(booking.totalPrice)}</span>
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex flex-wrap gap-4 items-center justify-end border-t border-emerald-rich/5 pt-3 mt-1 text-xs">
                          {/* UPI Submission option if unpaid and pending */}
                          {booking.status === "pending" && !booking.upiTransactionId && (
                            <Button
                              variant="luxury"
                              size="sm"
                              className="py-1 px-4 h-8"
                              onClick={() => setSelectedBookingForUpi(booking._id)}
                            >
                              Register Transaction UTR
                            </Button>
                          )}

                          {booking.upiTransactionId && booking.paymentStatus === "unpaid" && (
                            <span className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> Awaiting UPI Verification (UTR: {booking.upiTransactionId})
                            </span>
                          )}

                          {booking.paymentStatus === "paid" && (
                            <span className="text-[10px] uppercase font-bold text-emerald-500 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Paid (UTR Verified)
                            </span>
                          )}

                          {/* Chat on WhatsApp */}
                          <a
                            href={`https://wa.me/918590120810?text=${encodeURIComponent(
                              `Hello Stayora, here are the details of my stay:\n- Resort: ${booking.property?.title}\n- Booking ID: ${booking._id}\n- Check-in: ${new Date(booking.checkIn).toLocaleDateString("en-IN")}\n- Check-out: ${new Date(booking.checkOut).toLocaleDateString("en-IN")}\n- Guests: ${booking.guests}\n- Total Cost: ₹${booking.totalPrice.toLocaleString("en-IN")}\n- Status: ${booking.status}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 py-1 px-4 h-8 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-sm font-bold text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                          >
                            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.45 5.548 0 10.063-4.515 10.066-10.066.002-2.687-1.043-5.215-2.946-7.119C16.68 1.51 14.156.467 11.474.467 5.926.467 1.412 4.981 1.41 10.533c-.001 1.708.452 3.378 1.312 4.83l-.959 3.502 3.582-.94-.288-.168z" />
                            </svg>
                            WhatsApp Stayora
                          </a>

                          {/* Cancellation button */}
                          {isCancellable && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="py-1 px-4 h-8 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                              onClick={() => handleCancelBooking(booking._id)}
                              isLoading={isCancelling === booking._id}
                            >
                              Cancel Stay
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-12 border border-dashed border-gold/15 rounded-sm">
                <p className="text-xs text-muted-foreground">You haven&apos;t booked any luxury stays yet.</p>
                <Link href="/stays" className="mt-4 inline-block">
                  <Button variant="luxury" size="sm">Find Stays</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Wishlist */}
        {activeTab === "wishlist" && (
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold border-b border-emerald-rich/5 pb-2">
              Saved Wishlist ({wishlist.length})
            </h3>

            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {wishlist.map((item) => (
                  <Card key={item._id} className="relative group h-[30rem] flex flex-col justify-between">
                    <div className="relative h-56 overflow-hidden bg-luxury-sand shrink-0">
                      <Link href={`/stays/${item.slug}`} className="block h-full w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </Link>
                      
                      <button
                        onClick={() => handleRemoveWishlist(item._id)}
                        className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full shadow-md transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <CardHeader className="p-4 flex flex-col gap-1 text-left">
                      <Link href={`/stays/${item.slug}`}>
                        <CardTitle className="text-base font-bold text-emerald-rich dark:text-luxury-cream hover:text-gold transition-colors truncate block">{item.title}</CardTitle>
                      </Link>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold uppercase tracking-wider">
                        <MapPin className="h-3 w-3 text-gold-dark shrink-0" />
                        {item.city}, {item.country}
                      </p>
                    </CardHeader>

                    <CardFooter className="p-4 pt-0 justify-between items-center border-t border-emerald-rich/5 mt-2 bg-emerald-rich/[0.01]">
                      <span className="text-sm font-bold text-emerald-rich dark:text-gold font-display">
                        {formatCurrency(item.pricePerNight)} <span className="text-[9px] font-normal text-muted-foreground uppercase font-sans">/ night</span>
                      </span>
                      <Link href={`/stays/${item.slug}`}>
                        <Button variant="outline" size="sm" className="h-8 py-0 text-xs font-bold px-4">Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border border-dashed border-gold/15 rounded-sm">
                <p className="text-xs text-muted-foreground">Your wishlist is empty.</p>
                <Link href="/stays" className="mt-4 inline-block">
                  <Button variant="luxury" size="sm">Save Properties</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Submitted Reviews */}
        {activeTab === "reviews" && (
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold border-b border-emerald-rich/5 pb-2">
              My Submitted Reviews
            </h3>

            {reviews.length > 0 ? (
              <div className="flex flex-col gap-6">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-emerald-rich/5 pb-6 last:border-b-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Link href={`/stays/${rev.property.slug}`} className="font-display text-base font-bold text-emerald-rich dark:text-gold hover:underline">
                        {rev.property.title}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">{formatDate(rev.createdAt)}</span>
                    </div>

                    {/* Star Rating display */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={cn(
                            "h-3.5 w-3.5",
                            idx < rev.rating ? "fill-gold text-gold" : "text-gold-subtle/30"
                          )}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-emerald-rich/80 dark:text-luxury-cream/80 leading-relaxed font-light mt-1 italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border border-dashed border-gold/15 rounded-sm">
                <p className="text-xs text-muted-foreground">You haven&apos;t submitted any reviews yet.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* UPI Receipt submit Modal */}
      <Modal
        isOpen={!!selectedBookingForUpi}
        onClose={() => {
          setSelectedBookingForUpi(null);
          setUtrNumber("");
          setReceiptBase64("");
          setUpiError("");
          setUpiSuccess("");
        }}
        title="Submit UPI Transaction Settlement Reference"
      >
        <form onSubmit={handleUpiSubmit} className="flex flex-col gap-5 text-left text-emerald-rich dark:text-luxury-cream">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Kindly scan the authorized merchant UPI QR code using your preferred mobile banking application to settle your balance. Submit the 12-digit unique transaction identifier (UTR) below to request bank clearance.
          </p>

          {upiError && <span className="text-xs text-red-500 font-semibold">{upiError}</span>}
          {upiSuccess && <span className="text-xs text-gold font-semibold">{upiSuccess}</span>}

          {/* QR Scan helper */}
          <div className="flex flex-col items-center justify-center p-4 bg-emerald-rich/5 border border-gold/15 rounded-sm max-w-xs mx-auto gap-3">
            {/* Direct UPI URI can be parsed as a QR in a real setup, we provide standard mock helper */}
            <div className="h-32 w-32 bg-white flex items-center justify-center border border-gold/25 p-2 rounded-sm relative">
              {/* Dummy QR lines overlay */}
              <div className="absolute inset-2 border border-emerald-rich/10 border-dashed animate-pulse" />
              <Compass className="h-10 w-10 text-emerald-rich/50" />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-gold-dark uppercase tracking-wider">Merchant VPA ID</span>
              <p className="text-xs font-semibold text-emerald-rich dark:text-luxury-cream">stayora@upi</p>
            </div>
          </div>

          <Input
            id="upi-utr"
            label="12-Digit Transaction Reference (UTR Number)"
            type="text"
            placeholder="e.g. 618491028472 (12-digit number)"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Digital Transaction Receipt Screenshot (Optional)
            </span>
            <label className="flex flex-col items-center justify-center border border-dashed border-emerald-rich/20 rounded-sm p-6 bg-emerald-rich/[0.01] hover:bg-emerald-rich/5 transition-all cursor-pointer">
              {receiptBase64 ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-gold">
                  <FileImage className="h-5 w-5" /> Screenshot loaded successfully
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
                  <Upload className="h-6 w-6 text-gold" />
                  <span>Choose screenshot image (JPEG/PNG, max 4MB)</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleReceiptChange} className="hidden" />
            </label>
          </div>

          <Button variant="luxury" size="md" type="submit" isLoading={isSubmittingUpi} className="mt-2 self-end">
            Submit Receipt for Bank Settlement
          </Button>
        </form>
      </Modal>

    </div>
  );
};

export default DashboardClient;
