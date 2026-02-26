import { brickIconMap } from "@/lib/brick-icons";

export function BrickIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = brickIconMap[name?.toLowerCase() ?? ""] || brickIconMap.default;

  return <Icon className={className} aria-hidden="true" />;
}
