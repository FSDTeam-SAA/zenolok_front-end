"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content asChild align={align} sideOffset={sideOffset} {...props}>
        <motion.div
          data-slot="popover-content"
          className={cn(
            "z-50 w-72 rounded-xl border border-[var(--ui-popover-border)] bg-[var(--ui-popover-bg)] p-3 text-[var(--text-default)] shadow-[var(--ui-popover-shadow)]",
            className
          )}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          {children}
        </motion.div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
