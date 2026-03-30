import { SearchX } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-1)] px-6 text-center">
      <SearchX className="mb-2 size-8 text-[var(--text-muted)]" />
      <h3 className="text-base font-semibold text-[var(--text-strong)]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  );
}


