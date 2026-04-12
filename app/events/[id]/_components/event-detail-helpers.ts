"use client";

import type { JamMessage } from "@/lib/api";
import { formatIsoTimeByPreference } from "@/lib/time-format";

export function getParticipantDisplayName(participant: {
  name?: string;
  username?: string;
  email?: string;
}) {
  return (
    participant.name || participant.username || participant.email || "User"
  );
}

export function getDisplayNameFromMessage(message: JamMessage) {
  return message.user.name || message.user.username || "User";
}

export function getMessageAvatarUrl(message: JamMessage) {
  return message.user.avatar?.url || message.user.profilePicture;
}

export function getMessageLabel(message: JamMessage) {
  return (
    message.text ||
    message.fileName ||
    (message.messageType === "link" ? "Link" : "Media")
  );
}

export function formatMessageStamp(value: string, use24Hour: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatIsoTimeByPreference(value, use24Hour);
}
