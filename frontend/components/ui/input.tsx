import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "h-10 w-full min-w-0 rounded-lg border border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-900/50",
        "px-3.5 py-2 text-sm",
        "transition-all duration-200 outline-none",
        "hover:border-gray-300 dark:hover:border-gray-600",
        "focus:border-blue-500 dark:focus:border-blue-500",
        "focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-500/30",
        "aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-500/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:mr-3",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
