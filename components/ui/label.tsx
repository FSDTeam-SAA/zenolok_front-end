"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn("font-poppins text-[16px] leading-[120%] font-normal text-[#4B4F59]", className)}
      {...props}
    />
  );
}

export { Label };
