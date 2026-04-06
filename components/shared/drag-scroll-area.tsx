"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type DragScrollAreaProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

type DragState = {
  isPointerDown: boolean;
  isDragging: boolean;
  pointerId: number | null;
  startX: number;
  startScrollLeft: number;
};

const INITIAL_DRAG_STATE: DragState = {
  isPointerDown: false,
  isDragging: false,
  pointerId: null,
  startX: 0,
  startScrollLeft: 0,
};

export function DragScrollArea({
  children,
  className,
  contentClassName,
}: DragScrollAreaProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef<DragState>(INITIAL_DRAG_STATE);
  const suppressClickRef = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const finishDrag = React.useCallback((pointerId?: number) => {
    const container = containerRef.current;
    if (
      container &&
      typeof pointerId === "number" &&
      container.hasPointerCapture(pointerId)
    ) {
      container.releasePointerCapture(pointerId);
    }

    dragStateRef.current = INITIAL_DRAG_STATE;
    setIsDragging(false);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    const container = containerRef.current;
    if (!container || container.scrollWidth <= container.clientWidth) {
      return;
    }

    suppressClickRef.current = false;
    dragStateRef.current = {
      isPointerDown: true,
      isDragging: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
    };

    container.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const dragState = dragStateRef.current;

    if (!container || !dragState.isPointerDown) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;

    if (!dragState.isDragging && Math.abs(deltaX) > 4) {
      dragState.isDragging = true;
      setIsDragging(true);
    }

    if (!dragState.isDragging) {
      return;
    }

    container.scrollLeft = dragState.startScrollLeft - deltaX;
    event.preventDefault();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const wasDragging = dragStateRef.current.isDragging;
    suppressClickRef.current = wasDragging;
    finishDrag(event.pointerId);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(event.pointerId);
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) {
      return;
    }

    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  React.useEffect(() => {
    return () => {
      finishDrag(dragStateRef.current.pointerId ?? undefined);
    };
  }, [finishDrag]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "drag-scrollbar-hidden overflow-x-auto overscroll-x-contain select-none",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={() => finishDrag(dragStateRef.current.pointerId ?? undefined)}
      onClickCapture={handleClickCapture}
    >
      <div
        className={cn(
          "flex w-max min-w-full items-center gap-2 whitespace-nowrap",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
