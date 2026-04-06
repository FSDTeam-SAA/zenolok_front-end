"use client";

import * as React from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Delete } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useAppState } from "@/components/providers/app-state-provider";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type DateRangeValue = {
  startDate: string;
  endDate: string;
};

type DateRangePopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate: string;
  endDate: string;
  onApply: (value: DateRangeValue) => void;
};

type TimeRangeValue = {
  startTime: string;
  endTime: string;
};

type TimeRangePopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startTime: string;
  endTime: string;
  onApply: (value: TimeRangeValue) => void;
  selectionMode?: "range" | "single";
};

function parseDateValue(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function toDateValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toTimeDigits(value: string) {
  return value.replace(":", "").replace(/\D/g, "").slice(0, 4);
}

function toTimeValue(digits: string) {
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function isValidTimeDigits(digits: string) {
  if (digits.length !== 4) {
    return false;
  }

  const hour = Number(digits.slice(0, 2));
  const minute = Number(digits.slice(2, 4));
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function isValidPartialTimeDigits(digits: string) {
  if (!/^\d{0,4}$/.test(digits)) {
    return false;
  }

  if (digits.length >= 2) {
    const hour = Number(digits.slice(0, 2));
    if (hour > 23) {
      return false;
    }
  } else if (digits.length === 1 && Number(digits[0]) > 2) {
    return false;
  }

  if (digits.length >= 3 && Number(digits[2]) > 5) {
    return false;
  }

  if (digits.length === 4) {
    const minute = Number(digits.slice(2, 4));
    if (minute > 59) {
      return false;
    }
  }

  return true;
}

function addMinutesToDigits(digits: string, deltaMinutes: number) {
  const safeDigits = isValidTimeDigits(digits) ? digits : "0000";
  const hour = Number(safeDigits.slice(0, 2));
  const minute = Number(safeDigits.slice(2, 4));
  const baseMinutes = hour * 60 + minute;
  const normalizedMinutes = (baseMinutes + deltaMinutes + 1440) % 1440;
  const nextHour = Math.floor(normalizedMinutes / 60);
  const nextMinute = normalizedMinutes % 60;

  return `${String(nextHour).padStart(2, "0")}${String(nextMinute).padStart(2, "0")}`;
}

function DayPill({
  day,
  inCurrentMonth,
  isStart,
  isEnd,
  isRangeStart,
  isRangeEnd,
  inRange,
  onClick,
}: {
  day: Date;
  inCurrentMonth: boolean;
  isStart: boolean;
  isEnd: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  inRange: boolean;
  onClick: () => void;
}) {
  const isSunday = inCurrentMonth && day.getDay() === 0;
  let className =
    "flex h-9 items-center justify-center text-[17px] leading-none transition-colors";

  if (isRangeStart) {
    className += " w-full rounded-l-full rounded-r-none bg-[var(--ui-calendar-range-bg)] text-white";
  } else if (isRangeEnd) {
    className += " w-full rounded-r-full rounded-l-none bg-[var(--ui-calendar-range-bg)] text-white";
  } else if (inRange) {
    className += " w-full rounded-none bg-[var(--ui-calendar-range-bg)] text-white";
  } else if (isStart || isEnd) {
    className += " mx-auto size-9 rounded-full bg-[var(--ui-calendar-range-bg)] text-white";
  } else if (isSunday) {
    className += " mx-auto size-9 rounded-full bg-[var(--ui-calendar-accent)] text-white hover:bg-[var(--ui-calendar-accent-hover)]";
  } else if (inCurrentMonth) {
    className += " mx-auto size-9 rounded-full bg-[var(--ui-calendar-neutral-bg)] text-white hover:bg-[var(--ui-calendar-neutral-hover)]";
  } else {
    className += " mx-auto size-9 rounded-full bg-[var(--ui-calendar-outside-bg)] text-[var(--ui-calendar-outside-text)]";
  }

  return (
    <motion.button type="button" onClick={onClick} className={className} whileTap={{ scale: 0.95 }}>
      {format(day, "d")}
    </motion.button>
  );
}

function TimeDigitSlots({
  label,
  digits,
  active,
  onClick,
}: {
  label: string;
  digits: string;
  active: boolean;
  onClick: () => void;
}) {
  const chars = [digits[0] || "", digits[1] || "", digits[2] || "", digits[3] || ""];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-2 py-2 text-left ${
        active
          ? "border-[var(--ui-calendar-accent)] bg-[var(--ui-calendar-popup-slot-active-bg)]"
          : "border-[var(--ui-calendar-popup-input-border)] bg-[var(--ui-calendar-popup-slot-bg)]"
      }`}
      whileTap={{ scale: 0.98 }}
    >
      <p
        className={`text-[11px] leading-none ${
          active ? "text-[var(--ui-calendar-accent)]" : "text-[var(--ui-calendar-popup-muted)]"
        }`}
      >
        {label}
      </p>
      <div className="mt-1 flex items-center gap-1">
        {chars.map((char, index) => (
          <React.Fragment key={`${label}-${index}`}>
            <span
              className={`inline-flex size-6 items-center justify-center rounded-full text-[12px] leading-none ${
                char ? "bg-[var(--ui-calendar-accent)] text-white" : "bg-[var(--ui-calendar-keypad-empty)] text-white"
              }`}
            >
              {char || "-"}
            </span>
            {index === 1 ? (
              <span className="inline-flex w-2 items-center justify-center text-[14px] leading-none text-[var(--ui-calendar-popup-subtle)]">
                :
              </span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </motion.button>
  );
}

function PopupTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.p
      className="font-poppins inline-flex items-center gap-2 text-[18px] leading-[120%] font-medium text-[var(--ui-calendar-popup-title)]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <Icon className="size-4" />
      {children}
    </motion.p>
  );
}

export function EventDateRangePopup({
  open,
  onOpenChange,
  startDate,
  endDate,
  onApply,
}: DateRangePopupProps) {
  const minYear = 1900;
  const maxYear = 2100;
  const [draftStart, setDraftStart] = React.useState<Date | null>(null);
  const [draftEnd, setDraftEnd] = React.useState<Date | null>(null);
  const [cursorMonth, setCursorMonth] = React.useState(startOfMonth(new Date()));
  const [view, setView] = React.useState<"month" | "day">("month");
  const [yearSearch, setYearSearch] = React.useState("");
  const activeYearRef = React.useRef<HTMLDivElement | null>(null);
  const yearsScrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const parsedStart = parseDateValue(startDate);
    const parsedEnd = parseDateValue(endDate);
    const today = startOfDay(new Date());
    const normalizedStart = parsedStart || parsedEnd || today;
    const normalizedEnd = parsedEnd || parsedStart || normalizedStart;

    setDraftStart(normalizedStart);
    setDraftEnd(normalizedEnd);
    setCursorMonth(startOfMonth(normalizedStart));
    setView("day");
    setYearSearch("");
  }, [open, startDate, endDate]);

  const monthStart = startOfMonth(cursorMonth);
  const monthEnd = endOfMonth(cursorMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const years = React.useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index),
    [maxYear, minYear],
  );
  const filteredYears = React.useMemo(() => {
    const query = yearSearch.trim();
    if (!query) {
      return years;
    }

    return years.filter((year) => year.toString().includes(query));
  }, [yearSearch, years]);
  const scrollTargetYear = React.useMemo(() => {
    const cursorYear = cursorMonth.getFullYear();

    if (filteredYears.includes(cursorYear)) {
      return cursorYear;
    }

    return filteredYears[0] ?? null;
  }, [filteredYears, cursorMonth]);

  const scrollToActiveYear = React.useCallback(() => {
    const scroller = yearsScrollRef.current;
    const target = activeYearRef.current;
    if (!scroller || !target || scroller.clientHeight === 0) {
      return false;
    }

    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTopInScroller = targetRect.top - scrollerRect.top + scroller.scrollTop;
    const centeredScrollTop =
      targetTopInScroller - scroller.clientHeight / 2 + targetRect.height / 2;

    scroller.scrollTop = Math.max(0, centeredScrollTop);
    return true;
  }, []);

  React.useEffect(() => {
    if (!open || view !== "month" || scrollTargetYear === null) {
      return;
    }

    let cancelled = false;
    let attempt = 0;
    let frameId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tryScroll = () => {
      if (cancelled) {
        return;
      }

      if (scrollToActiveYear()) {
        return;
      }

      attempt += 1;
      if (attempt >= 8) {
        return;
      }

      timeoutId = setTimeout(() => {
        frameId = window.requestAnimationFrame(tryScroll);
      }, 40);
    };

    frameId = window.requestAnimationFrame(tryScroll);

    return () => {
      cancelled = true;
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [open, view, scrollTargetYear, filteredYears.length, scrollToActiveYear]);

  const handleDaySelect = (day: Date) => {
    if (!draftStart || draftEnd) {
      setDraftStart(day);
      setDraftEnd(null);
      return;
    }

    if (isBefore(day, draftStart)) {
      setDraftStart(day);
      return;
    }

    setDraftEnd(day);
  };

  const canApply = Boolean(draftStart);

  const applySelection = () => {
    if (!draftStart) {
      return;
    }

    const normalizedEnd = draftEnd || draftStart;
    onApply({
      startDate: toDateValue(draftStart),
      endDate: toDateValue(normalizedEnd),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="max-w-[380px] rounded-[26px] border-[var(--ui-calendar-popup-border)] bg-[var(--ui-calendar-popup-bg)] p-4 text-[var(--ui-calendar-popup-strong)]"
      >
        <div className="space-y-3">
          <PopupTitle icon={CalendarDays}>Choose a date</PopupTitle>

          <div className="rounded-[22px] bg-[var(--ui-calendar-popup-panel-bg)] p-3">
            <AnimatePresence mode="wait" initial={false}>
              {view === "month" ? (
                <motion.div
                  key="month"
                  className="space-y-3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    value={yearSearch}
                    onChange={(event) =>
                      setYearSearch(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="Search year (e.g. 2026)"
                    className="h-9 w-full rounded-xl border border-[var(--ui-calendar-popup-input-border)] bg-[var(--ui-calendar-popup-input-bg)] px-3 text-[14px] text-[var(--ui-calendar-popup-strong)] placeholder:text-[var(--ui-calendar-popup-subtle)] focus:border-[var(--ui-calendar-popup-input-border)] focus:outline-none"
                  />
                  <div ref={yearsScrollRef} className="max-h-[312px] space-y-4 overflow-y-auto pr-1">
                    {filteredYears.map((year) => (
                      <div key={year} ref={year === scrollTargetYear ? activeYearRef : null}>
                        <p className="mb-2 text-[30px] leading-none font-medium text-[var(--ui-calendar-popup-year)]">{year}</p>
                        <div className="grid grid-cols-6 gap-2">
                          {Array.from({ length: 12 }, (_, index) => {
                            const monthDate = new Date(year, index, 1);
                            const active =
                              cursorMonth.getFullYear() === year && cursorMonth.getMonth() === index;

                            return (
                              <motion.button
                                key={`${year}-${index}`}
                                type="button"
                                onClick={() => {
                                  setCursorMonth(monthDate);
                                  setView("day");
                                }}
                                className={`flex size-10 items-center justify-center rounded-full text-[20px] leading-none text-white ${
                                  active
                                    ? "bg-[var(--ui-calendar-accent)]"
                                    : "bg-[var(--ui-calendar-neutral-bg)] hover:bg-[var(--ui-calendar-neutral-hover)]"
                                }`}
                                whileTap={{ scale: 0.95 }}
                              >
                                {index + 1}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!filteredYears.length ? (
                      <p className="py-4 text-center text-[13px] text-[var(--text-muted)]">
                        No year found
                      </p>
                    ) : null}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="day"
                  className="space-y-3"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <motion.button
                        type="button"
                        onClick={() => setCursorMonth(addDays(monthStart, -1))}
                        className="rounded-full p-1 text-[var(--ui-calendar-popup-nav)] transition hover:bg-[var(--ui-calendar-popup-input-bg)] hover:text-[var(--ui-calendar-popup-strong)]"
                        aria-label="Previous month"
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronLeft className="size-4" />
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setView("month")}
                        className="text-[24px] leading-none font-medium text-[var(--ui-calendar-popup-strong)]"
                        whileTap={{ scale: 0.98 }}
                      >
                        {format(cursorMonth, "MMMM")}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setCursorMonth(addDays(monthEnd, 1))}
                        className="rounded-full p-1 text-[var(--ui-calendar-popup-nav)] transition hover:bg-[var(--ui-calendar-popup-input-bg)] hover:text-[var(--ui-calendar-popup-strong)]"
                        aria-label="Next month"
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronRight className="size-4" />
                      </motion.button>
                    </div>

                    <motion.button
                      type="button"
                      disabled={!canApply}
                      onClick={applySelection}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[16px] text-[var(--ui-calendar-popup-subtle)] transition hover:text-[var(--ui-calendar-popup-strong)] disabled:opacity-40"
                      whileTap={{ scale: 0.97 }}
                    >
                      Done
                      <ChevronRight className="size-4" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 px-0.5">
                    {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
                      <p
                        key={`${label}-${index}`}
                        className={`text-center text-[11px] leading-none ${
                          index === 0 ? "text-[var(--ui-calendar-accent)]" : "text-[var(--ui-calendar-popup-weekday)]"
                        }`}
                      >
                        {label}
                      </p>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-x-0 gap-y-2">
                    {days.map((day) => {
                      const hasRange = Boolean(draftStart && draftEnd && !isSameDay(draftStart, draftEnd));
                      const isStart = Boolean(draftStart && isSameDay(day, draftStart));
                      const isEnd = Boolean(draftEnd && isSameDay(day, draftEnd));
                      const inRange = Boolean(
                        draftStart &&
                          draftEnd &&
                          isAfter(day, draftStart) &&
                          isBefore(day, draftEnd),
                      );

                      return (
                        <DayPill
                          key={format(day, "yyyy-MM-dd")}
                          day={day}
                          inCurrentMonth={isSameMonth(day, cursorMonth)}
                          isStart={isStart}
                          isEnd={isEnd}
                          isRangeStart={hasRange && isStart}
                          isRangeEnd={hasRange && isEnd}
                          inRange={inRange}
                          onClick={() => handleDaySelect(day)}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {view === "month" ? (
            <div className="flex items-center justify-end">
              <motion.button
                type="button"
                onClick={() => setView("day")}
                className="rounded-full px-3 py-1 text-[12px] text-[var(--ui-calendar-popup-subtle)] transition hover:bg-[var(--ui-calendar-popup-panel-bg)] hover:text-[var(--ui-calendar-popup-strong)]"
                whileTap={{ scale: 0.97 }}
              >
                Back
              </motion.button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EventTimeRangePopup({
  open,
  onOpenChange,
  startTime,
  endTime,
  onApply,
  selectionMode = "range",
}: TimeRangePopupProps) {
  const { preferences } = useAppState();
  const [draftStartDigits, setDraftStartDigits] = React.useState("");
  const [draftEndDigits, setDraftEndDigits] = React.useState("");
  const [activeField, setActiveField] = React.useState<"start" | "end">("start");
  const isSingleMode = selectionMode === "single";

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setDraftStartDigits(toTimeDigits(startTime));
    setDraftEndDigits(toTimeDigits(isSingleMode ? startTime || endTime : endTime));
    setActiveField("start");
  }, [open, startTime, endTime, isSingleMode]);

  const updateActive = (next: (prev: string) => string) => {
    if (activeField === "start") {
      setDraftStartDigits((prev) => next(prev));
      return;
    }

    setDraftEndDigits((prev) => next(prev));
  };

  const handleDigit = (digit: string) => {
    updateActive((prev) => {
      if (prev.length >= 4) {
        return prev;
      }

      const next = `${prev}${digit}`;
      if (!isValidPartialTimeDigits(next)) {
        return prev;
      }

      if (next.length === 4 && activeField === "start" && !isSingleMode) {
        setActiveField("end");
      }

      return next;
    });
  };

  const handleBackspace = () => {
    updateActive((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    updateActive(() => "");
  };

  const handleAdjustActiveByMinutes = (deltaMinutes: number) => {
    updateActive((prev) => addMinutesToDigits(prev, deltaMinutes));
  };

  const canApply =
    isValidTimeDigits(draftStartDigits) &&
    (isSingleMode || isValidTimeDigits(draftEndDigits));
  const formatLabel = preferences.use24Hour ? "24-hour format" : "12-hour format";
  const keypadDigits = [7, 8, 9, 4, 5, 6, 1, 2, 3];
  const shortcuts = [
    { label: "+1h", value: 60 },
    { label: "+15", value: 15 },
    { label: "-1h", value: -60 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="max-w-[380px] rounded-[26px] border-[var(--ui-calendar-popup-border)] bg-[var(--ui-calendar-popup-bg)] p-4 text-[var(--ui-calendar-popup-strong)]"
      >
        <div className="space-y-3">
          <PopupTitle icon={Clock3}>Set time</PopupTitle>

          <div className="space-y-3 rounded-[22px] bg-[var(--ui-calendar-popup-panel-bg)] p-3">
            <div className={`grid gap-2 ${isSingleMode ? "grid-cols-1" : "grid-cols-2"}`}>
              <TimeDigitSlots
                label="Start Time"
                digits={draftStartDigits}
                active={activeField === "start"}
                onClick={() => setActiveField("start")}
              />
              {!isSingleMode ? (
                <TimeDigitSlots
                  label="End Time"
                  digits={draftEndDigits}
                  active={activeField === "end"}
                  onClick={() => setActiveField("end")}
                />
              ) : null}
            </div>

            <div className="flex items-center gap-3 px-1">
              <span className="h-px flex-1 bg-[var(--ui-calendar-popup-input-border)]" />
              <p className="text-[12px] font-medium text-[var(--ui-calendar-popup-subtle)]">
                {formatLabel}
              </p>
              <span className="h-px flex-1 bg-[var(--ui-calendar-popup-input-border)]" />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_56px] gap-3">
              <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                {keypadDigits.map((digit) => (
                  <motion.button
                    key={digit}
                    type="button"
                    onClick={() => handleDigit(String(digit))}
                    className="flex h-11 items-center justify-center rounded-full text-[22px] font-medium leading-none text-[var(--ui-calendar-popup-strong)] transition hover:bg-[var(--ui-calendar-popup-slot-bg)]"
                    whileTap={{ scale: 0.94 }}
                  >
                    {digit}
                  </motion.button>
                ))}
                <motion.button
                  type="button"
                  onClick={handleClear}
                  className="flex h-11 items-center justify-center rounded-full text-[18px] font-medium leading-none text-[var(--ui-calendar-popup-strong)] transition hover:bg-[var(--ui-calendar-popup-slot-bg)]"
                  whileTap={{ scale: 0.94 }}
                >
                  C
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => handleDigit("0")}
                  className="flex h-11 items-center justify-center rounded-full bg-[var(--ui-calendar-popup-slot-active-bg)] text-[22px] font-medium leading-none text-[var(--ui-calendar-accent)] transition hover:bg-[var(--ui-calendar-popup-slot-active-bg)]"
                  whileTap={{ scale: 0.94 }}
                >
                  0
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleBackspace}
                  className="flex h-11 items-center justify-center rounded-full text-[var(--ui-calendar-popup-subtle)] transition hover:bg-[var(--ui-calendar-popup-slot-bg)] hover:text-[var(--ui-calendar-popup-strong)]"
                  aria-label="Delete"
                  whileTap={{ scale: 0.94 }}
                >
                  <Delete className="size-4" />
                </motion.button>
              </div>

              <div className="flex flex-col items-center gap-2 pt-1">
                {shortcuts.map((shortcut) => (
                  <motion.button
                    key={shortcut.label}
                    type="button"
                    onClick={() => handleAdjustActiveByMinutes(shortcut.value)}
                    className="flex h-10 w-full items-center justify-center rounded-full bg-[var(--ui-calendar-popup-slot-bg)] px-2 text-[11px] font-medium text-[var(--ui-calendar-popup-subtle)] transition hover:bg-[var(--ui-calendar-popup-input-bg)] hover:text-[var(--ui-calendar-popup-strong)]"
                    whileTap={{ scale: 0.96 }}
                  >
                    {shortcut.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <motion.button
                type="button"
                disabled={!canApply}
                onClick={() => {
                  if (!canApply) {
                    return;
                  }

                  const nextStartTime = toTimeValue(draftStartDigits);
                  const nextEndTime = isSingleMode ? nextStartTime : toTimeValue(draftEndDigits);
                  onApply({
                    startTime: nextStartTime,
                    endTime: nextEndTime,
                  });
                  onOpenChange(false);
                }}
                className="rounded-full px-2 text-[12px] text-[var(--ui-calendar-popup-subtle)] transition hover:text-[var(--ui-calendar-popup-strong)] disabled:opacity-40"
                whileTap={{ scale: 0.97 }}
              >
                Done
              </motion.button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
