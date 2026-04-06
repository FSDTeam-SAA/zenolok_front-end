"use client";

import { Sun } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type AllDayTabToggleProps = {
  active: boolean;
  onToggle: () => void;
  className?: string;
};

export function AllDayTabToggle({
  active,
  onToggle,
  className,
}: AllDayTabToggleProps) {
  const thumbTransition = {
    type: "spring" as const,
    stiffness: 420,
    damping: 30,
  };

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={cn(
        "font-poppins relative inline-flex h-12 w-[156px] items-center rounded-full border p-1 transition-colors duration-300",
        active
          ? "border-[var(--ui-btn-primary-bg)] bg-[var(--ui-btn-primary-bg)] text-[var(--ui-btn-primary-text)] hover:border-[var(--ui-btn-primary-hover)] hover:bg-[var(--ui-btn-primary-hover)]"
          : "border-[var(--ui-btn-outline-border)] bg-[var(--surface-1)] text-[var(--ui-btn-outline-text)] hover:bg-[var(--ui-btn-outline-hover)]",
        className
      )}
      whileTap={{ scale: 0.97 }}
    >
      {/* Label - Fixed position for better stability */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-[17px] font-semibold transition-transform duration-300",
          active ? "-translate-x-4" : "translate-x-4"
        )}
      >
        All day
      </span>

      {/* Thumb */}
      <motion.span
        className={cn(
          "relative z-20 flex size-8 items-center justify-center rounded-full border shadow-sm transition-colors",
          active
            ? "border-[var(--ui-btn-primary-bg)] bg-white text-[var(--ui-btn-primary-bg)]"
            : "border-[var(--ui-btn-outline-border)] bg-[var(--surface-1)] text-[var(--text-muted)]"
        )}
        initial={false}
        animate={{ x: active ? 102 : 0 }} // Adjusted for 156px width
        transition={thumbTransition}
      >
        <Sun className="size-4" strokeWidth={2.5} />
      </motion.span>
    </motion.button>
  );
}
