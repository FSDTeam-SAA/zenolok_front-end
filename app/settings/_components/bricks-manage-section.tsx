import { BricksManagePanel } from "@/components/settings/bricks-manage-panel";

import { SectionHeader } from "./section-header";

export function BricksManageSection() {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Bricks Manage"
        description="Manage brick name, icon, and color."
      />

      <BricksManagePanel />
    </section>
  );
}
