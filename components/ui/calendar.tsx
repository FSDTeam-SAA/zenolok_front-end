"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col",
          month: "space-y-3",
          caption: "relative flex items-center justify-between pt-1",
          caption_label: "text-[2.5rem] font-semibold leading-none text-[var(--text-strong)]",
          nav: "flex items-center gap-1",
          nav_button: "size-7 rounded-md border border-transparent text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-strong)]",
          nav_button_previous: "absolute left-0",
          nav_button_next: "absolute right-0",
          table: "w-full border-collapse",
          head_row: "grid grid-cols-7",
          head_cell: "py-1 text-center text-[1.55rem] leading-none font-medium text-[var(--text-muted)]",
          row: "mt-2 grid grid-cols-7",
          cell: "text-center",
          day: "mx-auto flex size-10 items-center justify-center rounded-full text-[2rem] leading-none text-[var(--text-default)] transition hover:bg-[var(--surface-2)]",
          day_selected: "bg-[var(--ui-calendar-accent)] text-white hover:bg-[var(--ui-calendar-accent-hover)]",
          day_today: "border border-[var(--ui-checkbox-border)]",
          day_range_middle: "rounded-none bg-[var(--ui-calendar-range-bg)] text-white",
          day_range_start: "rounded-l-full rounded-r-none bg-[var(--ui-calendar-range-bg)] text-white",
          day_range_end: "rounded-r-full rounded-l-none bg-[var(--ui-calendar-range-bg)] text-white",
          day_outside: "text-[var(--ui-calendar-outside-text)]",
          day_disabled: "text-[var(--ui-calendar-outside-text)] opacity-60",
          ...classNames,
        }}
        components={{
          Chevron: ({ orientation, className }) =>
            orientation === "left" ? <ChevronLeft className={cn("size-4", className)} /> : <ChevronRight className={cn("size-4", className)} />,
        }}
        {...props}
      />
    </motion.div>
  );
}

export { Calendar };
