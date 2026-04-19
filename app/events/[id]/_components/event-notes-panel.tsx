"use client";

import type { ElementType } from "react";
import { Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type EventNotesPanelProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  isSaving?: boolean;
  placeholder?: string;
  label?: string;
  minHeightClassName?: string;
  bare?: boolean;
};

export function EventNotesPanel({
  value,
  onChange,
  onBlur,
  onSubmit,
  isSaving = false,
  placeholder = "Write notes here...",
  label = "Notes",
  minHeightClassName = "min-h-[220px]",
  bare = false,
}: EventNotesPanelProps) {
  const Wrapper: ElementType = bare ? "div" : Card;
  const wrapperClassName = bare
    ? "px-4 pb-3 pt-3"
    : "rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-none";
  const innerClassName = bare
    ? `relative ${minHeightClassName} px-1 pb-1 pt-1`
    : `relative ${minHeightClassName} rounded-[22px] bg-[var(--surface-3)] px-4 pb-4 pt-3`;

  return (
    <Wrapper className={wrapperClassName}>
      <div className={innerClassName}>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onSubmit}
          className="absolute right-0.5 top-3 inline-flex size-8 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-white/55 hover:text-[var(--text-strong)]"
          aria-label={`Save ${label.toLowerCase()}`}
        >
          <Plus className="size-4 stroke-[2.6px]" />
        </button>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="h-9 w-full rounded-none border-none bg-transparent px-1 py-0 pr-10 text-[15px] leading-[22px] text-[var(--text-default)] shadow-none placeholder:text-[var(--text-muted)] focus-visible:ring-0"
        />
      </div>
    </Wrapper>
  );
}
