"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Calendar as CalendarIcon, Users, Search, Sparkles } from "lucide-react";
import Button from "../ui/Button";

interface HomeHeroProps {
  destinations: string[];
}

const HERO_ITEMS = [
  {
    videoUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05c084e6db6504a7a8d56b0b8c6e267&profile_id=164&oauth2_token_id=57447761",
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1800&q=80",
  },
  {
    videoUrl: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27d2ad6cf7b70603dbac3f391c57e6a72e88771&profile_id=165&oauth2_token_id=57447761",
    imageUrl: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1800&q=80",
  },
  {
    videoUrl: "https://player.vimeo.com/external/370331493.sd.mp4?s=d0016eb2e6245f778d91c7a87679808ea5c6e8e6&profile_id=164&oauth2_token_id=57447761",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
  },
];

export const HomeHero: React.FC<HomeHeroProps> = ({ destinations }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Search States
  const [searchWhere, setSearchWhere] = useState("");
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");
  const [searchGuests, setSearchGuests] = useState(2);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto rotate backgrounds every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HERO_ITEMS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize playing and pausing video elements
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (vid) {
        if (idx === activeIdx) {
          vid.currentTime = 0;
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
    });
  }, [activeIdx]);

  // Click outside to close destination search dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredDestinations = destinations.filter((dest) =>
    dest.toLowerCase().includes(searchWhere.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchWhere) query.set("destination", searchWhere);
    if (searchCheckIn) query.set("checkIn", searchCheckIn);
    if (searchCheckOut) query.set("checkOut", searchCheckOut);
    if (searchGuests) query.set("guests", searchGuests.toString());
    window.location.href = `/stays?${query.toString()}`;
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden text-white font-sans">
      {/* Background Videos/Posters Showcase */}
      {HERO_ITEMS.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIdx ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <video
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={item.videoUrl}
            poster={item.imageUrl}
            loop
            muted
            playsInline
            autoPlay={index === 0}
            className="w-full h-full object-cover"
          />
          {/* Dark luxury overlay */}
          <div className="absolute inset-0 bg-[#031c16]/55 backdrop-blur-[0.5px]" />
        </div>
      ))}

      {/* Centered Search Console */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center gap-6">
        {/* Constant Premium Tagline */}
        <div className="flex items-center gap-2.5 text-gold uppercase tracking-[0.25em] text-xs font-bold animate-fade-in drop-shadow-md">
          <Sparkles className="h-4.5 w-4.5 animate-pulse text-gold" />
          Find your perfect stay
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full shadow-2xl">
          <div className="bg-white dark:bg-emerald-deep rounded-sm p-2 sm:p-3 sm:py-2 border border-gold/15 flex flex-col md:flex-row items-stretch justify-between gap-4 text-left">
            
            {/* Where to Input */}
            <div className="flex-1 flex items-center gap-3 px-3 py-1 border-b md:border-b-0 md:border-r border-gold/15 relative" ref={dropdownRef}>
              <div className="h-8 w-8 rounded-full bg-emerald-rich/5 flex items-center justify-center text-gold shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[9px] uppercase font-bold text-gold tracking-wider">Where to?</span>
                <input
                  type="text"
                  placeholder="Search destinations (e.g. Goa, Manali...)"
                  value={searchWhere}
                  onChange={(e) => {
                    setSearchWhere(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="text-xs font-semibold text-emerald-rich dark:text-luxury-cream placeholder:text-muted-foreground/60 bg-transparent border-none outline-none focus:ring-0 mt-0.5 w-full"
                />
              </div>

              {/* Autocomplete Dropdown list */}
              {showDropdown && filteredDestinations.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-emerald-deep border border-gold/15 rounded-sm shadow-xl z-30 max-h-48 overflow-y-auto">
                  {filteredDestinations.map((dest, idx) => (
                    <button
                      key={`${dest}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSearchWhere(dest);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-rich dark:text-luxury-cream hover:bg-gold/10 transition-colors border-b border-gold/5 last:border-0"
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dates Selection */}
            <div className="flex-1 flex items-center gap-3 px-3 py-1 border-b md:border-b-0 md:border-r border-gold/15">
              <div className="h-8 w-8 rounded-full bg-emerald-rich/5 flex items-center justify-center text-gold shrink-0">
                <CalendarIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-row gap-2 flex-1 min-w-0">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-bold text-gold tracking-wider">Check In</span>
                  <input
                    type="date"
                    value={searchCheckIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSearchCheckIn(e.target.value)}
                    className="text-xs font-semibold text-emerald-rich dark:text-luxury-cream bg-transparent border-none outline-none focus:ring-0 mt-0.5 w-full cursor-pointer p-0"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0 border-l border-gold/10 pl-2">
                  <span className="text-[9px] uppercase font-bold text-gold tracking-wider">Check Out</span>
                  <input
                    type="date"
                    value={searchCheckOut}
                    min={searchCheckIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSearchCheckOut(e.target.value)}
                    className="text-xs font-semibold text-emerald-rich dark:text-luxury-cream bg-transparent border-none outline-none focus:ring-0 mt-0.5 w-full cursor-pointer p-0"
                  />
                </div>
              </div>
            </div>

            {/* Travelers Select */}
            <div className="flex-1 flex items-center gap-3 px-3 py-1">
              <div className="h-8 w-8 rounded-full bg-emerald-rich/5 flex items-center justify-center text-gold shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[9px] uppercase font-bold text-gold tracking-wider">Travelers</span>
                <select
                  value={searchGuests}
                  onChange={(e) => setSearchGuests(parseInt(e.target.value))}
                  className="text-xs font-semibold text-emerald-rich dark:text-luxury-cream bg-transparent border-none outline-none focus:ring-0 mt-0.5 w-full cursor-pointer"
                >
                  <option value={1} className="dark:bg-emerald-deep text-emerald-rich dark:text-luxury-cream">1 Traveler</option>
                  <option value={2} className="dark:bg-emerald-deep text-emerald-rich dark:text-luxury-cream">2 Travelers</option>
                  <option value={4} className="dark:bg-emerald-deep text-emerald-rich dark:text-luxury-cream">4 Travelers</option>
                  <option value={6} className="dark:bg-emerald-deep text-emerald-rich dark:text-luxury-cream">6+ Travelers</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              variant="primary"
              className="bg-emerald-deep hover:bg-emerald-rich text-gold font-semibold text-xs uppercase tracking-wider py-2 px-6 h-10 flex items-center gap-2 rounded-sm border border-gold/25 self-center shrink-0"
            >
              Search Stays <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default HomeHero;
