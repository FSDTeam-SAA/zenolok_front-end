"use client";

import { format } from "date-fns";
import { Bell, CalendarDays, Clock3, Repeat2, SlidersHorizontal, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { TodoItem } from "@/lib/api";

type SelectedCategory = {
  _id: string;
  name: string;
  color: string;
} | null;

type CategoryDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: SelectedCategory;
  selectedCategoryItems: TodoItem[];
  onToggleTodo: (todoId: string, nextCompleted: boolean) => void;
  onEditTodo: (todoId: string) => void;
  onDeleteTodo: (todoId: string) => void;
};

export function CategoryDetailDialog({
  open,
  onOpenChange,
  selectedCategory,
  selectedCategoryItems,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
}: CategoryDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[820px] rounded-[30px] border border-[#DDE3EC] bg-[#F7F8FB] p-4 sm:p-5">
        <div className="space-y-3">
          <p
            className="font-poppins text-[28px] leading-[120%] font-semibold"
            style={{ color: selectedCategory?.color || "#EE8C0D" }}
          >
            {selectedCategory?.name || "Category"}
          </p>

          <div className="rounded-[30px] border border-[#DDE2EA] bg-[#F3F5F9] p-3 sm:p-4">
            <div className="space-y-2">
              {selectedCategoryItems.map((item) => (
                <div key={item._id} className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`size-5 rounded-full border ${item.isCompleted ? "border-[#7DC97E] bg-[#7DC97E]" : "border-[#C5CBD6]"}`}
                    onClick={() => onToggleTodo(item._id, !item.isCompleted)}
                    aria-label={`Toggle ${item.text}`}
                  />
                  <span
                    className={`flex-1 truncate text-[30px] leading-[120%] sm:text-[32px] ${
                      item.isCompleted ? "text-[#A5ACB9] line-through" : "text-[#4B505A]"
                    }`}
                  >
                    {item.text}
                  </span>
                  <div className="flex items-center gap-1 text-[#B5BBC8]">
                    {item.scheduledDate ? (
                      <span className="inline-flex items-center gap-1 text-[11px] leading-none">
                        <CalendarDays className="size-4" />
                        {format(new Date(item.scheduledDate), "dd MMM")}
                      </span>
                    ) : null}
                    {item.scheduledTime ? (
                      <span className="inline-flex items-center gap-1 text-[11px] leading-none">
                        <Clock3 className="size-4" />
                        {item.scheduledTime}
                      </span>
                    ) : null}
                    {item.alarm ? <Bell className="size-4" /> : null}
                    {item.repeat ? <Repeat2 className="size-4" /> : null}
                    <button
                      type="button"
                      className="inline-flex items-center justify-center"
                      aria-label={`Edit ${item.text}`}
                      onClick={() => onEditTodo(item._id)}
                    >
                      <SlidersHorizontal className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center"
                      aria-label={`Delete ${item.text}`}
                      onClick={() => onDeleteTodo(item._id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
