import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[#E5E9F2]", className)}
      {...props}
    />
  );
}

export { Skeleton };
