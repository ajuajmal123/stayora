"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Star, DollarSign, Users, X, MapPin } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { cn } from "@/lib/utils";

interface StaysFilterProps {
  destinations: string[];
  availableAmenities: string[];
}

export const StaysFilter: React.FC<StaysFilterProps> = ({
  destinations,
  availableAmenities,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter States
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");
  const [minRating, setMinRating] = useState(searchParams.get("rating") || "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get("amenities")?.split(",")?.filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recommended");
  const [isOpen, setIsOpen] = useState(false); // Mobile filter toggle

  // Sync state with URL updates
  useEffect(() => {
    setDestination(searchParams.get("destination") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setGuests(searchParams.get("guests") || "");
    setMinRating(searchParams.get("rating") || "");
    setSelectedAmenities(searchParams.get("amenities")?.split(",")?.filter(Boolean) || []);
    setSortBy(searchParams.get("sort") || "recommended");
  }, [searchParams]);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (destination) params.set("destination", destination);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (guests) params.set("guests", guests);
    if (minRating) params.set("rating", minRating);
    if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));
    if (sortBy) params.set("sort", sortBy);

    router.push(`/stays?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setDestination("");
    setMinPrice("");
    setMaxPrice("");
    setGuests("");
    setMinRating("");
    setSelectedAmenities([]);
    setSortBy("recommended");
    router.push("/stays");
    setIsOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans">
      {/* Mobile filter toggle and sort */}
      <div className="flex md:hidden items-center justify-between gap-4 p-4 border border-gold/15 bg-white dark:bg-emerald-deep rounded-sm">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold"
        >
          <SlidersHorizontal className="h-4.5 w-4.5" /> Filters
        </button>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            const params = new URLSearchParams(searchParams.toString());
            params.set("sort", e.target.value);
            router.push(`/stays?${params.toString()}`);
          }}
          className="text-xs uppercase font-semibold tracking-wider bg-transparent border-0 text-emerald-rich dark:text-gold focus:ring-0"
        >
          <option value="recommended">Recommended</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Top Rated</option>
        </select>
      </div>

      {/* Desktop filters Sidebar / Mobile Dialog */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:z-0 md:relative bg-emerald-deep/50 backdrop-blur-sm md:backdrop-blur-none flex md:block items-end md:items-start justify-center p-0 md:p-0 transition-all duration-300 md:bg-transparent",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"
        )}
      >
        <div
          className={cn(
            "w-full max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible bg-white dark:bg-emerald-deep border border-gold/20 md:border-gold/10 p-6 rounded-t-sm md:rounded-sm flex flex-col gap-6 shadow-xl md:shadow-none transition-transform duration-300",
            isOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"
          )}
        >
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between pb-4 border-b border-gold/10">
            <h3 className="font-display text-xl font-bold text-emerald-rich dark:text-gold">Filter Properties</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-gold">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Destination */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gold-dark" /> Destination
            </span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="h-10 w-full rounded-sm border border-emerald-rich/10 bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold"
            >
              <option value="">All Destinations</option>
              {destinations.map((dest) => (
                <option key={dest} value={dest}>
                  {dest}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-gold-dark" /> Price Range (USD)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gold-dark" /> Guests limit
            </span>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="h-10 w-full rounded-sm border border-emerald-rich/10 bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            >
              <option value="">Any guests count</option>
              {[2, 4, 6, 8, 10, 12, 14].map((num) => (
                <option key={num} value={num}>
                  {num}+ Guests
                </option>
              ))}
            </select>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-gold-dark" /> Rating
            </span>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "All ratings", value: "" },
                { label: "4.8★ & Above", value: "4.8" },
                { label: "4.5★ & Above", value: "4.5" },
                { label: "4.0★ & Above", value: "4.0" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setMinRating(opt.value)}
                  className={cn(
                    "text-left text-xs py-1.5 px-2.5 rounded-sm transition-colors border",
                    minRating === opt.value
                      ? "bg-gold/10 border-gold/30 text-emerald-rich dark:text-gold"
                      : "border-transparent text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Luxury Amenities */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Amenities
            </span>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {availableAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 text-xs text-emerald-rich/80 dark:text-luxury-cream/80 cursor-pointer hover:text-gold transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="rounded-sm border-emerald-rich/20 text-gold focus:ring-gold h-4 w-4 bg-transparent cursor-pointer"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By (Desktop only) */}
          <div className="hidden md:flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Sort By
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 w-full rounded-sm border border-emerald-rich/10 bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4 border-t border-gold/10 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear
            </Button>
            <Button variant="primary" size="sm" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaysFilter;
