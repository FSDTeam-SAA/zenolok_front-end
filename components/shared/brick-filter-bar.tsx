"use client";

import { Check, LayoutGrid, Plus } from "lucide-react";
import { motion } from "motion/react";

import { BrickIcon } from "@/components/shared/brick-icon";
import { Badge } from "@/components/ui/badge";
import type { Brick } from "@/lib/api";

type BrickFilterBarProps = {
  bricks: Brick[];
  selectedBrickIds: string[];
  onToggleBrick: (brickId: string) => void;
  onSelectAll: () => void;
  onCreateBrick: () => void;
};

export function BrickFilterBar({
  bricks,
  selectedBrickIds,
  onToggleBrick,
  onSelectAll,
  onCreateBrick,
}: BrickFilterBarProps) {
  const isAllSelected =
    bricks.length > 0 &&
    bricks.every((brick) => selectedBrickIds.includes(brick._id));

  return (
    <motion.section
      className="space-y-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="home-brick-filter overflow-x-auto pb-1">
        <div className="flex w-max min-w-full items-center gap-2 whitespace-nowrap">
        <motion.button
          type="button"
          className="shrink-0"
          onClick={onSelectAll}
          aria-pressed={isAllSelected}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <Badge
            variant="neutral"
            className="rounded-full px-4 py-1 !text-[16px] shadow-sm transition"
            style={
              isAllSelected
                ? {
                    backgroundColor: "#CBD7E9",
                    borderColor: "#CBD7E9",
                    color: "white",
                  }
                : {
                    backgroundColor: "var(--ui-badge-neutral-bg)",
                    borderColor: "var(--ui-badge-neutral-border)",
                    color: "var(--ui-badge-neutral-text)",
                  }
            }
          >
            <LayoutGrid className="size-4" />
            All
            {isAllSelected ? <Check className="size-3.5" /> : null}
          </Badge>
        </motion.button>

        {bricks.map((brick) => {
          const active = selectedBrickIds.includes(brick._id);

          return (
            <motion.button
              key={brick._id}
              type="button"
              className="shrink-0"
              onClick={() => onToggleBrick(brick._id)}
              aria-pressed={active}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              layout
            >
              <Badge
                variant="neutral"
                className="rounded-full px-4 py-1 !text-[16px] shadow-sm transition"
                style={
                  active
                    ? {
                        backgroundColor: brick.color,
                        color: "white",
                        borderColor: brick.color,
                      }
                    : {
                        backgroundColor: "var(--ui-badge-neutral-bg)",
                        color: brick.color,
                        borderColor: brick.color,
                        opacity: 0.78,
                      }
                }
              >
                <BrickIcon name={brick.icon} className="size-4" />
                {brick.name}
              </Badge>
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          className="shrink-0"
          onClick={onCreateBrick}
          aria-label="Create brick"
          whileHover={{ y: -1, rotate: 45 }}
          whileTap={{ scale: 0.94 }}
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-[var(--ui-badge-neutral-border)] bg-[var(--ui-badge-neutral-bg)] text-[var(--ui-badge-neutral-text)]">
            <Plus className="size-4" />
          </span>
        </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
