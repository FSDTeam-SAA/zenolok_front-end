"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, format, formatDistanceToNowStrict, startOfMonth } from "date-fns";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Plus,
  Repeat2,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useAppState } from "@/components/providers/app-state-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SectionLoading } from "@/components/shared/section-loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  brickApi,
  paginateArray,
  todoItemApi,
  todoCategoryApi,
  type TodoCategory,
  type TodoItem,
} from "@/lib/api";
import { colorPalette } from "@/lib/presets";
import { queryKeys } from "@/lib/query-keys";

interface CategoryWithItems extends TodoCategory {
  items: TodoItem[];
}

const defaultCategoryBrickIcon = "layout-grid";

function toDateInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function toLocalDateTimeInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
}

function CategoryCard({
  category,
  onCreateTodo,
  onToggle,
  onOpen,
}: {
  category: CategoryWithItems;
  onCreateTodo: (payload: { categoryId: string; text: string }) => void;
  onToggle: (payload: { id: string; isCompleted: boolean }) => void;
  onOpen: (categoryId: string) => void;
}) {
  const [newText, setNewText] = React.useState("");

  const unfinished = (category.items || []).filter((item) => !item.isCompleted);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(category._id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(category._id);
        }
      }}
      className="rounded-[26px] border border-[#D7DCE6] bg-[#F7F9FC] p-4 transition hover:border-[#C7CEDD]"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-poppins text-[32px] leading-[120%] font-semibold" style={{ color: category.color }}>
          {category.name}
        </h3>
        <span
          className="font-poppins inline-flex min-w-[26px] items-center justify-center rounded-full px-1.5 py-0.5 text-[14px] leading-[120%] font-medium text-white"
          style={{ backgroundColor: category.color }}
        >
          {unfinished.length}
        </span>
      </div>

      <div className="space-y-2">
        {unfinished.slice(0, 3).map((item) => (
          <div key={item._id} className="flex items-center gap-2 text-[18px] text-[#3D4351]">
            <input
              type="checkbox"
              checked={item.isCompleted}
              onClick={(event) => event.stopPropagation()}
              onChange={() => onToggle({ id: item._id, isCompleted: !item.isCompleted })}
              className="size-4 rounded-full border border-[#A3ABBC]"
            />
            <span className="flex-1 truncate">{item.text}</span>
            <div className="flex items-center gap-1 text-[#B5BBC8]">
              {item.scheduledDate ? (
                <span className="inline-flex items-center gap-1 text-[11px] leading-none">
                  <CalendarDays className="size-3.5" />
                  {format(new Date(item.scheduledDate), "dd MMM")}
                </span>
              ) : null}
              {item.alarm ? <Bell className="size-3.5" /> : null}
              {item.repeat ? <Repeat2 className="size-3.5" /> : null}
            </div>
          </div>
        ))}
      </div>

      <form
        className="mt-3"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (!newText.trim()) {
            return;
          }
          onCreateTodo({ categoryId: category._id, text: newText.trim() });
          setNewText("");
        }}
      >
        <Input
          value={newText}
          onChange={(event) => setNewText(event.target.value)}
          placeholder="New todo"
          className="h-9 rounded-lg border-none bg-transparent px-0 text-[16px] text-[#5C6475] placeholder:text-[#A8AFBE]"
        />
      </form>

      {unfinished.length > 3 ? (
        <p className="font-poppins mt-1 text-[14px] leading-[120%] text-[#9AA2B2]">+{unfinished.length - 3}</p>
      ) : null}
    </div>
  );
}

