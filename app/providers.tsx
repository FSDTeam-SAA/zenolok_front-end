"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import { AppMotionProvider } from "@/components/motion/motion-primitives";
import { AppStateProvider, useAppState } from "@/components/providers/app-state-provider";
import { createQueryClient } from "@/lib/query-client";

function AppToaster() {
  const { preferences } = useAppState();

  return (
    <Toaster
      position="top-right"
      richColors
      theme={preferences.darkMode ? "dark" : "light"}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <SessionProvider>
      <AppMotionProvider>
        <AppStateProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <AppToaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </AppStateProvider>
      </AppMotionProvider>
    </SessionProvider>
  );
}
