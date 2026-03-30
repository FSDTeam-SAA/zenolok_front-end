"use client";

import { Plus, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { EventTodo } from "@/lib/api";

type TodoSectionProps = {
  todos: EventTodo[];
  title: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onToggle: (todo: EventTodo) => void;
  onDelete: (todoId: string) => void;
};

export function TodoSection({
  todos,
  title,
  inputValue,
  onInputChange,
  onAdd,
  onToggle,
  onDelete,
}: TodoSectionProps) {
  const notesPlaceholder = title.toLowerCase().includes("shared")
    ? "New shared notes"
    : "New notes";

  return (
    <Card className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text-default)] shadow-none">
      {todos.length ? (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo._id}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-2"
            >
              <button
                type="button"
                className={`size-4 rounded-full border ${
                  todo.isCompleted
                    ? "border-[#32ADE6] bg-[#32ADE6]"
                    : "border-[#A9AFBC] bg-transparent"
                }`}
                onClick={() => onToggle(todo)}
              />
              <p
                className={`min-w-0 flex-1 truncate text-[13px] ${
                  todo.isCompleted
                    ? "text-[var(--text-muted)] line-through"
                    : "text-[var(--text-default)]"
                }`}
              >
                {todo.text}
              </p>
              <button
                type="button"
                className="text-[var(--text-muted)] transition hover:text-[#E94B3C]"
                onClick={() => onDelete(todo._id)}
                aria-label="Delete todo"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-[12px] text-[var(--text-muted)]">{title}</p>
          <div className="h-px w-28 bg-[var(--border)]" />
          <p className="text-[11px] text-[var(--text-muted)]">{notesPlaceholder}</p>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-2 py-1">
        <Input
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={title}
          className="h-7 rounded-full border-none bg-transparent px-0 text-[13px] placeholder:text-[var(--text-muted)]"
        />
        <button
          type="button"
          onClick={onAdd}
          className="flex size-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)]"
          aria-label="Add todo"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </Card>
  );
}

