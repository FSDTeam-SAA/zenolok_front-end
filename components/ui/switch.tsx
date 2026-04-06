"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border p-0.5 outline-none transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--ui-checkbox-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--ui-switch-on)] data-[state=checked]:bg-[var(--ui-switch-on)] data-[state=unchecked]:border-[var(--ui-switch-off-border)] data-[state=unchecked]:bg-[var(--ui-switch-off)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-7 rounded-full bg-[var(--ui-switch-thumb)] shadow-[0_2px_10px_rgba(15,23,42,0.22)] transition-transform duration-200 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
