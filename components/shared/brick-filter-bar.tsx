"use client";

import { Check, LayoutGrid, Plus } from "lucide-react";

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
    <section className="space-y-2">
      <div className="home-brick-filter flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
        <button
          type="button"
          className="shrink-0"
          onClick={onSelectAll}
          aria-pressed={isAllSelected}
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
        </button>

        {bricks.map((brick) => {
          const active = selectedBrickIds.includes(brick._id);

          return (
            <button
              key={brick._id}
              type="button"
              className="shrink-0"
              onClick={() => onToggleBrick(brick._id)}
              aria-pressed={active}
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
            </button>
          );
        })}

        <button
          type="button"
          className="shrink-0"
          onClick={onCreateBrick}
          aria-label="Create brick"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-[var(--ui-badge-neutral-border)] bg-[var(--ui-badge-neutral-bg)] text-[var(--ui-badge-neutral-text)]">
            <Plus className="size-4" />
          </span>
        </button>
      </div>
    </section>
  );
}
