"use client";

import { io, type Socket } from "socket.io-client";

let sharedSocket: Socket | null = null;
let resolvedSocketUrl = "";

export function getSocketServerUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTPUBLICBASEURL ||
    ""
  ).replace(/\/+$/, "");
}

export function getSharedSocket() {
  const socketServerUrl = getSocketServerUrl();
  if (!socketServerUrl) {
    return null;
  }

  if (sharedSocket && resolvedSocketUrl === socketServerUrl) {
    return sharedSocket;
  }

  if (sharedSocket) {
    sharedSocket.disconnect();
  }

  sharedSocket = io(socketServerUrl, {
    transports: ["websocket", "polling"],
  });
  resolvedSocketUrl = socketServerUrl;

  return sharedSocket;
}
