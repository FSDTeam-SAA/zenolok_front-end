import { CheckCircle2 } from "lucide-react";

import { SectionHeader } from "./section-header";
import type { AlarmPreset } from "./settings-types";

const alarmOptions: Array<{ id: AlarmPreset; label: string }> = [
  { id: "none", label: "No alert" },
  { id: "preset_1", label: "Preset 1" },
  { id: "preset_2", label: "Preset 2" },
  { id: "preset_3", label: "Preset 3" },
];

interface AlarmPresetSectionProps {
  value: AlarmPreset;
  onChange: (preset: AlarmPreset) => void;
}

export function AlarmPresetSection({
  value,
  onChange,
}: AlarmPresetSectionProps) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Alarm preset"
        description="Select your default reminder pattern."
      />

      <div className="w-full settings-action-card rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <div className="space-y-2">
          {alarmOptions.map((item) => {
            const active = value === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-[#31C65B] bg-[color:rgba(49,198,91,0.14)]"
                    : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[color:var(--ring)]"
                }`}
              >
                <span className="font-poppins text-[20px] leading-[120%] font-medium text-[var(--text-default)]">
                  {item.label}
                </span>
                {active ? (
                  <CheckCircle2 className="size-5 text-[#31C65B]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

