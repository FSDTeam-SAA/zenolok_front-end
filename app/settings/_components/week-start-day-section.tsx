import { Button } from "@/components/ui/button";

import { SectionHeader } from "./section-header";

interface WeekStartDaySectionProps {
  currentWeekStartLabel: string;
  onOpenModal: () => void;
}

export function WeekStartDaySection({
  currentWeekStartLabel,
  onOpenModal,
}: WeekStartDaySectionProps) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Manage Week Start Day"
        description="Choose the first day of your week."
      />

      <div className="w-full settings-action-card rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <p className="font-poppins text-[20px] leading-[120%] font-medium text-[var(--text-default)]">
          Current week starts on: {currentWeekStartLabel}
        </p>
        <Button
          type="button"
          className="font-poppins mt-4 h-11 rounded-xl px-5 !text-[18px] leading-[120%] font-medium"
          onClick={onOpenModal}
        >
          Choose Week Start Day
        </Button>
      </div>
    </section>
  );
}

