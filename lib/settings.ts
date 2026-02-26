export type WeekStartDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface AppPreferences {
  weekStartDay: WeekStartDay;
  darkMode: boolean;
  use24Hour: boolean;
}

export const preferencesStorageKey = "zenolok.preferences";

export const defaultPreferences: AppPreferences = {
  weekStartDay: "monday",
  darkMode: false,
  use24Hour: false,
};

export const weekStartDayOptions: Array<{ key: WeekStartDay; letter: string; label: string }> = [
  { key: "monday", letter: "M", label: "Monday" },
  { key: "tuesday", letter: "T", label: "Tuesday" },
  { key: "wednesday", letter: "W", label: "Wednesday" },
  { key: "thursday", letter: "T", label: "Thursday" },
  { key: "friday", letter: "F", label: "Friday" },
  { key: "saturday", letter: "S", label: "Saturday" },
  { key: "sunday", letter: "S", label: "Sunday" },
];

export function readPreferences(): AppPreferences {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  const raw = localStorage.getItem(preferencesStorageKey);
  if (!raw) {
    return defaultPreferences;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    return {
      weekStartDay: parsed.weekStartDay || defaultPreferences.weekStartDay,
      darkMode: Boolean(parsed.darkMode),
      use24Hour: Boolean(parsed.use24Hour),
    };
  } catch {
    return defaultPreferences;
  }
}

export function writePreferences(next: AppPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(preferencesStorageKey, JSON.stringify(next));
}

export function applyThemePreference(darkMode: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.body.classList.toggle("theme-dark", darkMode);
}
