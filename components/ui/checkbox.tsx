"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-md border border-[var(--ui-checkbox-border)] bg-[var(--ui-checkbox-bg)] shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-checkbox-ring)] data-[state=checked]:border-[var(--ui-btn-primary-bg)] data-[state=checked]:bg-[var(--ui-btn-primary-bg)]",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        <Check className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
