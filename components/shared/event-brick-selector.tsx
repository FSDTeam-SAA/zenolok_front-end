"use client";

import { Plus } from "lucide-react";

import { BrickIcon } from "@/components/shared/brick-icon";
import { Badge } from "@/components/ui/badge";
import type { Brick } from "@/lib/api";
import { NO_BRICK_EVENT_COLOR } from "@/lib/event-colors";
import { cn } from "@/lib/utils";

type EventBrickSelectorProps = {
  bricks: Brick[];
  selectedBrickId?: string;
  onSelectBrick: (brickId: string) => void;
  allowNoBrick?: boolean;
  noBrickLabel?: string;
  onCreateBrick?: () => void;
  className?: string;
  badgeClassName?: string;
};

export function EventBrickSelector({
  bricks,
  selectedBrickId = "",
  onSelectBrick,
  allowNoBrick = false,
  noBrickLabel = "No brick",
  onCreateBrick,
  className,
  badgeClassName,
}: EventBrickSelectorProps) {
  const noBrickActive = selectedBrickId === "";

  return (
    <div className={cn("overflow-x-auto pb-1", className)}>
      <div className="flex w-max min-w-full items-center gap-2 whitespace-nowrap">
        {allowNoBrick ? (
          <button
            type="button"
            className="shrink-0"
            onClick={() => onSelectBrick("")}
            aria-pressed={noBrickActive}
          >
            <Badge
              variant="neutral"
              style={
                noBrickActive
                  ? {
                      backgroundColor: NO_BRICK_EVENT_COLOR,
                      color: "white",
                      borderColor: NO_BRICK_EVENT_COLOR,
                    }
                  : {
                      backgroundColor: "var(--ui-badge-neutral-bg)",
                      color: NO_BRICK_EVENT_COLOR,
                      borderColor: NO_BRICK_EVENT_COLOR,
                      opacity: 0.82,
                    }
              }
              className={cn("rounded-full px-4 py-1 shadow-sm transition", badgeClassName)}
            >
              {noBrickLabel}
            </Badge>
          </button>
        ) : null}
        {bricks.map((brick) => {
          const active = selectedBrickId === brick._id;

          return (
            <button
              key={brick._id}
              type="button"
              className="shrink-0"
              onClick={() => onSelectBrick(brick._id)}
              aria-pressed={active}
            >
              <Badge
                variant="neutral"
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
                className={cn("rounded-full px-4 py-1 shadow-sm transition", badgeClassName)}
              >
                <BrickIcon name={brick.icon} className="size-4" />
                {brick.name}
              </Badge>
            </button>
          );
        })}
        {onCreateBrick ? (
          <button
            type="button"
            className="shrink-0"
            onClick={onCreateBrick}
            aria-label="Create brick"
          >
            <Badge
              variant="neutral"
              className={cn(
                "rounded-full px-4 py-1 shadow-sm transition",
                badgeClassName,
              )}
              style={{
                backgroundColor: "var(--ui-badge-neutral-bg)",
                color: "var(--ui-badge-neutral-text)",
                borderColor: "var(--ui-badge-neutral-border)",
              }}
            >
              <Plus className="size-4" />
              Create brick
            </Badge>
          </button>
        ) : null}
      </div>
    </div>
  );
}
