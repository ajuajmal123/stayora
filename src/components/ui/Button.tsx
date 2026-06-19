"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "luxury" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", isLoading, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-sm transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50 disabled:pointer-events-none tracking-wide font-sans";

    const variants = {
      primary:
        "bg-emerald-rich text-luxury-cream border border-emerald-accent hover:bg-emerald-accent hover:border-gold hover:text-gold shadow-sm",
      secondary:
        "bg-luxury-cream text-emerald-rich border border-emerald-rich/10 hover:border-gold hover:bg-luxury-sand shadow-sm",
      outline:
        "bg-transparent text-gold border border-gold hover:bg-gold/10",
      luxury:
        "bg-gradient-to-r from-gold-dark via-gold to-gold-subtle text-emerald-deep font-semibold shadow-md hover:brightness-105 border border-gold-light/20",
      ghost:
        "bg-transparent text-foreground hover:bg-foreground/5",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.01 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.99 } : {}}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
            Please wait...
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
