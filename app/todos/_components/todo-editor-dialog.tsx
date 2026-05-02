"use client";

import * as React from "react";
import { format } from "date-fns";
import { CheckCircle2, ChevronDown, Bell, CalendarDays, ChevronLeft, Clock3, Plus, Repeat2, Trash2 } from "lucide-react";

import { useAppState } from "@/components/providers/app-state-provider";
import { EventDateRangePopup, EventTimeRangePopup } from "@/components/shared/event-date-time-popups";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  editorValueToOffset,
  formatAlarmOffset,
  formatAlarmPresetSummary,
  formatOffsetsSummary,
  getAlarmPresetLabel,
  offsetToEditorValue,
  type AlarmOffsetUnit,
} from "@/lib/alarm-presets";
import {
  formatTimeStringByPreference,
} from "@/lib/time-format";
import { cn } from "@/lib/utils";
import type { AlarmPresetKey, AlarmPresetOption } from "@/lib/api";

export type TodoEditorMode = "create" | "edit";
export type RepeatValue = "daily" | "weekly" | "monthly" | "yearly";
export type TodoAlarmPreset = AlarmPresetKey;

function formatDateDisplay(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, "MM/dd/yyyy");
}

function formatTimeDisplay(value: string, use24Hour: boolean) {
  if (!value) {
    return "";
  }

  return formatTimeStringByPreference(value, use24Hour);
}

type TodoEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TodoEditorMode;
  todoText: string;
  onTodoTextChange: (value: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  onDelete: () => void;
  isDeleting: boolean;
  dateEnabled: boolean;
  onDateEnabledChange: (checked: boolean) => void;
  scheduledDateInput: string;
  onScheduledDateChange: (value: string) => void;
  timeEnabled: boolean;
  onTimeEnabledChange: (checked: boolean) => void;
  scheduledTimeInput: string;
  onScheduledTimeChange: (value: string) => void;
  alarmPreset: TodoAlarmPreset;
  alarmPresetOptions: AlarmPresetOption[];
  onAlarmPresetChange: (value: TodoAlarmPreset) => void;
  customAlarmOffsets?: number[] | null;
  onCustomAlarmOffsetsChange?: (offsets: number[]) => void;
  repeatEnabled: boolean;
  onRepeatEnabledChange: (checked: boolean) => void;
  repeatValue: RepeatValue;
  onRepeatValueChange: (value: RepeatValue) => void;
};

