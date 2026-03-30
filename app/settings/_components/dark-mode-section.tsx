import { Switch } from "@/components/ui/switch";

import { SectionHeader } from "./section-header";

interface DarkModeSectionProps {
  darkMode: boolean;
  onToggle: (value: boolean) => void;
}

export function DarkModeSection({ darkMode, onToggle }: DarkModeSectionProps) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Dark Mode"
        description="Toggle dark mode preference."
      />

      <div className="settings-darkmode-card w-full settings-action-card rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="settings-darkmode-title font-poppins text-[24px] leading-[120%] font-semibold text-[var(--text-strong)]">
              Enable dark mode
            </p>
            <p className="settings-darkmode-status font-poppins mt-1 text-[16px] leading-[120%] font-normal text-[var(--text-muted)]">
              {darkMode ? "Enabled" : "Disabled"}
            </p>
          </div>
          <Switch checked={darkMode} onCheckedChange={onToggle} />
        </div>
      </div>
    </section>
  );
}

