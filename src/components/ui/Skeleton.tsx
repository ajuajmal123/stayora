import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-sm bg-emerald-rich/5 dark:bg-emerald-light/5 animate-shimmer relative overflow-hidden",
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
