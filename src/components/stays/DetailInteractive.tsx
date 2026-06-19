"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, Calendar, Users, Shield, ArrowRight, MessageSquarePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import Button from "../ui/Button";
import Input from "../ui/Input";
import WishlistToggle from "./WishlistToggle";
import { useAuth } from "@/hooks/useAuth";

interface ReviewPayload {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface DetailInteractiveProps {
  propertyId: string;
  images: string[];
  pricePerNight: number;
  maxGuests: number;
  initialReviews: ReviewPayload[];
  isWishlisted: boolean;
}

export const DetailInteractive: React.FC<DetailInteractiveProps> = ({
  propertyId,
  images,
  pricePerNight,
  maxGuests,
  initialReviews,
  isWishlisted,
}) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // 1. Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // 2. Booking Calendar simulation state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
  const [showCalendarSim, setShowCalendarSim] = useState(false);

  // Calculate prices
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const baseTotal = nights * pricePerNight;
  const serviceFee = nights * 120; // Luxury service fee
  const totalCost = baseTotal + serviceFee;

  // 3. Reviews management state
  const [reviews, setReviews] = useState<ReviewPayload[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!comment || comment.length < 10) {
      setReviewError("Your review must be at least 10 characters long.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          rating,
          comment,
        }),
      });

      const body = await response.json();

      if (body.success && body.data) {
        // Add new review to list
        setReviews((prev) => [body.data, ...prev]);
        setReviewSuccess("Review submitted successfully! Rating updated.");
        setComment("");
        setRating(5);
        router.refresh(); // Triggers server component to refetch average rating
      } else {
        setReviewError(body.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      setReviewError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 font-sans">
      
      {/* Main details on left (Gallery & Reviews) */}
      <div className="lg:col-span-2 flex flex-col gap-10">
        
        {/* Interactive Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative h-[30rem] w-full rounded-sm overflow-hidden bg-luxury-sand border border-gold/15 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImageIndex] || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"}
              alt="Luxury Estate Main"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01]"
            />
            
            <div className="absolute top-6 right-6">
              <WishlistToggle
                propertyId={propertyId}
                initialIsWishlisted={isWishlisted}
                className="scale-110 shadow-lg"
              />
            </div>
          </div>

          {/* Thumbnails grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "h-24 rounded-sm overflow-hidden border transition-all duration-300 relative",
                    activeImageIndex === idx
                      ? "border-gold shadow-md scale-[0.98]"
                      : "border-emerald-rich/10 hover:border-gold/50"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  {activeImageIndex !== idx && (
                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Reviews Section */}
        <div className="flex flex-col gap-8 border-t border-emerald-rich/5 pt-10">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold">
              Guest Reviews ({reviews.length})
            </h3>
          </div>

          {/* Review Input for authenticated users */}
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="bg-emerald-rich/5 border border-gold/15 p-6 rounded-sm flex flex-col gap-4">
              <span className="text-xs uppercase tracking-wider text-emerald-rich dark:text-gold-subtle font-bold flex items-center gap-1.5">
                <MessageSquarePlus className="h-4 w-4" /> Share Your Experience
              </span>

              {reviewError && (
                <span className="text-xs text-red-500 font-medium">{reviewError}</span>
              )}
              {reviewSuccess && (
                <span className="text-xs text-gold font-medium">{reviewSuccess}</span>
              )}

              {/* Star Rating select */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-rich/70 dark:text-luxury-cream/70">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-gold focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star
                        className={cn(
                          "h-5 w-5",
                          rating >= star ? "fill-gold text-gold" : "text-gold-subtle"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div className="flex flex-col gap-1">
                <textarea
                  placeholder="Share details of your stay, from the service quality to the estate views..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full min-h-[100px] p-3 text-xs bg-white dark:bg-emerald-deep border border-emerald-rich/10 rounded-sm focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSubmittingReview}
                className="self-end"
              >
                Submit Review
              </Button>
            </form>
          ) : (
            <div className="p-4 bg-emerald-rich/5 border border-emerald-rich/10 text-center rounded-sm">
              <p className="text-xs text-muted-foreground">
                Only authenticated travelers can write reviews.{" "}
                <Link href={`/login?callbackUrl=${window.location.pathname}`} className="text-gold hover:underline font-semibold">
                  Sign In
                </Link> to review.
              </p>
            </div>
          )}

          {/* List of Reviews */}
          {reviews.length > 0 ? (
            <div className="flex flex-col gap-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="border-b border-emerald-rich/5 pb-6 last:border-b-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-accent flex items-center justify-center font-bold text-gold border border-gold/15 overflow-hidden text-xs">
                        {rev.user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={rev.user.avatar} alt={rev.user.name} className="h-full w-full object-cover" />
                        ) : (
                          rev.user.name[0]
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-xs uppercase tracking-wider font-bold text-emerald-rich dark:text-gold">
                          {rev.user.name}
                        </p>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={cn(
                            "h-3.5 w-3.5",
                            idx < Math.floor(rev.rating) ? "fill-gold text-gold" : "text-gold-subtle/40"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-emerald-rich/80 dark:text-luxury-cream/80 leading-relaxed font-light pl-12 italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-emerald-rich/5 border border-dashed border-gold/15 rounded-sm">
              <p className="text-xs text-muted-foreground">No reviews has been posted yet. Be the first to share your experience!</p>
            </div>
          )}

        </div>

      </div>

      {/* Booking Drawer Sidebar on right */}
      <div className="lg:col-span-1">
        <div className="sticky top-28 bg-white dark:bg-emerald-deep border border-gold/20 p-6 rounded-sm shadow-xl flex flex-col gap-6">
          <div className="flex items-baseline justify-between border-b border-emerald-rich/5 pb-4">
            <span className="text-2xl font-bold font-display text-emerald-rich dark:text-gold">
              {formatCurrency(pricePerNight)}
            </span>
            <span className="text-xs text-muted-foreground">/ night</span>
          </div>

          {/* Interactive Date Picker fields */}
          <div className="flex flex-col gap-4 font-sans">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gold-dark">Check-In</label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-10 rounded-sm border border-emerald-rich/10 bg-transparent px-3 text-xs focus:ring-1 focus:ring-gold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gold-dark">Check-Out</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-10 rounded-sm border border-emerald-rich/10 bg-transparent px-3 text-xs focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            {/* Guests selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gold-dark">Travelers</label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                className="h-10 rounded-sm border border-emerald-rich/10 bg-transparent px-3 text-xs focus:ring-1 focus:ring-gold"
              >
                {Array.from({ length: maxGuests }).map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {idx + 1} Guest{idx > 0 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability Status */}
          <button
            onClick={() => setShowCalendarSim(!showCalendarSim)}
            className="flex items-center justify-between text-xs font-semibold text-gold hover:text-gold-dark transition-colors self-start gap-1"
          >
            <Calendar className="h-4 w-4" /> {showCalendarSim ? "Hide availability calendar" : "Show availability calendar"}
          </button>

          {/* Mock Calendar Grid */}
          <AnimatePresence>
            {showCalendarSim && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border border-gold/15 p-4 rounded-sm bg-emerald-rich/5 overflow-hidden text-center"
              >
                <span className="text-[10px] uppercase tracking-wider text-emerald-rich dark:text-gold font-bold">Availability Status</span>
                <div className="grid grid-cols-7 gap-1 mt-2 text-[10px] text-muted-foreground font-semibold">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isBooked = [4, 5, 6, 12, 13, 14, 21, 22].includes(dayNum);
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "py-1.5 rounded-sm border font-medium",
                          isBooked
                            ? "bg-red-400/10 border-transparent text-red-400 line-through cursor-not-allowed"
                            : "bg-emerald-rich/5 border-transparent text-emerald-rich dark:text-luxury-cream"
                        )}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cost details */}
          {nights > 0 && (
            <div className="flex flex-col gap-3 border-t border-emerald-rich/5 pt-4 text-xs font-medium text-emerald-rich/80 dark:text-luxury-cream/80">
              <div className="flex items-center justify-between">
                <span>{formatCurrency(pricePerNight)} x {nights} night{nights > 1 ? "s" : ""}</span>
                <span>{formatCurrency(baseTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stayora Premium Service Fee</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-emerald-rich/5 pt-3 font-bold text-sm text-emerald-rich dark:text-gold">
                <span>Total Cost</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
            </div>
          )}

          <Button variant="luxury" size="lg" className="w-full mt-2" disabled={!checkIn || !checkOut}>
            Request Reservation
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            You won&apos;t be charged yet. Final confirmation is checked by your luxury concierge.
          </p>

          <hr className="border-emerald-rich/5" />

          {/* Host info */}
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gold-dark" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider">Stayora Protection</span>
              <p className="text-[10px] text-muted-foreground">Premium security guarantee & 24/7 client coordination.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DetailInteractive;
