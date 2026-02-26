import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "font-poppins inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[20px] leading-[120%] font-medium",
  {
    variants: {
      variant: {
        neutral: "border-[#B9BFCA] bg-white text-[#757B86]",
        blue: "border-transparent bg-[#36A9E1] text-white",
        yellow: "border-transparent bg-[#F7C700] text-white",
        purple: "border-[#A855F7] bg-white text-[#A855F7]",
        green: "border-transparent bg-[#35C759] text-white",
        red: "border-transparent bg-[#FF2D55] text-white",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
