import { CategoryManagePanel } from "@/components/settings/category-manage-panel";

import { SectionHeader } from "./section-header";

export function CategoryManageSection() {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Category Manage"
        description="Manage todo category name, color, and collaborators."
      />

      <CategoryManagePanel />
    </section>
  );
}
