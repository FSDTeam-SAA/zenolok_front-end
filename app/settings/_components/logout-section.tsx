import { Button } from "@/components/ui/button";

import { SectionHeader } from "./section-header";

interface LogoutSectionProps {
  onLogout: () => void;
}

export function LogoutSection({ onLogout }: LogoutSectionProps) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Logout"
        description="End your current session securely."
        titleClassName="text-[30px] text-[var(--text-strong)] sm:text-[36px] lg:text-[36px]"
      />

      <div className="w-full settings-action-card rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <p className="font-poppins text-[20px] leading-[120%] font-medium text-[var(--text-default)]">
          Click the button below to logout from this device.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="font-poppins mt-5 h-10 rounded-xl px-5 text-[18px] leading-[120%] font-medium"
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>
    </section>
  );
}

