import type { AlarmPresetKey, AlarmPresetOption } from "@/lib/api";

const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR;
const MINUTES_IN_WEEK = 7 * MINUTES_IN_DAY;
const MINUTES_IN_MONTH = 30 * MINUTES_IN_DAY;

const BUILTIN_PRESET_DEFAULTS: Record<
  Exclude<AlarmPresetKey, "none" | "custom">,
  number[]
> = {
  preset_1: [
    15,
    30,
    MINUTES_IN_HOUR,
    2 * MINUTES_IN_HOUR,
    6 * MINUTES_IN_HOUR,
    12 * MINUTES_IN_HOUR,
    MINUTES_IN_DAY,
    2 * MINUTES_IN_DAY,
    3 * MINUTES_IN_DAY,
    4 * MINUTES_IN_DAY,
    5 * MINUTES_IN_DAY,
    6 * MINUTES_IN_DAY,
    7 * MINUTES_IN_DAY,
    MINUTES_IN_WEEK,
    2 * MINUTES_IN_WEEK,
    3 * MINUTES_IN_WEEK,
    4 * MINUTES_IN_WEEK,
    MINUTES_IN_MONTH,
  ],
  preset_2: [
    MINUTES_IN_HOUR,
    MINUTES_IN_DAY,
    MINUTES_IN_WEEK,
    MINUTES_IN_MONTH,
  ],
  preset_3: [MINUTES_IN_DAY, MINUTES_IN_WEEK],
};

const LEGACY_BUILTIN_PRESET_DEFAULTS: Partial<
  Record<Exclude<AlarmPresetKey, "none" | "custom">, number[]>
> = {
  preset_1: [10],
  preset_2: [30],
  preset_3: [MINUTES_IN_DAY],
};

function uniqueSortedOffsets(offsetsInMinutes: number[]) {
  return Array.from(
    new Set(
      offsetsInMinutes.filter(
        (offset) => Number.isFinite(offset) && offset >= 1,
      ),
    ),
  ).sort((left, right) => left - right);
}

function arraysMatch(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

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
    label: "High frequency",
    description:
      "Layered reminders from minutes to one month before the event starts.",
    editable: true,
    offsetsInMinutes: BUILTIN_PRESET_DEFAULTS.preset_1,
  },
  {
    key: "preset_2",
    label: "Mid frequency",
    description:
      "A balanced reminder schedule across hour, day, week, and month checkpoints.",
    editable: true,
    offsetsInMinutes: BUILTIN_PRESET_DEFAULTS.preset_2,
  },
  {
    key: "preset_3",
    label: "Low frequency",
    description:
      "Light reminders for tasks that only need a day-before and week-before heads-up.",
    editable: true,
    offsetsInMinutes: BUILTIN_PRESET_DEFAULTS.preset_3,
  },
  {
    key: "custom",
    label: "Custom settings",
    description: "Build your own reminder schedule for this preset.",
    editable: true,
    offsetsInMinutes: [],
  },
];

export type EditableAlarmPresetKey = Exclude<AlarmPresetKey, "none">;
export type AlarmOffsetUnit =
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months";

function normalizePresetOption(option: AlarmPresetOption) {
  return {
    ...option,
    offsetsInMinutes: uniqueSortedOffsets(option.offsetsInMinutes || []),
  };
}

