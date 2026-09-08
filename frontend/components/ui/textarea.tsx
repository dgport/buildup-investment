import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "min-h-[80px] w-full rounded-lg border border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-900/50",
        "px-3.5 py-2.5 text-sm",
        "transition-all duration-200 outline-none resize-y",
        "hover:border-gray-300 dark:hover:border-gray-600",
        "focus:border-teal-600 dark:focus:border-teal-600",
        "focus:ring-1 focus:ring-teal-600/20 dark:focus:ring-teal-500/30",
        "aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-500/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900",
        "field-sizing-content",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
