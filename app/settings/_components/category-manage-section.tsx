import { Button } from "@/components/ui/button";

import { SectionHeader } from "./section-header";

interface CategoryManageSectionProps {
  onOpenModal: () => void;
}

export function CategoryManageSection({ onOpenModal }: CategoryManageSectionProps) {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Category Manage"
        description="Manage todo category name, color, and collaborators."
      />

      <div className="w-full settings-action-card rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <p className="font-poppins text-[20px] leading-[120%] font-medium text-[var(--text-default)]">Open Category Manage in a modal.</p>
        <Button
          type="button"
          className="font-poppins mt-4 h-11 rounded-xl px-5 text-[20px] leading-[120%] font-medium"
          onClick={onOpenModal}
        >
          Open Category Manage
        </Button>
      </div>
    </section>
  );
}
