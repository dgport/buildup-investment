import { cn } from "@/lib/utils";

/** Neutral shimmering placeholder block. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-teal-950/[0.06] via-teal-950/[0.1] to-teal-950/[0.06] bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
