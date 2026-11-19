import * as React from "react";

import { cn } from "@/lib/utils";

// shadcn/ui "Textarea" (style new-york), adapted to the DISKOE tokens.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border-strong bg-input text-foreground placeholder:text-muted-foreground flex min-h-[76px] w-full rounded-lg border px-3 py-2 text-base shadow-xs outline-none",
        "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
        "aria-invalid:border-error disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
