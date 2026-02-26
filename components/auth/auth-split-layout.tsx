import { cn } from "@/lib/utils";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  side: React.ReactNode;
  reverse?: boolean;
}

export function AuthSplitLayout({ children, side, reverse = false }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
      <div className={cn("relative grid w-full max-w-[1180px] overflow-hidden rounded-[42px] bg-[#F5F7FB] shadow-[0_20px_55px_rgba(25,29,40,0.14)] lg:grid-cols-2", reverse && "lg:[&_.content]:order-2 lg:[&_.side]:order-1")}>
        <div className={cn("content relative z-10 flex min-h-[640px] items-center justify-center px-6 py-10 sm:px-12", reverse && "lg:pr-20")}>{children}</div>
        <div className={cn("side relative flex min-h-[640px] items-center justify-center px-6 py-10 text-center sm:px-12", reverse ? "bg-[#F3F6FB]" : "bg-[#F3F6FB]")}>
          <div className={cn("absolute inset-y-0 w-28 bg-white/45 blur-[1px] lg:w-40", reverse ? "left-0 -skew-x-[14deg]" : "right-0 skew-x-[14deg]")} />
          <div className="relative z-10 max-w-md">{side}</div>
        </div>
      </div>
    </div>
  );
}
