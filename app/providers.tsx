"use client";

import * as React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import { AppMotionProvider } from "@/components/motion/motion-primitives";
import { AppStateProvider, useAppState } from "@/components/providers/app-state-provider";
import type { NotificationData, NotificationListData } from "@/lib/api";
import { upsertNotificationList } from "@/lib/notifications";
import { queryKeys } from "@/lib/query-keys";
import { createQueryClient } from "@/lib/query-client";
import { getSharedSocket } from "@/lib/socket";

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

function RealtimeNotificationsBridge() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?._id || session?._id || "";

  React.useEffect(() => {
    if (status !== "authenticated" || !userId) {
      return;
    }

    const socket = getSharedSocket();
    if (!socket) {
      return;
    }

    const joinUserRoom = () => {
      socket.emit("joinChatRoom", userId);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    };

    const leaveUserRoom = () => {
      socket.emit("leaveChatRoom", userId);
    };

    const handleNotificationCreated = (notification: NotificationData) => {
      let hasCachedNotifications = false;

      queryClient.setQueryData<NotificationListData>(
        queryKeys.notifications,
        (previous) => {
          if (!previous) {
            return previous;
          }

          hasCachedNotifications = true;
          return upsertNotificationList(previous, notification);
        },
      );

      if (!hasCachedNotifications) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      }
    };

    socket.on("connect", joinUserRoom);
    socket.on("notificationCreated", handleNotificationCreated);

    if (socket.connected) {
      joinUserRoom();
    }

    return () => {
      socket.off("connect", joinUserRoom);
      socket.off("notificationCreated", handleNotificationCreated);
      leaveUserRoom();
    };
  }, [queryClient, status, userId]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <SessionProvider>
      <AppMotionProvider>
        <AppStateProvider>
          <QueryClientProvider client={queryClient}>
            <RealtimeNotificationsBridge />
            {children}
            <AppToaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </AppStateProvider>
      </AppMotionProvider>
    </SessionProvider>
  );
}
