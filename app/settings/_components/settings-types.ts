import {
  BadgeCheck,
  Bell,
  BellPlus,
  CalendarDays,
  CircleUserRound,
  Clock3,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Moon,
  Tags,
  type LucideIcon,
} from "lucide-react";

export type SettingsSection =
  | "profile"
  | "password"
  | "bricksManage"
  | "categoryManage"
  | "weekStartDay"
  | "switchTimeFormat"
  | "alarmPreset"
  | "darkMode"
  | "notificationsReminders"
  | "calendar"
  | "feedback"
  | "logout";

export type AlarmPreset = "none" | "preset_1" | "preset_2" | "preset_3" | "custom";
export type NotificationKey = "anyMessages" | "taggedMessages" | "eventsAlarm" | "todosAlarm";

export interface SidebarSection {
  id: SettingsSection;
  label: string;
  icon: LucideIcon;
  support?: boolean;
}

export const sections: SidebarSection[] = [
  { id: "bricksManage", label: "Bricks Manage", icon: BadgeCheck },
  { id: "categoryManage", label: "Category Manage", icon: Tags },
  { id: "weekStartDay", label: "Manage weeks start day", icon: Bell },
  { id: "switchTimeFormat", label: "Switch time format", icon: Clock3 },
  { id: "alarmPreset", label: "Alarm preset", icon: Bell },
  { id: "darkMode", label: "Dark Mode", icon: Moon },
  { id: "notificationsReminders", label: "Notifications & Reminders", icon: BellPlus },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: CircleUserRound },
  { id: "password", label: "Change Password", icon: LockKeyhole },
  { id: "feedback", label: "Feedback", icon: MessageSquare, support: true },
  { id: "logout", label: "Logout", icon: LogOut, support: true },
];

export function isSettingsSection(value: string): value is SettingsSection {
  return sections.some((section) => section.id === value);
}
