import { WeekStartDayPanel } from "@/components/settings/week-start-day-panel";
import type { WeekStartDay } from "@/lib/settings";

import { SectionHeader } from "./section-header";

interface WeekStartDaySectionProps {
  currentWeekStartLabel: string;
  selectedDay: WeekStartDay;
  onSelect: (day: WeekStartDay) => void;
}

export function WeekStartDaySection({
  currentWeekStartLabel,
  selectedDay,
  onSelect,
}: WeekStartDaySectionProps) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Manage Week Start Day"
        description={`Choose the first day of your week. Currently: ${currentWeekStartLabel}.`}
      />

      <WeekStartDayPanel selectedDay={selectedDay} onSelect={onSelect} />
    </section>
  );
}
