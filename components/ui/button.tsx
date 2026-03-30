import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "fs-pop-20-medium-center inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ui-btn-primary-bg)] text-[var(--ui-btn-primary-text)] hover:bg-[var(--ui-btn-primary-hover)]",
        secondary:
          "bg-[var(--ui-btn-secondary-bg)] text-[var(--ui-btn-secondary-text)] hover:bg-[var(--ui-btn-secondary-hover)]",
        outline:
          "border border-[var(--ui-btn-outline-border)] bg-[var(--ui-btn-outline-bg)] text-[var(--ui-btn-outline-text)] hover:bg-[var(--ui-btn-outline-hover)]",
        ghost:
          "text-[var(--ui-btn-ghost-text)] hover:bg-[var(--ui-btn-ghost-hover)]",
        destructive:
          "bg-[var(--ui-btn-danger-bg)] text-white hover:bg-[var(--ui-btn-danger-hover)]",
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
