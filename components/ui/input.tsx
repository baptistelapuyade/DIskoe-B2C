import * as React from "react";

import { cn } from "@/lib/utils";

// shadcn/ui "Input" (style new-york), adapted to the DISKOE tokens: 44 px high,
// 16 px text (framework 3.4, D3), strong border, error border via aria-invalid.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-border-strong bg-input text-foreground placeholder:text-muted-foreground flex min-h-11 w-full min-w-0 rounded-lg border px-3 py-[9.5px] text-base shadow-xs outline-none",
        "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
        "aria-invalid:border-error disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:shadow-[0_0_0_1px_var(--color-error)]",
        "file:text-foreground file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
