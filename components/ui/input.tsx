import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "font-poppins flex h-12 w-full rounded-xl border border-[#A3A8B3] bg-white px-4 py-2 text-[16px] leading-[120%] font-normal text-[#22253A] placeholder:text-[16px] placeholder:text-[#A7ACB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#88B4FF] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
