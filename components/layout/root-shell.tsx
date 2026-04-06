"use client";

import { usePathname } from "next/navigation";

import { AppTopNav } from "@/components/layout/app-top-nav";
import { PageTransition } from "@/components/motion/motion-primitives";

const authPrefixes = ["/auth"];

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = authPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isAuthPage) {
    return <PageTransition transitionKey={pathname}>{children}</PageTransition>;
  }

  return (
    <>
      <AppTopNav />
      <PageTransition
        transitionKey={pathname}
        className="app-main mx-auto w-full max-w-[1180px] px-3 py-4 sm:px-5 sm:py-6"
      >
        {children}
      </PageTransition>
    </>
  );
}
