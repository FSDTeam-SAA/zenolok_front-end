import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "fs-pop-20-medium-center inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#2DAA46] text-white hover:bg-[#24913b]",
        secondary: "bg-[#EAF0FF] text-[#2F5AA8] hover:bg-[#dce5ff]",
        outline: "border border-[#A3A8B3] bg-transparent text-[#2A2D33] hover:bg-[#F2F4F8]",
        ghost: "text-[#495061] hover:bg-[#ECEFF5]",
        destructive: "bg-[#FF3B30] text-white hover:bg-[#e13127]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
