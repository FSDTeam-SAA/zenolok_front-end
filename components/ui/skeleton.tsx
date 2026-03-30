import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[var(--surface-3)]", className)}
      {...props}
    />
  );
}

export { Skeleton };
