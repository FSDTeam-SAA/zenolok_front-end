"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export function SettingsShell({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className="settings-page min-h-screen bg-[#EFF2F8] px-3 py-4 sm:px-6 sm:py-6">
      <section
        className={cn(
          "settings-shell mx-auto max-w-[860px] rounded-[34px] border border-[#E2E6EE] bg-[#F6F8FC] p-4 shadow-[0_20px_60px_rgba(22,28,38,0.14)] sm:p-8",
          className
        )}
      >
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="settings-back font-poppins inline-flex items-center gap-2 text-[20px] leading-[120%] font-medium text-[#4D5566] transition hover:text-[#242936]"
          >
            <ArrowLeft className="size-5" />
            Back
          </button>
          <h1 className="settings-shell-title font-poppins text-[40px] leading-[120%] font-semibold text-[#1E2430]">{title}</h1>
          <div className="w-[58px]" aria-hidden />
        </header>
        {children}
      </section>
    </div>
  );
}