export function resolveAlarmPresetOptions(options?: AlarmPresetOption[] | null) {
  const providedOptions = Array.isArray(options)
    ? options.map(normalizePresetOption)
    : [];

  if (!providedOptions.length) {
    return fallbackAlarmPresetOptions;
  }

  const providedOptionMap = new Map(
    providedOptions.map((option) => [option.key, option]),
  );

  return fallbackAlarmPresetOptions.map((fallbackOption) => {
    const providedOption = providedOptionMap.get(fallbackOption.key);
    if (!providedOption) {
      return fallbackOption;
    }

    if (
      fallbackOption.key === "preset_1" ||
      fallbackOption.key === "preset_2" ||
      fallbackOption.key === "preset_3"
    ) {
      const fallbackOffsets = BUILTIN_PRESET_DEFAULTS[fallbackOption.key];
      const legacyOffsets =
        LEGACY_BUILTIN_PRESET_DEFAULTS[fallbackOption.key] || [];
      const shouldUpgradeToNewDefaults =
        !providedOption.offsetsInMinutes.length ||
        arraysMatch(providedOption.offsetsInMinutes, legacyOffsets);

      return {
        ...providedOption,
        label: fallbackOption.label,
        description: fallbackOption.description,
        editable: fallbackOption.editable,
        offsetsInMinutes: shouldUpgradeToNewDefaults
          ? fallbackOffsets
          : providedOption.offsetsInMinutes,
      };
    }

    return {
      ...providedOption,
      label: fallbackOption.label,
      description: fallbackOption.description,
      editable: fallbackOption.editable,
      offsetsInMinutes: providedOption.offsetsInMinutes,
    };
  });
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
  if (
    offsetInMinutes % MINUTES_IN_MONTH === 0 &&
    offsetInMinutes >= MINUTES_IN_MONTH
  ) {
    const months = offsetInMinutes / MINUTES_IN_MONTH;
    return `${months} month${months === 1 ? "" : "s"} before`;
  }

  if (
    offsetInMinutes % MINUTES_IN_WEEK === 0 &&
    offsetInMinutes >= MINUTES_IN_WEEK
  ) {
    const weeks = offsetInMinutes / MINUTES_IN_WEEK;
    return `${weeks} week${weeks === 1 ? "" : "s"} before`;
  }

  if (offsetInMinutes % MINUTES_IN_DAY === 0) {
    const days = offsetInMinutes / MINUTES_IN_DAY;
    return `${days} day${days === 1 ? "" : "s"} before`;
  }

  if (offsetInMinutes % MINUTES_IN_HOUR === 0) {
    const hours = offsetInMinutes / MINUTES_IN_HOUR;
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

  if (!option.offsetsInMinutes.length) {
    return option.key === "custom" ? "Not configured yet" : "No reminder";
  }

  if (option.offsetsInMinutes.length === 1) {
    return formatAlarmOffset(option.offsetsInMinutes[0]);
  }

  return `${formatAlarmOffset(option.offsetsInMinutes[0])} +${option.offsetsInMinutes.length - 1} more`;
}

export function offsetToEditorValue(offsetInMinutes?: number | null) {
  if (!offsetInMinutes || offsetInMinutes < 1) {
    return { amount: "15", unit: "minutes" as AlarmOffsetUnit };
  }

  if (
    offsetInMinutes % MINUTES_IN_MONTH === 0 &&
    offsetInMinutes >= MINUTES_IN_MONTH
  ) {
    return {
      amount: String(offsetInMinutes / MINUTES_IN_MONTH),
      unit: "months" as AlarmOffsetUnit,
    };
  }

  if (
    offsetInMinutes % MINUTES_IN_WEEK === 0 &&
    offsetInMinutes >= MINUTES_IN_WEEK
  ) {
    return {
      amount: String(offsetInMinutes / MINUTES_IN_WEEK),
      unit: "weeks" as AlarmOffsetUnit,
    };
  }

  if (offsetInMinutes % MINUTES_IN_DAY === 0) {
    return {
      amount: String(offsetInMinutes / MINUTES_IN_DAY),
      unit: "days" as AlarmOffsetUnit,
    };
  }

  if (offsetInMinutes % MINUTES_IN_HOUR === 0) {
    return {
      amount: String(offsetInMinutes / MINUTES_IN_HOUR),
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

  if (unit === "months") {
    return normalizedAmount * MINUTES_IN_MONTH;
  }

  if (unit === "weeks") {
    return normalizedAmount * MINUTES_IN_WEEK;
  }

  if (unit === "days") {
    return normalizedAmount * MINUTES_IN_DAY;
  }

  if (unit === "hours") {
    return normalizedAmount * MINUTES_IN_HOUR;
  }

  return normalizedAmount;
}
