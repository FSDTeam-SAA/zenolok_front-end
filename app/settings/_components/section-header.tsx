import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description: string;
  titleClassName?: string;
}

export function SectionHeader({ title, description, titleClassName }: SectionHeaderProps) {
  return (
    <div>
      <h2
        className={cn(
          "settings-section-title font-poppins mb-2 !text-[24px] leading-[120%] font-semibold text-[var(--text-strong)]",
          titleClassName,
        )}
      >
        {title}
      </h2>
      <p className="font-poppins mt-1 text-[16px] leading-[120%] font-normal text-[var(--text-muted)]">{description}</p>
    </div>
  );
}
