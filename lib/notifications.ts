import type {
  NotificationCounts,
  NotificationData,
  NotificationListData,
} from "@/lib/api";

type NotificationEventMatchTarget = {
  _id?: string;
  id?: string;
  title?: string;
};

export function isMessageNotification(notification: Pick<NotificationData, "type">) {
  return /(message|chat)/i.test(notification.type ?? "");
}

export function notificationMatchesEvent(
  notification: Pick<NotificationData, "eventId" | "title">,
  event: NotificationEventMatchTarget,
) {
  const eventId = event._id ?? event.id ?? "";
  if (notification.eventId && eventId) {
    return notification.eventId === eventId;
  }

  const eventTitle = (event.title ?? "").trim().toLowerCase();
  if (!eventTitle) {
    return false;
  }

  return notification.title.toLowerCase().includes(eventTitle);
}

export function buildNotificationCounts(items: NotificationData[]): NotificationCounts {
  const messages = items.filter((item) => isMessageNotification(item));
  const system = items.filter((item) => !isMessageNotification(item));
  const unread = items.filter((item) => !item.read);

  return {
    all: {
      total: items.length,
      unread: unread.length,
    },
    messages: {
      total: messages.length,
      unread: messages.filter((item) => !item.read).length,
    },
    system: {
      total: system.length,
      unread: system.filter((item) => !item.read).length,
    },
  };
}

function sortNotificationsByCreatedAt(items: NotificationData[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function upsertNotificationList(
  previous: NotificationListData,
  notification: NotificationData,
) {
  const withoutExisting = previous.items.filter((item) => item._id !== notification._id);
  const items = sortNotificationsByCreatedAt([notification, ...withoutExisting]).slice(0, 200);

  return {
    items,
    counts: buildNotificationCounts(items),
  };
}
