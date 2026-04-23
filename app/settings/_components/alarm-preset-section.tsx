"use client";

import * as React from "react";
import { CheckCircle2, Clock3, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AlarmPresetOption } from "@/lib/api";
import {
  editorValueToOffset,
  formatAlarmOffset,
  formatAlarmPresetSummary,
  offsetToEditorValue,
  type AlarmOffsetUnit,
  type EditableAlarmPresetKey,
} from "@/lib/alarm-presets";
import { cn } from "@/lib/utils";

import { SectionHeader } from "./section-header";
import type { AlarmPreset } from "./settings-types";

type ReminderEditorRow = {
  id: string;
  amount: string;
  unit: AlarmOffsetUnit;
};

interface AlarmPresetSectionProps {
  value: AlarmPreset;
  options: AlarmPresetOption[];
  onChange: (preset: AlarmPreset) => void;
  onSaveOption: (payload: {
    key: EditableAlarmPresetKey;
    offsetsInMinutes: number[];
  }) => void;
  savingKey?: EditableAlarmPresetKey | null;
}

export function AlarmPresetSection({
  value,
  options,
  onChange,
  onSaveOption,
  savingKey = null,
}: AlarmPresetSectionProps) {
  const reminderRowIdRef = React.useRef(0);
  const [editingPreset, setEditingPreset] =
    React.useState<EditableAlarmPresetKey | null>(null);
  const [editorRows, setEditorRows] = React.useState<ReminderEditorRow[]>([]);
  const [errorMessage, setErrorMessage] = React.useState("");

  const editingOption = React.useMemo(
    () => options.find((option) => option.key === editingPreset),
    [editingPreset, options],
  );

  const previewOffsets = React.useMemo(
    () =>
      editorRows
        .map((row) => editorValueToOffset(row.amount, row.unit))
        .filter((offset): offset is number => offset !== null)
        .sort((left, right) => left - right),
    [editorRows],
  );

  const createReminderRow = React.useCallback(
    (offsetInMinutes?: number | null): ReminderEditorRow => {
      reminderRowIdRef.current += 1;
      const initialValue = offsetToEditorValue(offsetInMinutes);

      return {
        id: `alarm-reminder-row-${reminderRowIdRef.current}`,
        amount: initialValue.amount,
        unit: initialValue.unit,
      };
    },
    [],
  );

  const openEditor = React.useCallback(
    (key: EditableAlarmPresetKey) => {
      const option = options.find((item) => item.key === key);
      const initialRows =
        option?.offsetsInMinutes.length
          ? option.offsetsInMinutes.map((offset) => createReminderRow(offset))
          : [createReminderRow()];

      setEditingPreset(key);
      setEditorRows(initialRows);
      setErrorMessage("");
    },
    [createReminderRow, options],
  );

  const handleSave = React.useCallback(() => {
    if (!editingPreset) {
      return;
    }

    const nextOffsets = Array.from(
      new Set(
        editorRows
          .map((row) => editorValueToOffset(row.amount, row.unit))
          .filter((offset): offset is number => offset !== null),
      ),
    ).sort((left, right) => left - right);

    if (!nextOffsets.length) {
      setErrorMessage("Add at least one valid reminder time.");
      return;
    }

    onSaveOption({
      key: editingPreset,
      offsetsInMinutes: nextOffsets,
    });
    setEditingPreset(null);
  }, [editingPreset, editorRows, onSaveOption]);

  const handleEditorRowChange = React.useCallback(
    (
      rowId: string,
      field: keyof Omit<ReminderEditorRow, "id">,
      value: string,
    ) => {
      setEditorRows((currentRows) =>
        currentRows.map((row) =>
          row.id === rowId ? { ...row, [field]: value } : row,
        ),
      );

      if (errorMessage) {
        setErrorMessage("");
      }
    },
    [errorMessage],
  );

  const handleAddReminderRow = React.useCallback(() => {
    setEditorRows((currentRows) => [...currentRows, createReminderRow()]);
    if (errorMessage) {
      setErrorMessage("");
    }
  }, [createReminderRow, errorMessage]);

  const handleDeleteReminderRow = React.useCallback((rowId: string) => {
    setEditorRows((currentRows) => {
      if (currentRows.length === 1) {
        return currentRows;
      }

      return currentRows.filter((row) => row.id !== rowId);
    });

    if (errorMessage) {
      setErrorMessage("");
    }
  }, [errorMessage]);

  const settingsOptions = options.filter(
    (opt) => opt.key === "preset_1" || opt.key === "preset_2" || opt.key === "preset_3",
  );

  return (
    <section className="space-y-5">
      <SectionHeader
        title="Alarm preset"
        description="Select and customize your three reusable reminder presets. These control when notifications fire before your todos and events."
      />

      <div className="w-full settings-action-card rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <div className="mb-4 rounded-[22px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
          <p className="font-poppins text-[16px] leading-[140%] text-[var(--text-default)]">
            Each preset controls how early your todo alarm should ring before the scheduled date and time.
          </p>
        </div>

        <div className="space-y-3">
          {settingsOptions.map((item) => {
            const active = value === item.key;
            const summary = formatAlarmPresetSummary(item.key, options);

            return (
              <div
                key={item.key}
                className={cn(
                  "rounded-[24px] border transition",
                  active
                    ? "border-[#31C65B] bg-[color:rgba(49,198,91,0.14)]"
                    : "border-[var(--border)] bg-[var(--surface-1)]",
                )}
              >
                <div className="flex items-start justify-between gap-4 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onChange(item.key)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="space-y-1.5">
                      <span className="font-poppins text-[20px] leading-[120%] font-medium text-[var(--text-default)]">
                        {item.label}
                      </span>
                      <p className="max-w-[640px] text-[14px] leading-[140%] text-[var(--text-muted)]">
                        {item.description}
                      </p>
                      {summary ? (
                        <p className="text-[13px] font-medium text-[var(--text-default)]">
                          {summary}
                        </p>
                      ) : null}
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {item.editable ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[13px] font-medium text-[var(--text-default)] shadow-[0_1px_2px_rgba(21,32,54,0.08)] hover:border-[var(--ring)] hover:bg-[var(--surface-3)] disabled:border-[var(--border)] disabled:bg-[var(--surface-1)] disabled:text-[var(--text-muted)] disabled:opacity-80"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditor(item.key as EditableAlarmPresetKey);
                        }}
                        disabled={savingKey === item.key}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                    ) : null}
                    {active ? (
                      <CheckCircle2 className="size-5 shrink-0 text-[#31C65B]" />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog
        open={Boolean(editingPreset)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPreset(null);
            setEditorRows([]);
            setErrorMessage("");
          }
        }}
      >
        <DialogContent className="max-w-[640px] overflow-hidden rounded-[30px] border border-[var(--ui-dialog-border)] bg-[var(--ui-dialog-bg)] p-0 text-[var(--text-default)]">
          <div className="flex max-h-[min(82vh,760px)] flex-col">
            <DialogHeader className="shrink-0 border-b border-[var(--border)] px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
              <DialogTitle
                className="font-poppins !text-[30px] !leading-[120%] font-semibold text-[var(--text-default)]"
                style={{ textAlign: "left" }}
              >
                {editingOption?.label || "Edit preset"}
              </DialogTitle>
              <DialogDescription
                className="!text-[15px] !leading-[145%] text-[var(--text-muted)]"
                style={{ textAlign: "left" }}
              >
                {editingOption?.description ||
                  "Choose when the reminder should fire before the todo starts."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[13px] font-medium tracking-[0.02em] text-[var(--text-muted)] uppercase">
                    Reminder timing
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[13px] font-medium text-[var(--text-default)] shadow-[0_1px_2px_rgba(21,32,54,0.08)] hover:border-[var(--ring)] hover:bg-[var(--surface-3)]"
                    onClick={handleAddReminderRow}
                  >
                    <Plus className="size-3.5" />
                    Add reminder
                  </Button>
                </div>

                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {editorRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_170px_48px] sm:items-center"
                    >
                      <Input
                        value={row.amount}
                        onChange={(event) =>
                          handleEditorRowChange(
                            row.id,
                            "amount",
                            event.target.value,
                          )
                        }
                        inputMode="numeric"
                        className="h-11 rounded-2xl border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] !text-[18px] text-[var(--ui-input-text)]"
                      />
                      <select
                        value={row.unit}
                        onChange={(event) =>
                          handleEditorRowChange(
                            row.id,
                            "unit",
                            event.target.value as AlarmOffsetUnit,
                          )
                        }
                        className="h-11 min-w-[140px] rounded-2xl border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] px-3 text-[16px] text-[var(--ui-input-text)]"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteReminderRow(row.id)}
                        disabled={editorRows.length === 1}
                        className="inline-flex h-11 w-11 items-center justify-center self-end rounded-2xl border border-[#F2C7CB] bg-[#FFF1F2] text-[#DB5562] transition hover:bg-[#FFE5E8] sm:self-auto disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--text-muted)]"
                        aria-label="Delete reminder"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-[var(--surface-2)] px-4 py-3">
                  <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--text-muted)] uppercase">
                    Preview
                  </p>
                  {previewOffsets.length ? (
                    <div className="mt-2 max-h-28 overflow-y-auto pr-1">
                      <div className="flex flex-wrap gap-2">
                        {previewOffsets.map((offset) => (
                          <span
                            key={offset}
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-1)] px-3 py-1 text-[13px] font-medium text-[var(--text-default)]"
                          >
                            <Clock3 className="size-3.5 text-[var(--text-muted)]" />
                            {formatAlarmOffset(offset)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-[16px] font-medium text-[var(--text-default)]">
                      Enter at least one valid reminder time
                    </p>
                  )}
                </div>

                {errorMessage ? (
                  <p className="mt-3 text-[13px] text-[#B14E4E]">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-[var(--border)] bg-[var(--surface-1)] px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full px-5"
                onClick={() => {
                  setEditingPreset(null);
                  setErrorMessage("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-full px-5"
                onClick={handleSave}
                disabled={Boolean(editingPreset && savingKey === editingPreset)}
              >
                {editingPreset && savingKey === editingPreset
                  ? "Saving..."
                  : "Save preset"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
