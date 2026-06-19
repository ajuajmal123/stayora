"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import Button from "../ui/Button";

interface HomeSearchProps {
  destinations: string[];
}

export const HomeSearch: React.FC<HomeSearchProps> = ({ destinations }) => {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);

    router.push(`/stays?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl bg-white dark:bg-emerald-deep/95 backdrop-blur-md border border-gold/20 p-4 sm:p-3 rounded-sm shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-2 text-left font-sans"
    >
      {/* Destination select */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-emerald-rich/10">
        <MapPin className="h-5 w-5 text-gold shrink-0" />
        <div className="flex-1 flex flex-col">
          <label className="text-[9px] uppercase tracking-wider text-gold-dark font-bold">Destination</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full text-xs font-semibold bg-transparent border-0 p-0 text-emerald-rich dark:text-luxury-cream focus:ring-0 focus:outline-none cursor-pointer mt-0.5"
          >
            <option value="">Where would you escape?</option>
            {destinations.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Check In Date */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-emerald-rich/10">
        <Calendar className="h-5 w-5 text-gold shrink-0" />
        <div className="flex-1 flex flex-col">
          <label className="text-[9px] uppercase tracking-wider text-gold-dark font-bold">Check-In</label>
          <input
            type="date"
            value={checkIn}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full text-xs font-semibold bg-transparent border-0 p-0 text-emerald-rich dark:text-luxury-cream focus:ring-0 focus:outline-none cursor-pointer mt-0.5 h-auto"
          />
        </div>
      </div>

      {/* Check Out Date */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-emerald-rich/10">
        <Calendar className="h-5 w-5 text-gold shrink-0" />
        <div className="flex-1 flex flex-col">
          <label className="text-[9px] uppercase tracking-wider text-gold-dark font-bold">Check-Out</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full text-xs font-semibold bg-transparent border-0 p-0 text-emerald-rich dark:text-luxury-cream focus:ring-0 focus:outline-none cursor-pointer mt-0.5 h-auto"
          />
        </div>
      </div>

      {/* Guests selection */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2">
        <Users className="h-5 w-5 text-gold shrink-0" />
        <div className="flex-1 flex flex-col">
          <label className="text-[9px] uppercase tracking-wider text-gold-dark font-bold">Travelers</label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full text-xs font-semibold bg-transparent border-0 p-0 text-emerald-rich dark:text-luxury-cream focus:ring-0 focus:outline-none cursor-pointer mt-0.5"
          >
            {[1, 2, 4, 6, 8, 10, 12, 14].map((num) => (
              <option key={num} value={num.toString()}>
                {num} Guest{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Trigger */}
      <Button variant="luxury" size="md" type="submit" className="md:h-12 px-6 shrink-0 flex items-center justify-center gap-2">
        <Search className="h-4 w-4" /> <span>Search</span>
      </Button>
    </form>
  );
};

export default HomeSearch;
