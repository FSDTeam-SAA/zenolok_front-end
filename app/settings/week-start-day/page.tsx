"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

import { SettingsShell } from "@/components/settings/settings-shell";
import {
  defaultPreferences,
  readPreferences,
  weekStartDayOptions,
  writePreferences,
  type WeekStartDay,
} from "@/lib/settings";

export default function WeekStartDayPage() {
  const [selected, setSelected] = React.useState<WeekStartDay>(defaultPreferences.weekStartDay);

  React.useEffect(() => {
    const saved = readPreferences();
    setSelected(saved.weekStartDay);
  }, []);

  const handleSelect = (day: WeekStartDay) => {
    setSelected(day);
    const saved = readPreferences();
    writePreferences({ ...saved, weekStartDay: day });
  };

  return (
    <SettingsShell title="Week Start Day">
      <p className="settings-week-subtitle font-poppins mb-5 text-[20px] leading-[120%] font-normal text-[#757D8D]">
        Choose the first day of the week
      </p>
      <div className="space-y-3">
        {weekStartDayOptions.map((day) => {
          const active = selected === day.key;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => handleSelect(day.key)}
              className={`settings-week-item flex w-full items-center justify-between rounded-3xl border px-4 py-4 transition ${
                active ? "border-[#4695FF] bg-[#E8F2FF]" : "border-[#D9DEE8] bg-white hover:border-[#BFC7D8]"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`settings-week-letter font-poppins flex size-14 items-center justify-center rounded-2xl text-[34px] leading-[120%] font-medium ${
                    active ? "bg-[#D8E9FF] text-[#2A76DF]" : "bg-[#EFF1F5] text-[#2B303A]"
                  }`}
                >
                  {day.letter}
                </span>
                <span className={`settings-week-label font-poppins text-[40px] leading-[120%] ${active ? "font-semibold text-[#2A76DF]" : "font-medium text-[#2E3340]"}`}>
                  {day.label}
                </span>
              </div>

              {active ? <CheckCircle2 className="size-8 text-[#2E7BF0]" /> : null}
            </button>
          );
        })}
      </div>
    </SettingsShell>
  );
}
