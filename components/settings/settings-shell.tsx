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
    <div className="settings-page min-h-screen bg-[var(--surface-0)] px-3 py-4 sm:px-6 sm:py-6">
      <section
        className={cn(
          "settings-shell mx-auto max-w-[860px] rounded-[34px] border border-[var(--border)] bg-[var(--surface-1)] p-4 shadow-[var(--ui-card-shadow)] sm:p-8",
          className
        )}
      >
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="settings-back font-poppins inline-flex items-center gap-2 text-[20px] leading-[120%] font-medium text-[var(--text-default)] transition hover:text-[var(--text-strong)]"
          >
            <ArrowLeft className="size-5" />
            Back
          </button>
          <h1 className="settings-shell-title font-poppins text-[40px] leading-[120%] font-semibold text-[var(--text-strong)]">{title}</h1>
          <div className="w-[58px]" aria-hidden />
        </header>
        {children}
      </section>
    </div>
  );
}