export function TodoEditorDialog({
  open,
  onOpenChange,
  mode,
  todoText,
  onTodoTextChange,
  onSubmit,
  canSubmit,
  isCreating,
  isUpdating,
  onDelete,
  isDeleting,
  dateEnabled,
  onDateEnabledChange,
  scheduledDateInput,
  onScheduledDateChange,
  timeEnabled,
  onTimeEnabledChange,
  scheduledTimeInput,
  onScheduledTimeChange,
  alarmPreset,
  alarmPresetOptions,
  onAlarmPresetChange,
  customAlarmOffsets,
  onCustomAlarmOffsetsChange,
  repeatEnabled,
  onRepeatEnabledChange,
  repeatValue,
  onRepeatValueChange,
}: TodoEditorDialogProps) {
  const { preferences } = useAppState();
  const [datePopupOpen, setDatePopupOpen] = React.useState(false);
  const [timePopupOpen, setTimePopupOpen] = React.useState(false);
  const [alarmPresetOpen, setAlarmPresetOpen] = React.useState(false);
  const [alarmView, setAlarmView] = React.useState<"list" | "custom">("list");
  const [customEditorRows, setCustomEditorRows] = React.useState<Array<{ id: string; amount: string; unit: AlarmOffsetUnit }>>([]);
  const [customEditorError, setCustomEditorError] = React.useState("");
  const customRowIdRef = React.useRef(0);

  const createCustomRow = React.useCallback((offset?: number | null) => {
    customRowIdRef.current += 1;
    const { amount, unit } = offsetToEditorValue(offset);
    return { id: `todo-custom-row-${customRowIdRef.current}`, amount, unit };
  }, []);

  const openCustomEditor = React.useCallback(() => {
    const rows = customAlarmOffsets?.length
      ? customAlarmOffsets.map((o) => createCustomRow(o))
      : [createCustomRow()];
    setCustomEditorRows(rows);
    setCustomEditorError("");
    setAlarmView("custom");
  }, [createCustomRow, customAlarmOffsets]);

  const handleCustomSave = React.useCallback(() => {
    const nextOffsets = Array.from(
      new Set(
        customEditorRows
          .map((r) => editorValueToOffset(r.amount, r.unit))
          .filter((o): o is number => o !== null),
      ),
    ).sort((a, b) => a - b);

    if (!nextOffsets.length) {
      setCustomEditorError("Add at least one valid reminder time.");
      return;
    }

    onCustomAlarmOffsetsChange?.(nextOffsets);
    onAlarmPresetChange("custom");
    setAlarmPresetOpen(false);
    setAlarmView("list");
  }, [customEditorRows, onAlarmPresetChange, onCustomAlarmOffsetsChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[820px] rounded-[30px] border border-[var(--ui-dialog-border)] bg-[var(--ui-dialog-bg)] p-4 text-[var(--text-default)] sm:p-5">
        {mode === "create" ? (
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-[var(--text-default)]">
              <button
                type="button"
                aria-label="Back to category"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center text-[var(--text-muted)]"
              >
                <ChevronLeft className="size-5" />
              </button>
              <Input
                value={todoText}
                onChange={(event) => onTodoTextChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSubmit();
                  }
                }}
                placeholder="New todo"
                className="h-11 border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] !text-[24px] leading-[120%] text-[var(--ui-input-text)] placeholder:text-[var(--ui-input-placeholder)]"
              />
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Button type="button" onClick={onSubmit} disabled={!canSubmit || isCreating}>
                {isCreating ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5">
            <div className="mb-4 flex items-center shadow px-2 rounded-2xl gap-2 text-[var(--text-default)]">
              <button
                type="button"
                aria-label="Back to category"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center text-[var(--text-muted)]"
              >
                <ChevronLeft className="size-5" />
              </button>
              <Input
                value={todoText}
                onChange={(event) => onTodoTextChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSubmit();
                  }
                }}
                className="h-10 border-none bg-transparent px-0 text-[24px] leading-[120%] text-[var(--text-default)] px-2"
              />
            </div>

            <div className="space-y-3 text-[var(--text-muted)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <CalendarDays className="size-5" />
                  <span className="text-[24px] leading-[120%]">Date</span>
                </div>
                <Switch checked={dateEnabled} onCheckedChange={onDateEnabledChange} />
              </div>
              {dateEnabled ? (
                <button
                  type="button"
                  onClick={() => setDatePopupOpen(true)}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] px-4"
                >
                  <span
                    className={`text-[16px] leading-[120%] ${
                      scheduledDateInput ? "text-[var(--ui-input-text)]" : "text-[var(--ui-input-placeholder)]"
                    }`}
                  >
                    {scheduledDateInput ? formatDateDisplay(scheduledDateInput) : "MM/DD/YYYY"}
                  </span>
                  <CalendarDays className="size-5 text-[var(--text-default)]" />
                </button>
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <Clock3 className="size-5" />
                  <span className="text-[24px] leading-[120%]">Time</span>
                </div>
                <Switch checked={timeEnabled} onCheckedChange={onTimeEnabledChange} />
              </div>
              {timeEnabled ? (
                <button
                  type="button"
                  onClick={() => setTimePopupOpen(true)}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] px-4"
                >
                  <span
                    className={`text-[16px] leading-[120%] ${
                      scheduledTimeInput ? "text-[var(--ui-input-text)]" : "text-[var(--ui-input-placeholder)]"
                    }`}
                  >
                    {scheduledTimeInput ? formatTimeDisplay(scheduledTimeInput, preferences.use24Hour) : "Set time"}
                  </span>
                  <Clock3 className="size-5 text-[var(--text-default)]" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setAlarmPresetOpen(true)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <Bell className="size-5" />
                  <span className="text-[24px] leading-[120%]">Alarm</span>
                </div>
                <div className="flex items-center gap-2 text-[18px] leading-[120%] text-[var(--text-muted)]">
                  <div className="text-right">
                    <p>{getAlarmPresetLabel(alarmPreset, alarmPresetOptions)}</p>
                    <p className="text-[12px] text-[var(--text-muted)]">
                      {alarmPreset === "custom"
                        ? formatOffsetsSummary(customAlarmOffsets || [])
                        : formatAlarmPresetSummary(alarmPreset, alarmPresetOptions)}
                    </p>
                  </div>
                  <ChevronDown className="size-4" />
                </div>
              </button>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <Repeat2 className="size-5" />
                  <span className="text-[24px] leading-[120%]">Repeat</span>
                </div>
                <Switch checked={repeatEnabled} onCheckedChange={onRepeatEnabledChange} />
              </div>
              {repeatEnabled ? (
                <select
                  value={repeatValue}
                  onChange={(event) => onRepeatValueChange(event.target.value as RepeatValue)}
                  className="h-12 w-full rounded-xl border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] px-3 text-[16px] text-[var(--ui-input-text)]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                className="text-[var(--text-muted)] hover:text-[var(--text-default)] text-red-400"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="size-4 text-red-400" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                type="button"
                variant="default"
                className="text-[var(--text-muted)] hover:text-[var(--text-default)] text-white"
                onClick={onSubmit}
                disabled={!canSubmit || isUpdating}
              >
                {isUpdating ? "Updating..." : "Update todo"}
              </Button>
            </div>

            <EventDateRangePopup
              open={datePopupOpen}
              onOpenChange={setDatePopupOpen}
              startDate={scheduledDateInput}
              endDate={scheduledDateInput}
              selectionMode="single"
              onApply={({ startDate }) => onScheduledDateChange(startDate)}
            />
            <EventTimeRangePopup
              open={timePopupOpen}
              onOpenChange={setTimePopupOpen}
              startTime={scheduledTimeInput}
              endTime={scheduledTimeInput}
              selectionMode="single"
              onApply={({ startTime }) => onScheduledTimeChange(startTime)}
            />
            <Dialog
              open={alarmPresetOpen}
              onOpenChange={(open) => {
                setAlarmPresetOpen(open);
                if (!open) { setAlarmView("list"); setCustomEditorError(""); }
              }}
            >
              <DialogContent className="max-w-[380px] rounded-[26px] border-[var(--ui-popover-border)] bg-[var(--ui-popover-bg)] p-4 text-[var(--text-default)]">
                {alarmView === "list" ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-[var(--text-default)]"
                      onClick={() => setAlarmPresetOpen(false)}
                    >
                      <ChevronLeft className="size-4" />
                      <span className="text-[24px] leading-[120%]">Select Alarm</span>
                    </button>

                    <div className="space-y-2 rounded-[22px] bg-[var(--surface-2)] p-3">
                      {alarmPresetOptions.map((option) => {
                        const active = alarmPreset === option.key;

                        if (option.key === "custom") {
                          const customSummary = formatOffsetsSummary(customAlarmOffsets || []);
                          return (
                            <button
                              key="custom"
                              type="button"
                              onClick={openCustomEditor}
                              className={cn(
                                "flex w-full items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition",
                                active
                                  ? "border-[#31C65B] bg-[color:rgba(49,198,91,0.10)]"
                                  : "border-transparent bg-[var(--surface-2)] hover:border-[var(--border)]",
                              )}
                            >
                              <div className="min-w-0">
                                <span className="font-poppins text-[20px] leading-[120%] font-medium text-[var(--text-default)]">
                                  {option.label}
                                </span>
                                <p className="mt-1 text-[12px] leading-[140%] text-[var(--text-muted)]">
                                  Build your own reminder schedule for this todo.
                                </p>
                                <p className="mt-2 text-[12px] font-medium text-[var(--text-default)]">
                                  {customSummary}
                                </p>
                              </div>
                              {active ? <CheckCircle2 className="size-5 shrink-0 text-[#31C65B]" /> : null}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => {
                              onAlarmPresetChange(option.key);
                              setAlarmPresetOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition",
                              active
                                ? "border-[#31C65B] bg-[color:rgba(49,198,91,0.10)]"
                                : "border-transparent bg-[var(--surface-2)] hover:border-[var(--border)]",
                            )}
                          >
                            <div className="min-w-0">
                              <span className="font-poppins text-[20px] leading-[120%] font-medium text-[var(--text-default)]">
                                {option.label}
                              </span>
                              <p className="mt-1 text-[12px] leading-[140%] text-[var(--text-muted)]">
                                {option.description}
                              </p>
                              <p className="mt-2 text-[12px] font-medium text-[var(--text-default)]">
                                {formatAlarmPresetSummary(option.key, alarmPresetOptions)}
                              </p>
                            </div>
                            {active ? <CheckCircle2 className="size-5 shrink-0 text-[#31C65B]" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-[var(--text-default)]"
                      onClick={() => { setAlarmView("list"); setCustomEditorError(""); }}
                    >
                      <ChevronLeft className="size-4" />
                      <span className="text-[24px] leading-[120%]">Custom settings</span>
                    </button>

                    <div className="rounded-[22px] bg-[var(--surface-2)] p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--text-muted)] uppercase">
                          Reminder timing
                        </p>
                        <button
                          type="button"
                          onClick={() => setCustomEditorRows((rows) => [...rows, createCustomRow()])}
                          className="inline-flex items-center gap-1 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 text-[12px] font-medium text-[var(--text-default)] hover:bg-[var(--surface-3)]"
                        >
                          <Plus className="size-3" />
                          Add reminder
                        </button>
                      </div>

                      <div className="space-y-2">
                        {customEditorRows.map((row) => (
                          <div key={row.id} className="flex items-center gap-2">
                            <Input
                              value={row.amount}
                              onChange={(e) => setCustomEditorRows((rows) => rows.map((r) => r.id === row.id ? { ...r, amount: e.target.value } : r))}
                              inputMode="numeric"
                              className="h-10 rounded-xl border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] !text-[16px] text-[var(--ui-input-text)]"
                            />
                            <select
                              value={row.unit}
                              onChange={(e) => setCustomEditorRows((rows) => rows.map((r) => r.id === row.id ? { ...r, unit: e.target.value as AlarmOffsetUnit } : r))}
                              className="h-10 rounded-xl border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] px-2 text-[14px] text-[var(--ui-input-text)]"
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                              <option value="weeks">Weeks</option>
                              <option value="months">Months</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => setCustomEditorRows((rows) => rows.length > 1 ? rows.filter((r) => r.id !== row.id) : rows)}
                              disabled={customEditorRows.length === 1}
                              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#F2C7CB] bg-[#FFF1F2] text-[#DB5562] hover:bg-[#FFE5E8] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--text-muted)]"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {(() => {
                        const preview = Array.from(
                          new Set(
                            customEditorRows
                              .map((r) => editorValueToOffset(r.amount, r.unit))
                              .filter((o): o is number => o !== null),
                          ),
                        ).sort((a, b) => a - b);
                        return preview.length ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {preview.map((offset) => (
                              <span key={offset} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-1)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-default)]">
                                <Clock3 className="size-3 text-[var(--text-muted)]" />
                                {formatAlarmOffset(offset)}
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()}

                      {customEditorError ? (
                        <p className="text-[12px] text-[#B14E4E]">{customEditorError}</p>
                      ) : null}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--text-default)] hover:bg-[var(--surface-3)]"
                        onClick={() => { setAlarmView("list"); setCustomEditorError(""); }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90"
                        onClick={handleCustomSave}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
