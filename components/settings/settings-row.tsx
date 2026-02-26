import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function SettingsRowBody({
  icon: Icon,
  label,
  right,
  className,
}: Pick<SettingsRowProps, "icon" | "label" | "right" | "className">) {
  return (
    <div className={cn("settings-row-body flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-4">
        <span className="settings-row-icon-box flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EFF2F7] text-[#2A2F39]">
          <Icon className="size-7" />
        </span>
        <span className="settings-row-label font-poppins truncate text-[20px] leading-[120%] font-medium text-[#2A2E36]">{label}</span>
      </div>

      <div className="settings-row-right flex shrink-0 items-center gap-2 text-[#A3AAB8]">
        {right ?? <ChevronRight className="size-6" />}
      </div>
    </div>
  );
}

export function SettingsRow({ href, onClick, ...props }: SettingsRowProps) {
  if (href) {
    return (
      <Link href={href} className="settings-row block rounded-2xl px-1 py-1 transition hover:bg-[#EDF1F8]">
        <SettingsRowBody {...props} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="settings-row block w-full rounded-2xl px-1 py-1 text-left transition hover:bg-[#EDF1F8]"
    >
      <SettingsRowBody {...props} />
    </button>
  );
}
