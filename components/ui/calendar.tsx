"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";

// shadcn/ui "Calendar" (style new-york, react-day-picker), adapted to the
// DISKOE tokens. Day cells are 44 px (framework 3.4, D3).
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-background p-2", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col gap-4", defaults.months),
        month: cn("flex w-full flex-col gap-3", defaults.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between",
          defaults.nav,
        ),
        button_previous: cn(
          "text-foreground hover:bg-hover inline-flex size-11 items-center justify-center rounded-lg disabled:opacity-50",
          defaults.button_previous,
        ),
        button_next: cn(
          "text-foreground hover:bg-hover inline-flex size-11 items-center justify-center rounded-lg disabled:opacity-50",
          defaults.button_next,
        ),
        month_caption: cn(
          "flex h-11 w-full items-center justify-center px-11",
          defaults.month_caption,
        ),
        caption_label: cn("text-sm font-medium select-none", defaults.caption_label),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "text-muted-foreground w-11 flex-1 text-xs font-normal select-none",
          defaults.weekday,
        ),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn(
          "group/day relative size-11 p-0 text-center text-sm select-none",
          defaults.day,
        ),
        day_button: cn(
          "hover:bg-hover focus-visible:outline-ring inline-flex size-11 items-center justify-center rounded-lg text-sm font-normal outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] group-data-[selected=true]/day:bg-primary group-data-[selected=true]/day:text-primary-foreground",
          defaults.day_button,
        ),
        today: cn("font-semibold underline underline-offset-4", defaults.today),
        outside: cn("text-muted-foreground opacity-60", defaults.outside),
        disabled: cn("text-muted-foreground opacity-40", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className={cn("size-4", chevronClass)} {...rest} />
          ) : (
            <ChevronRightIcon className={cn("size-4", chevronClass)} {...rest} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
