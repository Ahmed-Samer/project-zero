import { cn } from "../lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#1f2937]/50", className)}
      {...props}
    />
  );
}

export { Skeleton };