"use client";

import { usePathname } from "next/navigation";

import { AppTopNav } from "@/components/layout/app-top-nav";

const authPrefixes = ["/auth"];

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = authPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <AppTopNav />
      <main className="mx-auto w-full max-w-[1180px] px-3 py-6 sm:px-5">{children}</main>
    </>
  );
}
