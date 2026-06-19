"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface WishlistToggleProps {
  propertyId: string;
  initialIsWishlisted?: boolean;
  className?: string;
}

export const WishlistToggle: React.FC<WishlistToggleProps> = ({
  propertyId,
  initialIsWishlisted = false,
  className,
}) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, setIsPending] = useState(false);

  // Sync with initial value updates
  useEffect(() => {
    setIsWishlisted(initialIsWishlisted);
  }, [initialIsWishlisted]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }

    if (isPending) return;

    setIsPending(true);
    // Optimistic UI update
    setIsWishlisted(!isWishlisted);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      const body = await response.json();

      if (!body.success) {
        // Rollback state if error occurs
        setIsWishlisted(isWishlisted);
        console.error("Wishlist sync error:", body.message);
      } else {
        setIsWishlisted(body.data.isAdded);
        router.refresh(); // Triggers server-side updates of lists if needed
      }
    } catch (error) {
      console.error("Wishlist network error:", error);
      setIsWishlisted(isWishlisted); // Rollback
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "flex items-center justify-center p-2 rounded-full backdrop-blur-md transition-all duration-300 border focus:outline-none",
        isWishlisted
          ? "bg-gold/90 border-gold text-emerald-deep shadow-md"
          : "bg-emerald-deep/40 border-luxury-cream/15 text-luxury-cream hover:bg-emerald-deep/70 hover:border-gold/30",
        className
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-4.5 w-4.5 transition-all duration-300",
          isWishlisted ? "fill-emerald-deep stroke-emerald-deep" : "stroke-current"
        )}
      />
    </motion.button>
  );
};

export default WishlistToggle;
