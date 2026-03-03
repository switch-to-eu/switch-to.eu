"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@switch-to-eu/ui/lib/utils"
import { buttonVariants } from "@switch-to-eu/ui/components/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      disabled={{ before: new Date() }}
      className={cn("p-3", className)}
      classNames={{
        root: `${defaultClassNames.root} shadow-card rounded-lg border border-border bg-card`,
        months: `${defaultClassNames.months} space-y-4`,
        month: `${defaultClassNames.month} space-y-4`,
        month_caption: `${defaultClassNames.month_caption} flex justify-center pt-1 relative items-center gradient-primary rounded-t-md py-3 px-4 mb-4`,
        caption_label: `${defaultClassNames.caption_label} text-sm font-medium text-white`,
        nav: `${defaultClassNames.nav} space-x-1 flex items-center`,
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 relative z-10"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 relative z-10"
        ),
        month_grid: `${defaultClassNames.month_grid} w-full border-collapse space-y-1`,
        weekdays: `${defaultClassNames.weekdays} flex`,
        weekday: `${defaultClassNames.weekday} text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] py-2`,
        week: `${defaultClassNames.week} flex w-full mt-2`,
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
        day_button: "h-9 w-9 p-0 font-normal rounded-md transition-colors hover:bg-tool-surface/10 hover:text-tool-primary flex items-center justify-center",
        range_end: "day-range-end [&>button]:!rounded-md",
        selected: "[&>button]:!bg-tool-primary [&>button]:!text-white [&>button]:shadow-xs [&>button]:!rounded-md",
        today: "[&>button]:bg-tool-surface/20 [&>button]:text-tool-primary [&>button]:font-semibold [&>button]:border [&>button]:border-tool-accent",
        outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground/50 opacity-50 pointer-events-none",
        range_middle: "[&>button]:!bg-tool-primary [&>button]:!text-white [&>button]:!rounded-md",
        range_start: "[&>button]:!bg-tool-primary [&>button]:!text-white [&>button]:!rounded-md",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
