"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, IndianRupee, Users, MapPin } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

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
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false);

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
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans bg-white dark:bg-emerald-deep p-4 border border-gold/15 rounded-sm shadow-md">
      {/* Horizontal grid bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-end">
        
        {/* 1. Destination */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gold-dark flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> Destination
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="h-9 w-full rounded-sm border border-emerald-rich/10 dark:border-gold/20 bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold text-emerald-rich dark:text-luxury-cream cursor-pointer"
          >
            <option value="" className="dark:bg-emerald-deep">All Destinations</option>
            {destinations.map((dest) => (
              <option key={dest} value={dest} className="dark:bg-emerald-deep">
                {dest}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Price Range */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gold-dark flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5 shrink-0" /> Price (INR)
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-9 text-xs px-2"
            />
            <span className="text-muted-foreground text-xs font-light">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-9 text-xs px-2"
            />
          </div>
        </div>

        {/* 3. Guests */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gold-dark flex items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0" /> Guests Limit
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="h-9 w-full rounded-sm border border-emerald-rich/10 dark:border-gold/20 bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold text-emerald-rich dark:text-luxury-cream cursor-pointer"
          >
            <option value="" className="dark:bg-emerald-deep">Any Guests</option>
            {[2, 4, 6, 8, 10, 12, 14].map((num) => (
              <option key={num} value={num} className="dark:bg-emerald-deep">
                {num}+ Guests
              </option>
            ))}
          </select>
        </div>

        {/* 4. Rating */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gold-dark flex items-center gap-1">
            <Star className="h-3.5 w-3.5 shrink-0" /> Rating
          </label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="h-9 w-full rounded-sm border border-emerald-rich/10 dark:border-gold/20 bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold text-emerald-rich dark:text-luxury-cream cursor-pointer"
          >
            <option value="" className="dark:bg-emerald-deep">All ratings</option>
            <option value="4.8" className="dark:bg-emerald-deep">4.8★ & Above</option>
            <option value="4.5" className="dark:bg-emerald-deep">4.5★ & Above</option>
            <option value="4.0" className="dark:bg-emerald-deep">4.0★ & Above</option>
          </select>
        </div>

        {/* 5. Amenities Custom Dropdown */}
        <div className="flex flex-col gap-1.5 text-left relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gold-dark flex items-center gap-1">
            Amenities
          </label>
          <button
            type="button"
            onClick={() => setShowAmenitiesDropdown(!showAmenitiesDropdown)}
            className="h-9 w-full rounded-sm border border-emerald-rich/10 dark:border-gold/20 bg-transparent px-3 py-1 text-xs text-left flex items-center justify-between text-emerald-rich dark:text-luxury-cream font-medium focus:ring-1 focus:ring-gold"
          >
            <span className="truncate">
              {selectedAmenities.length > 0
                ? `${selectedAmenities.length} selected`
                : "Select amenities"}
            </span>
            <span className="text-[8px] text-gold shrink-0">▼</span>
          </button>
          
          {showAmenitiesDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAmenitiesDropdown(false)} />
              <div className="absolute top-full left-0 right-0 mt-1.5 p-3 bg-white dark:bg-emerald-deep border border-gold/20 rounded-sm shadow-xl z-20 max-h-48 overflow-y-auto flex flex-col gap-2">
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
            </>
          )}
        </div>

        {/* 6. Sort By */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gold-dark flex items-center gap-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 w-full rounded-sm border border-emerald-rich/10 dark:border-gold/20 bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold text-emerald-rich dark:text-luxury-cream cursor-pointer"
          >
            <option value="recommended" className="dark:bg-emerald-deep">Recommended</option>
            <option value="price_asc" className="dark:bg-emerald-deep">Price: Low to High</option>
            <option value="price_desc" className="dark:bg-emerald-deep">Price: High to Low</option>
            <option value="rating_desc" className="dark:bg-emerald-deep">Top Rated</option>
          </select>
        </div>

        {/* 7. Action buttons */}
        <div className="flex gap-2 min-w-[150px] w-full">
          <Button variant="outline" size="sm" className="h-9 flex-1 text-xs font-bold" onClick={clearFilters}>
            Clear
          </Button>
          <Button variant="primary" size="sm" className="h-9 flex-1 text-xs font-bold" onClick={applyFilters}>
            Apply
          </Button>
        </div>

      </div>
    </div>
  );
};

export default StaysFilter;
