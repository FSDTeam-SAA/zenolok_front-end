"use client";

import { Bell, CalendarDays, ChevronLeft, Clock3, Repeat2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export type TodoEditorMode = "create" | "edit";
export type RepeatValue = "daily" | "weekly" | "monthly" | "yearly";

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
  alarmEnabled: boolean;
  onAlarmEnabledChange: (checked: boolean) => void;
  alarmDateTimeInput: string;
  onAlarmDateTimeChange: (value: string) => void;
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
  alarmEnabled,
  onAlarmEnabledChange,
  alarmDateTimeInput,
  onAlarmDateTimeChange,
  repeatEnabled,
  onRepeatEnabledChange,
  repeatValue,
  onRepeatValueChange,
}: TodoEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[820px] rounded-[30px] border border-[#DDE3EC] bg-[#F7F8FB] p-4 sm:p-5">
        {mode === "create" ? (
          <div className="rounded-[30px] border border-[#E1E5ED] bg-[#F3F5F9] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-[#4A505A]">
              <button
                type="button"
                aria-label="Back to category"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center text-[#8E95A4]"
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
                className="h-11 border border-[#D5DBE6] bg-white text-[24px] leading-[120%] text-[#4A505A]"
              />
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Button type="button" onClick={onSubmit} disabled={!canSubmit || isCreating}>
                {isCreating ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-[30px] border border-[#E1E5ED] bg-[#F3F5F9] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-[#4A505A]">
              <button
                type="button"
                aria-label="Back to category"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center text-[#8E95A4]"
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
                className="h-10 border-none bg-transparent px-0 text-[36px] leading-[120%] text-[#4A505A] shadow-none"
              />
            </div>

            <div className="space-y-3 text-[#C0C6D1]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <CalendarDays className="size-5" />
                  <span>Date</span>
                </div>
                <Switch checked={dateEnabled} onCheckedChange={onDateEnabledChange} />
              </div>
              {dateEnabled ? (
                <Input
                  type="date"
                  value={scheduledDateInput}
                  onChange={(event) => onScheduledDateChange(event.target.value)}
                  className="h-10 border-[#D5DBE6] bg-white text-[#5A6070]"
                />
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <Clock3 className="size-5" />
                  <span>Time</span>
                </div>
                <Switch checked={timeEnabled} onCheckedChange={onTimeEnabledChange} />
              </div>
              {timeEnabled ? (
                <Input
                  type="time"
                  value={scheduledTimeInput}
                  onChange={(event) => onScheduledTimeChange(event.target.value)}
                  className="h-10 border-[#D5DBE6] bg-white text-[#5A6070]"
                />
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <Bell className="size-5" />
                  <span>Alarm</span>
                </div>
                <Switch checked={alarmEnabled} onCheckedChange={onAlarmEnabledChange} />
              </div>
              {alarmEnabled ? (
                <Input
                  type="datetime-local"
                  value={alarmDateTimeInput}
                  onChange={(event) => onAlarmDateTimeChange(event.target.value)}
                  className="h-10 border-[#D5DBE6] bg-white text-[#5A6070]"
                />
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <Repeat2 className="size-5" />
                  <span>Repeat</span>
                </div>
                <Switch checked={repeatEnabled} onCheckedChange={onRepeatEnabledChange} />
              </div>
              {repeatEnabled ? (
                <select
                  value={repeatValue}
                  onChange={(event) => onRepeatValueChange(event.target.value as RepeatValue)}
                  className="h-10 w-full rounded-md border border-[#D5DBE6] bg-white px-3 text-sm text-[#5A6070]"
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
                className="text-[#B4BAC7] hover:text-[#8D94A3]"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-[#B4BAC7] hover:text-[#8D94A3]"
                onClick={onSubmit}
                disabled={!canSubmit || isUpdating}
              >
                {isUpdating ? "Updating..." : "Update todo"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
