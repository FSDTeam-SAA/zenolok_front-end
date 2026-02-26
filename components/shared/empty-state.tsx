import { SearchX } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8CFDB] bg-[#F7F9FD] px-6 text-center">
      <SearchX className="mb-2 size-8 text-[#99A2B3]" />
      <h3 className="text-base font-semibold text-[#3A3F49]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#7B8293]">{description}</p>
    </div>
  );
}
