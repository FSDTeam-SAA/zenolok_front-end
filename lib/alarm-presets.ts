import type { AlarmPresetKey, AlarmPresetOption } from "@/lib/api";

export const fallbackAlarmPresetOptions: AlarmPresetOption[] = [
  {
    key: "none",
    label: "No alert",
    description: "Do not send a reminder before this todo starts.",
    editable: false,
    offsetsInMinutes: [],
  },
  {
    key: "preset_1",
    label: "Quick heads-up",
    description: "A short reminder before the scheduled time.",
    editable: true,
    offsetsInMinutes: [10],
  },
  {
    key: "preset_2",
    label: "30-minute reminder",
    description: "A little more lead time before the task begins.",
    editable: true,
    offsetsInMinutes: [30],
  },
  {
    key: "preset_3",
    label: "Day-before reminder",
    description: "Best for tasks that need prep ahead of time.",
    editable: true,
    offsetsInMinutes: [1440],
  },
  {
    key: "custom",
    label: "Custom",
    description: "Set your own reminder timing for this preset.",
    editable: true,
    offsetsInMinutes: [],
  },
];

export type EditableAlarmPresetKey = Exclude<AlarmPresetKey, "none">;
export type AlarmOffsetUnit = "minutes" | "hours" | "days";

export function resolveAlarmPresetOptions(options?: AlarmPresetOption[] | null) {
  return Array.isArray(options) && options.length
    ? options
    : fallbackAlarmPresetOptions;
}

export function getAlarmPresetOption(
  key: AlarmPresetKey,
  options?: AlarmPresetOption[] | null,
) {
  return resolveAlarmPresetOptions(options).find((option) => option.key === key);
}

export function getAlarmPresetLabel(
  key: AlarmPresetKey,
  options?: AlarmPresetOption[] | null,
) {
  return getAlarmPresetOption(key, options)?.label || "Alarm";
}

export function getPrimaryAlarmOffset(
  key: AlarmPresetKey,
  options?: AlarmPresetOption[] | null,
) {
  const option = getAlarmPresetOption(key, options);
  const offset = option?.offsetsInMinutes?.[0];
  return typeof offset === "number" && Number.isFinite(offset) ? offset : null;
}

export function formatAlarmOffset(offsetInMinutes: number) {
  if (offsetInMinutes % 1440 === 0) {
    const days = offsetInMinutes / 1440;
    return `${days} day${days === 1 ? "" : "s"} before`;
  }

  if (offsetInMinutes % 60 === 0) {
    const hours = offsetInMinutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"} before`;
  }

  return `${offsetInMinutes} minute${offsetInMinutes === 1 ? "" : "s"} before`;
}

export function formatAlarmPresetSummary(
  key: AlarmPresetKey,
  options?: AlarmPresetOption[] | null,
) {
  const option = getAlarmPresetOption(key, options);
  if (!option) {
    return "";
  }

  const offset = getPrimaryAlarmOffset(key, options);
  if (offset === null) {
    return option.key === "custom" ? "Not configured yet" : "No reminder";
  }

  return formatAlarmOffset(offset);
}

export function offsetToEditorValue(offsetInMinutes?: number | null) {
  if (!offsetInMinutes || offsetInMinutes < 1) {
    return { amount: "10", unit: "minutes" as AlarmOffsetUnit };
  }

  if (offsetInMinutes % 1440 === 0) {
    return {
      amount: String(offsetInMinutes / 1440),
      unit: "days" as AlarmOffsetUnit,
    };
  }

  if (offsetInMinutes % 60 === 0) {
    return {
      amount: String(offsetInMinutes / 60),
      unit: "hours" as AlarmOffsetUnit,
    };
  }

  return { amount: String(offsetInMinutes), unit: "minutes" as AlarmOffsetUnit };
}

export function editorValueToOffset(amount: string, unit: AlarmOffsetUnit) {
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount)) {
    return null;
  }

  const normalizedAmount = Math.round(parsedAmount);
  if (normalizedAmount < 1) {
    return null;
  }

  if (unit === "days") {
    return normalizedAmount * 1440;
  }

  if (unit === "hours") {
    return normalizedAmount * 60;
  }

  return normalizedAmount;
}
