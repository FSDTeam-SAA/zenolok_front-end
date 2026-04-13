"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <motion.div
      className="mt-4 flex items-center justify-end gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="!text-[16px]">
        <ChevronLeft className="size-4 " /> Prev
      </Button>
      <span className="text-sm text-[var(--text-muted)]">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="!text-[16px]"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next <ChevronRight className="size-4" />
      </Button>
    </motion.div>
  );
}
