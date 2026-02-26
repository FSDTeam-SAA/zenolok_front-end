"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-3",
        caption: "flex justify-between items-center pt-1 relative",
        caption_label: "text-[2.5rem] font-semibold leading-none text-[#373C44]",
        nav: "flex items-center gap-1",
        nav_button: "size-7 rounded-md border border-transparent text-[#737A87] hover:bg-[#F0F3F8]",
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7",
        head_cell: "text-center text-[1.55rem] leading-none font-medium text-[#8E94A3] py-1",
        row: "grid grid-cols-7 mt-2",
        cell: "text-center",
        day: "mx-auto flex size-10 items-center justify-center rounded-full text-[2rem] leading-none text-[#6A7080] hover:bg-[#ECEFF5]",
        day_selected: "bg-[#F47777] text-white hover:bg-[#ea6666]",
        day_today: "border border-[#AAB1BF]",
        day_range_middle: "bg-[#3F4552] text-white rounded-none",
        day_range_start: "bg-[#3F4552] text-white rounded-l-full rounded-r-none",
        day_range_end: "bg-[#3F4552] text-white rounded-r-full rounded-l-none",
        day_outside: "text-[#C8CDD7]",
        day_disabled: "text-[#D0D3DB]",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) =>
          orientation === "left" ? <ChevronLeft className={cn("size-4", className)} /> : <ChevronRight className={cn("size-4", className)} />,
      }}
      {...props}
    />
  );
}

export { Calendar };
