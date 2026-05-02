"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TodoStatusCircleButton } from "@/components/shared/todo-status-circle";
import type { EventTodo } from "@/lib/api";

type SaveState = "idle" | "saving" | "saved" | "error";

type TodoSectionProps = {
  todos: EventTodo[];
  title: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => Promise<void> | Promise<unknown> | void;
  onToggle: (todo: EventTodo) => void;
  onSaveText: (
    todoId: string,
    text: string,
  ) => Promise<void> | Promise<unknown> | void;
  onDelete: (todoId: string) => void;
  onReorder: (todoIds: string[]) => Promise<void> | void;
  checkedColor?: string;
  bare?: boolean;
};

const DEBOUNCE_MS = 1000;
const SAVED_DISPLAY_MS = 1500;

const iconButtonClass =
  "inline-flex size-7 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-1)] hover:text-[var(--text-strong)]";

const sortTodos = (items: EventTodo[]) =>
  [...items].sort((left, right) => {
    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return (
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
  });

export function TodoSection({
  todos,
  title,
  inputValue,
  onInputChange,
  onAdd,
  onToggle,
  onSaveText,
  onDelete,
  onReorder,
  checkedColor,
  bare = false,
}: TodoSectionProps) {
  const addInputRef = React.useRef<HTMLInputElement | null>(null);
  const sortedTodos = React.useMemo(() => sortTodos(todos), [todos]);
  const todoLookup = React.useMemo(
    () => new Map(sortedTodos.map((todo) => [todo._id, todo])),
    [sortedTodos],
  );
  const [orderedIds, setOrderedIds] = React.useState<string[]>(() =>
    sortedTodos.map((todo) => todo._id),
  );
  const [draggingTodoId, setDraggingTodoId] = React.useState<string | null>(
    null,
  );
  const [draftTexts, setDraftTexts] = React.useState<Record<string, string>>(
    {},
  );
  const [saveStates, setSaveStates] = React.useState<Record<string, SaveState>>({});

  // Holds debounce timer ids and "saved" clear timers per todo
  const debounceTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const savedTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  React.useEffect(() => {
    setOrderedIds(sortedTodos.map((todo) => todo._id));
  }, [sortedTodos]);

  React.useEffect(() => {
    setDraftTexts((previous) => {
      const nextDrafts: Record<string, string> = {};

      sortedTodos.forEach((todo) => {
        const previousDraft = previous[todo._id];
        nextDrafts[todo._id] =
          previousDraft !== undefined && previousDraft !== todo.text
            ? previousDraft
            : todo.text;
      });

      return nextDrafts;
    });
  }, [sortedTodos]);

  // Cleanup timers on unmount
  React.useEffect(() => {
    const dTimers = debounceTimers.current;
    const sTimers = savedTimers.current;
    return () => {
      Object.values(dTimers).forEach(clearTimeout);
      Object.values(sTimers).forEach(clearTimeout);
    };
  }, []);

  const orderedTodos = React.useMemo(
    () =>
      orderedIds
        .map((todoId) => todoLookup.get(todoId))
        .filter((todo): todo is EventTodo => Boolean(todo)),
    [orderedIds, todoLookup],
  );

  const visibleTodos = orderedTodos.slice(0, 5);
  const hiddenCount = Math.max(0, orderedTodos.length - visibleTodos.length);

  const restoreInputFocus = React.useCallback(() => {
    if (!addInputRef.current) {
      return;
    }

    addInputRef.current.focus();
    if (addInputRef.current.value) {
      addInputRef.current.select();
    }
  }, []);

  const handleAddTodo = async () => {
    if (!inputValue.trim()) {
      restoreInputFocus();
      return;
    }

    try {
      await onAdd();
      onInputChange("");
    } catch {
      // Caller handles error display.
    } finally {
      requestAnimationFrame(() => {
        restoreInputFocus();
      });
    }
  };

  const moveTodo = async (targetTodoId: string) => {
    if (!draggingTodoId || draggingTodoId === targetTodoId) {
      return;
    }

    const nextIds = [...orderedIds];
    const draggingIndex = nextIds.indexOf(draggingTodoId);
    const targetIndex = nextIds.indexOf(targetTodoId);

    if (draggingIndex === -1 || targetIndex === -1) {
      return;
    }

    nextIds.splice(draggingIndex, 1);
    nextIds.splice(targetIndex, 0, draggingTodoId);
    setOrderedIds(nextIds);
    await onReorder(nextIds);
  };

  const setSaveState = (todoId: string, state: SaveState) => {
    setSaveStates((prev) => ({ ...prev, [todoId]: state }));
  };

  const executeSave = React.useCallback(
    async (todo: EventTodo, text: string) => {
      const trimmed = text.trim();

      if (!trimmed) {
        // Revert to original on empty
        setDraftTexts((prev) => ({ ...prev, [todo._id]: todo.text }));
        setSaveState(todo._id, "idle");
        return;
      }

      if (trimmed === todo.text) {
        setSaveState(todo._id, "idle");
        return;
      }

      setSaveState(todo._id, "saving");
      try {
        await onSaveText(todo._id, trimmed);
        setSaveState(todo._id, "saved");

        // Clear the "saved" indicator after a short delay
        clearTimeout(savedTimers.current[todo._id]);
        savedTimers.current[todo._id] = setTimeout(() => {
          setSaveState(todo._id, "idle");
        }, SAVED_DISPLAY_MS);
      } catch {
        setSaveState(todo._id, "error");
        // Revert draft to last known good text
        setDraftTexts((prev) => ({ ...prev, [todo._id]: todo.text }));
      }
    },
    [onSaveText],
  );

  const handleDraftChange = React.useCallback(
    (todo: EventTodo, value: string) => {
      setDraftTexts((previous) => ({ ...previous, [todo._id]: value }));

      // Reset any "saved"/"error" state while typing
      setSaveState(todo._id, "idle");

      // Debounce: clear existing timer and set a new one
      clearTimeout(debounceTimers.current[todo._id]);
      debounceTimers.current[todo._id] = setTimeout(() => {
        void executeSave(todo, value);
      }, DEBOUNCE_MS);
    },
    [executeSave],
  );

  const resetDraft = (todo: EventTodo) => {
    clearTimeout(debounceTimers.current[todo._id]);
    setDraftTexts((previous) => ({ ...previous, [todo._id]: todo.text }));
    setSaveState(todo._id, "idle");
  };

  const Wrapper: React.ElementType = bare ? "div" : Card;
  const wrapperClassName = bare
    ? "w-full px-4 py-3 text-[var(--text-default)]"
    : "w-full overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text-default)] shadow-none";

  return (
    <Wrapper className={wrapperClassName}>
      <div className="space-y-2">
        {visibleTodos.map((todo) => {
          const draftValue = draftTexts[todo._id] ?? todo.text;
          const isChecked = Boolean(todo.isCompleted);
          const saveState = saveStates[todo._id] ?? "idle";

          return (
            <div
              key={todo._id}
              draggable
              onDragStart={() => setDraggingTodoId(todo._id)}
              onDragEnd={() => setDraggingTodoId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void moveTodo(todo._id);
              }}
              className={`group flex items-center gap-3 rounded-[14px] px-1 py-1.5 ${
                draggingTodoId === todo._id ? "opacity-60" : ""
              }`}
            >
              <TodoStatusCircleButton
                checked={isChecked}
                checkedColor={checkedColor}
                onClick={() => onToggle(todo)}
                aria-label={
                  isChecked
                    ? `Mark ${todo.text} as unfinished`
                    : `Mark ${todo.text} as finished`
                }
              />

              <Input
                value={draftValue}
                onChange={(event) =>
                  handleDraftChange(todo, event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    resetDraft(todo);
                  }
                }}
                placeholder={todo.text}
                aria-label={`Edit ${todo.text}`}
                className="h-8 flex-1 rounded-none border-none bg-transparent px-0 text-[14px] shadow-none placeholder:text-[var(--text-muted)] focus-visible:ring-0"
              />

              <div className="flex items-center gap-2 shrink-0">
                {saveState === "saving" && (
                  <span className="text-[11px] text-[var(--text-muted)] leading-none">
                    Saving…
                  </span>
                )}
                {saveState === "saved" && (
                  <span className="text-[11px] text-green-500 leading-none">
                    Saved
                  </span>
                )}
                {saveState === "error" && (
                  <span className="text-[11px] text-red-500 leading-none">
                    Failed
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(todo._id)}
                  className="flex size-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)] transition hover:bg-[var(--surface-3)]"
                  aria-label={`Delete ${todo.text}`}
                >
                  <Trash2 className="size-4 text-red-400" />
                </button>
              </div>
            </div>
          );
        })}

        {hiddenCount > 0 ? (
          <p className="pl-8 text-[13px] leading-none text-[var(--text-muted)]">
            +{hiddenCount}
          </p>
        ) : null}

        <div className={orderedTodos.length ? "pt-1" : ""}>
          <div className="flex items-center gap-2 pt-2">
            <Input
              ref={addInputRef}
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAddTodo();
                }
              }}
              placeholder={title}
              className="h-8 rounded-none border-none bg-transparent px-2 text-[14px] shadow-none placeholder:text-(--text-muted) focus-visible:ring-0"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                void handleAddTodo();
              }}
              disabled={!inputValue.trim()}
              className={`${iconButtonClass} text-(--text-muted) disabled:opacity-35`}
              aria-label="Add todo"
            >
              <Plus className="size-4 stroke-[3px]" />
            </button>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