export default function TodosPage() {
  const queryClient = useQueryClient();
  const { monthCursor } = useAppState();

  const [page, setPage] = React.useState(1);
  const [addOpen, setAddOpen] = React.useState(false);
  const [categoryDetailOpen, setCategoryDetailOpen] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [detailNewText, setDetailNewText] = React.useState("");
  const [todoEditorOpen, setTodoEditorOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteTargetTodoId, setDeleteTargetTodoId] = React.useState<string | null>(null);
  const [selectedTodoId, setSelectedTodoId] = React.useState<string | null>(null);
  const [todoText, setTodoText] = React.useState("");
  const [dateEnabled, setDateEnabled] = React.useState(false);
  const [timeEnabled, setTimeEnabled] = React.useState(false);
  const [alarmEnabled, setAlarmEnabled] = React.useState(false);
  const [repeatEnabled, setRepeatEnabled] = React.useState(false);
  const [scheduledDateInput, setScheduledDateInput] = React.useState("");
  const [scheduledTimeInput, setScheduledTimeInput] = React.useState("");
  const [alarmDateTimeInput, setAlarmDateTimeInput] = React.useState("");
  const [repeatValue, setRepeatValue] = React.useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newCategoryColor, setNewCategoryColor] = React.useState("#F7C700");
  const monthStart = React.useMemo(() => format(startOfMonth(monthCursor), "yyyy-MM-dd"), [monthCursor]);
  const monthEnd = React.useMemo(() => format(endOfMonth(monthCursor), "yyyy-MM-dd"), [monthCursor]);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categoriesWithItems,
    queryFn: todoItemApi.getCategoriesWithItems,
  });

  const scheduledQuery = useQuery({
    queryKey: queryKeys.scheduledTodos({ status: "unfinished", startDate: monthStart, endDate: monthEnd }),
    queryFn: () => todoItemApi.getScheduled({ status: "unfinished", startDate: monthStart, endDate: monthEnd }),
  });

  const createTodoMutation = useMutation({
    mutationFn: todoItemApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesWithItems });
      queryClient.invalidateQueries({ queryKey: ["scheduled-todos"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add todo"),
  });

  const toggleTodoMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      todoItemApi.update(id, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesWithItems });
      queryClient.invalidateQueries({ queryKey: ["scheduled-todos"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update todo"),
  });
  const updateTodoMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof todoItemApi.update>[1] }) =>
      todoItemApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesWithItems });
      queryClient.invalidateQueries({ queryKey: ["scheduled-todos"] });
      toast.success("Todo updated");
      setTodoEditorOpen(false);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update todo"),
  });
  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => todoItemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesWithItems });
      queryClient.invalidateQueries({ queryKey: ["scheduled-todos"] });
      toast.success("Todo deleted");
      setDeleteConfirmOpen(false);
      setDeleteTargetTodoId(null);
      setTodoEditorOpen(false);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete todo"),
  });

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      if (!newCategoryName.trim()) {
        throw new Error("Category name is required");
      }

      const categoryName = newCategoryName.trim();

      await Promise.all([
        todoCategoryApi.create({
          name: categoryName,
          color: newCategoryColor,
        }),
        brickApi.create({
          name: categoryName,
          color: newCategoryColor,
          icon: defaultCategoryBrickIcon,
        }),
      ]);
    },
    onSuccess: () => {
      toast.success("Category added");
      setAddOpen(false);
      setNewCategoryName("");
      setNewCategoryColor("#F7C700");
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesWithItems });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.bricks });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create category"),
  });

  const categories = React.useMemo(
    () => ((categoriesQuery.data || []) as CategoryWithItems[]),
    [categoriesQuery.data]
  );
  const selectedCategory = React.useMemo(
    () => categories.find((item) => item._id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );
  const selectedCategoryItems = React.useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    return (selectedCategory.items || []).filter((item) => !item.isCompleted);
  }, [selectedCategory]);
  const selectedTodo = React.useMemo(() => {
    if (!selectedCategory || !selectedTodoId) {
      return null;
    }
    return (selectedCategory.items || []).find((item) => item._id === selectedTodoId) || null;
  }, [selectedCategory, selectedTodoId]);

  const paged = React.useMemo(() => paginateArray(categories, page, 6), [categories, page]);

  React.useEffect(() => {
    setPage(1);
  }, [categories.length]);

  React.useEffect(() => {
    if (!todoEditorOpen || !selectedTodo) {
      return;
    }

    setTodoText(selectedTodo.text || "");
    setDateEnabled(Boolean(selectedTodo.scheduledDate));
    setTimeEnabled(Boolean(selectedTodo.scheduledTime));
    setAlarmEnabled(Boolean(selectedTodo.alarm));
    setRepeatEnabled(Boolean(selectedTodo.repeat));
    setScheduledDateInput(toDateInputValue(selectedTodo.scheduledDate));
    setScheduledTimeInput(selectedTodo.scheduledTime || "");
    setAlarmDateTimeInput(toLocalDateTimeInputValue(selectedTodo.alarm));
    setRepeatValue((selectedTodo.repeat || "daily") as "daily" | "weekly" | "monthly" | "yearly");
  }, [todoEditorOpen, selectedTodo]);

  const handleCreateTodo = React.useCallback(
    (payload: { categoryId: string; text: string }, openEditor = false) => {
      createTodoMutation.mutate(payload, {
        onSuccess: (createdTodo) => {
          if (!openEditor) {
            return;
          }
          setSelectedCategoryId(payload.categoryId);
          setCategoryDetailOpen(true);
          setSelectedTodoId(createdTodo._id);
          setTodoEditorOpen(true);
        },
      });
    },
    [createTodoMutation]
  );

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] border border-[#E0E4EC] bg-[#F4F6FA] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-end">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex size-16 items-center justify-center rounded-2xl border-2 border-dashed border-[#BEC6D7] text-[#8C94A6] transition hover:bg-[#ECF1F9]"
                aria-label="Add category"
              >
                <Plus className="size-7" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl rounded-[30px] border border-[#DAE0EB] bg-[#F5F7FC] p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-center text-[40px]">New Category</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-white" style={{ backgroundColor: newCategoryColor }}>
                  <span className="font-poppins text-[32px] leading-[120%] font-semibold">
                    {newCategoryName.trim() || "Work"}
                  </span>
                </div>

                <Input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Category name"
                  className="h-12"
                />

                <div className="rounded-3xl border border-[#DEE4EF] bg-[#EEF2F8] p-4">
                  <div className="grid grid-cols-10 gap-2 sm:gap-3">
                    {colorPalette.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setNewCategoryColor(color)}
                        className={`size-8 rounded-full border-2 sm:size-10 ${
                          newCategoryColor === color ? "border-[#283040]" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  className="font-poppins h-11 rounded-xl px-6 text-[20px] leading-[120%] font-medium"
                  onClick={() => createCategoryMutation.mutate()}
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending ? "Adding..." : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[26px] border border-[#D8DEE8] bg-[#F0F3F8] p-4">
            <h2 className="font-poppins mb-3 flex items-center gap-2 text-[20px] leading-[120%] font-medium text-[#2F3542]">
              <CalendarClock className="size-5" />
              Scheduled
            </h2>

            {scheduledQuery.isLoading ? (
              <SectionLoading rows={4} />
            ) : scheduledQuery.data?.length ? (
              <div className="space-y-2">
                {scheduledQuery.data.slice(0, 4).map((todo) => (
                  <div key={todo._id} className="rounded-xl bg-white px-3 py-2">
                    <p className="font-poppins text-[14px] leading-[120%] text-[#8D95A7]">
                      {todo.scheduledDate
                        ? formatDistanceToNowStrict(new Date(todo.scheduledDate), { addSuffix: true })
                        : "No date"}
                    </p>
                    <p className="font-poppins text-[20px] leading-[120%] font-medium text-[#3D4351]">{todo.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No scheduled" description="Set date from todo settings." />
            )}
          </aside>

          <div className="space-y-4">
            {categoriesQuery.isLoading ? (
              <SectionLoading rows={8} />
            ) : paged.items.length ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paged.items.map((category) => (
                    <CategoryCard
                      key={category._id}
                      category={category}
                      onOpen={(categoryId) => {
                        setSelectedCategoryId(categoryId);
                        setCategoryDetailOpen(true);
                      }}
                      onCreateTodo={({ categoryId, text }) =>
                        handleCreateTodo(
                          {
                            categoryId,
                            text,
                          },
                          true
                        )
                      }
                      onToggle={({ id, isCompleted }) =>
                        toggleTodoMutation.mutate({ id, isCompleted })
                      }
                    />
                  ))}
                </div>
                <PaginationControls page={paged.page} totalPages={paged.totalPages} onPageChange={setPage} />
              </>
            ) : (
              <EmptyState title="No categories" description="Click + to create your first category." />
            )}
          </div>
        </div>
      </section>

      <Dialog open={categoryDetailOpen} onOpenChange={setCategoryDetailOpen}>
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
                      className="size-5 rounded-full border border-[#C5CBD6]"
                      onClick={() =>
                        toggleTodoMutation.mutate({
                          id: item._id,
                          isCompleted: !item.isCompleted,
                        })
                      }
                      aria-label={`Toggle ${item.text}`}
                    />
                    <span className="flex-1 truncate text-[30px] leading-[120%] text-[#4B505A] sm:text-[32px]">
                      {item.text}
                    </span>
                    <div className="flex items-center gap-1 text-[#B5BBC8]">
                      {item.scheduledDate ? (
                        <span className="inline-flex items-center gap-1 text-[11px] leading-none">
                          <CalendarDays className="size-4" />
                          {format(new Date(item.scheduledDate), "dd MMM")}
                        </span>
                      ) : null}
                      {item.alarm ? <Bell className="size-4" /> : null}
                      {item.repeat ? <Repeat2 className="size-4" /> : null}
                      <button
                        type="button"
                        className="inline-flex items-center justify-center"
                        aria-label={`Edit ${item.text}`}
                        onClick={() => {
                          setSelectedTodoId(item._id);
                          setTodoEditorOpen(true);
                        }}
                      >
                        <SlidersHorizontal className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center"
                        aria-label={`Delete ${item.text}`}
                        onClick={() => {
                          setDeleteTargetTodoId(item._id);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form
                className="mt-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!detailNewText.trim() || !selectedCategory) {
                    return;
                  }
                  handleCreateTodo(
                    {
                      categoryId: selectedCategory._id,
                      text: detailNewText.trim(),
                    },
                    true
                  );
                  setDetailNewText("");
                }}
              >
                <Input
                  value={detailNewText}
                  onChange={(event) => setDetailNewText(event.target.value)}
                  placeholder="New todo"
                  className="h-10 rounded-lg border-none bg-transparent px-7 text-[30px] leading-[120%] text-[#707784] placeholder:text-[#C9CED8] sm:text-[32px]"
                />
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={todoEditorOpen} onOpenChange={setTodoEditorOpen}>
        <DialogContent className="max-w-[820px] rounded-[30px] border border-[#DDE3EC] bg-[#F7F8FB] p-4 sm:p-5">
          <div className="rounded-[30px] border border-[#E1E5ED] bg-[#F3F5F9] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-[#4A505A]">
              <button
                type="button"
                aria-label="Back to category"
                onClick={() => setTodoEditorOpen(false)}
                className="inline-flex items-center justify-center text-[#8E95A4]"
              >
                <ChevronLeft className="size-5" />
              </button>
              <Input
                value={todoText}
                onChange={(event) => setTodoText(event.target.value)}
                className="h-10 border-none bg-transparent px-0 text-[36px] leading-[120%] text-[#4A505A] shadow-none"
              />
            </div>

            <div className="space-y-3 text-[#C0C6D1]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <CalendarDays className="size-5" />
                  <span>Date</span>
                </div>
                <Switch checked={dateEnabled} onCheckedChange={setDateEnabled} />
              </div>
              {dateEnabled ? (
                <Input
                  type="date"
                  value={scheduledDateInput}
                  onChange={(event) => setScheduledDateInput(event.target.value)}
                  className="h-10 border-[#D5DBE6] bg-white text-[#5A6070]"
                />
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <Clock3 className="size-5" />
                  <span>Time</span>
                </div>
                <Switch checked={timeEnabled} onCheckedChange={setTimeEnabled} />
              </div>
              {timeEnabled ? (
                <Input
                  type="time"
                  value={scheduledTimeInput}
                  onChange={(event) => setScheduledTimeInput(event.target.value)}
                  className="h-10 border-[#D5DBE6] bg-white text-[#5A6070]"
                />
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <Bell className="size-5" />
                  <span>Alarm</span>
                </div>
                <Switch checked={alarmEnabled} onCheckedChange={setAlarmEnabled} />
              </div>
              {alarmEnabled ? (
                <Input
                  type="datetime-local"
                  value={alarmDateTimeInput}
                  onChange={(event) => setAlarmDateTimeInput(event.target.value)}
                  className="h-10 border-[#D5DBE6] bg-white text-[#5A6070]"
                />
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[30px] leading-[120%]">
                  <Repeat2 className="size-5" />
                  <span>Repeat</span>
                </div>
                <Switch checked={repeatEnabled} onCheckedChange={setRepeatEnabled} />
              </div>
              {repeatEnabled ? (
                <select
                  value={repeatValue}
                  onChange={(event) =>
                    setRepeatValue(event.target.value as "daily" | "weekly" | "monthly" | "yearly")
                  }
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
                onClick={() => {
                  if (!selectedTodoId) {
                    return;
                  }
                  setDeleteTargetTodoId(selectedTodoId);
                  setDeleteConfirmOpen(true);
                }}
                disabled={deleteTodoMutation.isPending}
              >
                <Trash2 className="size-4" />
                {deleteTodoMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-[#B4BAC7] hover:text-[#8D94A3]"
                onClick={() => {
                  if (!selectedTodoId) {
                    return;
                  }

                  const payload: Parameters<typeof todoItemApi.update>[1] = {
                    text: todoText.trim() || selectedTodo?.text || "",
                    scheduledDate: dateEnabled && scheduledDateInput ? new Date(`${scheduledDateInput}T00:00:00`).toISOString() : null,
                    scheduledTime: timeEnabled && scheduledTimeInput ? scheduledTimeInput : null,
                    alarm: alarmEnabled && alarmDateTimeInput ? new Date(alarmDateTimeInput).toISOString() : null,
                    repeat: repeatEnabled ? repeatValue : null,
                  };

                  updateTodoMutation.mutate({ id: selectedTodoId, payload });
                }}
                disabled={updateTodoMutation.isPending}
              >
                {updateTodoMutation.isPending ? "Saving..." : "Done"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md rounded-3xl border border-[#DDE3EC] bg-[#F7F8FB]">
          <DialogHeader>
            <DialogTitle className="text-[28px]">Delete Todo?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="mt-2 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTargetTodoId(null);
              }}
            >
              No
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!deleteTargetTodoId) {
                  return;
                }
                deleteTodoMutation.mutate(deleteTargetTodoId);
              }}
              disabled={deleteTodoMutation.isPending}
            >
              {deleteTodoMutation.isPending ? "Deleting..." : "Yes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
