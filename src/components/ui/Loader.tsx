import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text = "Loading experiences...",
  fullScreen = false,
}) => {
  const spinnerSizes = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-3",
    lg: "h-16 w-16 border-4",
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative flex items-center justify-center">
        {/* Outer pulse */}
        <div
          className={cn(
            "absolute rounded-full border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin",
            spinnerSizes[size]
          )}
          style={{ animationDuration: "1.2s" }}
        />
        {/* Inner reverse spin */}
        <div
          className={cn(
            "rounded-full border-r-gold-dark border-t-transparent border-b-transparent border-l-transparent animate-spin",
            spinnerSizes[size]
          )}
          style={{ animationDuration: "0.8s", animationDirection: "reverse" }}
        />
      </div>
      {text && (
        <span className="font-display text-sm tracking-widest text-gold-dark uppercase animate-pulse">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-deep/90 backdrop-blur-md">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 w-full">
      {loaderContent}
    </div>
  );
};

export default Loader;
