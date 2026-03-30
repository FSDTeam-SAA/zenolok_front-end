import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "fs-pop-16-regular flex h-12 w-full rounded-xl border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] px-4 py-2 text-[var(--ui-input-text)] placeholder:text-[var(--ui-input-placeholder)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
