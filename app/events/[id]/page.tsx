"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  ImagePlus,
  Link2,
  Locate,
  Paperclip,
  Plus,
  Send,
  Share2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

import {
  eventApi,
  eventTodoApi,
  jamApi,
  type EventData,
  type EventTodo,
  type JamMessage,
  userApi,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { BrickIcon } from "@/components/shared/brick-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionLoading } from "@/components/shared/section-loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function mapParticipants(participants: EventData["participants"]) {
  return participants
    .map((participant) => (typeof participant === "string" ? null : participant))
    .filter((participant): participant is NonNullable<typeof participant> => Boolean(participant));
}

function getParticipantDisplayName(participant: { name?: string; username?: string; email?: string }) {
  return participant.name || participant.username || participant.email || "User";
}

function isLinkText(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

function getDisplayNameFromMessage(message: JamMessage) {
  return message.user.name || "User";
}

function formatMessageStamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return format(date, "hh:mm a");
}

function getMessageLabel(message: JamMessage) {
  return message.text || message.fileName || (message.messageType === "link" ? "Link" : "Media");
}

type TodoSectionProps = {
  todos: EventTodo[];
  title: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onToggle: (todo: EventTodo) => void;
  onDelete: (todoId: string) => void;
};

function TodoSection({
  todos,
  title,
  inputValue,
  onInputChange,
  onAdd,
  onToggle,
  onDelete,
}: TodoSectionProps) {
  return (
    <Card className="rounded-[30px] border-none bg-[#ECEEF2] px-4 py-3 shadow-none">
      <p className="text-[13px] text-[#A0A5AF]">{title}</p>
      {todos.length ? (
        <div className="mt-2 space-y-2">
          {todos.map((todo) => (
            <div key={todo._id} className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2">
              <button
                type="button"
                className={`size-4 rounded-full border ${
                  todo.isCompleted ? "border-[#32ADE6] bg-[#32ADE6]" : "border-[#A9AFBC] bg-transparent"
                }`}
                onClick={() => onToggle(todo)}
              />
              <p className={`min-w-0 flex-1 truncate text-sm ${todo.isCompleted ? "text-[#9DA3AF] line-through" : "text-[#4D4D4D]"}`}>
                {todo.text}
              </p>
              <button
                type="button"
                className="text-[#9EA5B2] transition hover:text-[#E94B3C]"
                onClick={() => onDelete(todo._id)}
                aria-label="Delete todo"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <div className="h-3.5 w-28 rounded-full bg-[#DFE2E8]" />
          <div className="h-px w-full bg-[#DBDFE6]" />
          <div className="h-3.5 w-24 rounded-full bg-[#DFE2E8]" />
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
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
          className="h-8 rounded-full border-none bg-white text-sm"
        />
        <button
          type="button"
          onClick={onAdd}
          className="flex size-8 items-center justify-center rounded-full bg-white text-[#6C7384]"
          aria-label="Add todo"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </Card>
  );
}

type MessageComposerProps = {
  messageText: string;
  onMessageChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  selectedFileName?: string;
  onSend: () => void;
  isSending: boolean;
};

function MessageComposer({
  messageText,
  onMessageChange,
  onFileChange,
  selectedFileName,
  onSend,
  isSending,
}: MessageComposerProps) {
  return (
    <div className="space-y-2">
      {selectedFileName ? (
        <div className="rounded-xl bg-white px-3 py-2 text-xs text-[#6B7384]">{selectedFileName}</div>
      ) : null}
      <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1">
        <label className="cursor-pointer px-1 text-[#939AA7]">
          <ImagePlus className="size-5" />
          <input
            type="file"
            className="hidden"
            onChange={(event) => onFileChange(event.target.files?.[0] || null)}
          />
        </label>
        <Input
          value={messageText}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="Type here..."
          className="h-9 rounded-full border-none bg-transparent text-sm"
        />
        <button
          type="button"
          className="rounded-full p-1 text-[#32ADE6] disabled:opacity-40"
          onClick={onSend}
          disabled={isSending}
          aria-label="Send message"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const id = params.id;

  const [newTodoText, setNewTodoText] = useState("");
  const [newSharedTodoText, setNewSharedTodoText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>(undefined);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jamView, setJamView] = useState<"jam" | "messages" | "media">("jam");
  const [libraryTab, setLibraryTab] = useState<"media" | "files" | "link">("media");

  const eventQuery = useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => eventApi.getById(id),
    enabled: Boolean(id),
  });

  const eventTodosQuery = useQuery({
    queryKey: queryKeys.eventTodos(id),
    queryFn: () => eventTodoApi.getByEvent(id),
    enabled: Boolean(id),
  });

  const messagesQuery = useQuery({
    queryKey: queryKeys.jamMessages(id),
    queryFn: () => jamApi.getByEvent(id),
    enabled: Boolean(id),
  });

  const userSearchQuery = useQuery({
    queryKey: queryKeys.userSearch(userSearch),
    queryFn: () => userApi.searchUsers(userSearch),
    enabled: userSearch.length > 1,
  });

  const refreshEverything = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.event(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.eventTodos(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.events({ filter: "upcoming" }) });
    queryClient.invalidateQueries({ queryKey: queryKeys.events({ filter: "past" }) });
    queryClient.invalidateQueries({ queryKey: queryKeys.events({ filter: "all" }) });
    queryClient.invalidateQueries({ queryKey: queryKeys.jamMessages(id) });
  };

  const deleteEventMutation = useMutation({
    mutationFn: () => eventApi.delete(id),
    onSuccess: () => {
      toast.success("Event deleted");
      router.push("/events");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete event"),
  });

  const updateEventMutation = useMutation({
    mutationFn: (payload: Partial<EventData>) => eventApi.update(id, payload),
    onSuccess: () => {
      toast.success("Event updated");
      refreshEverything();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update event"),
  });

  const addTodoMutation = useMutation({
    mutationFn: ({ text, isShared }: { text: string; isShared?: boolean }) => {
      if (!text.trim()) {
        throw new Error("Todo text is required");
      }

      return eventTodoApi.create({
        text: text.trim(),
        eventId: id,
        isShared: Boolean(isShared),
      });
    },
    onSuccess: (_, variables) => {
      if (variables.isShared) {
        setNewSharedTodoText("");
      } else {
        setNewTodoText("");
      }
      refreshEverything();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add todo"),
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ todoId, payload }: { todoId: string; payload: Partial<EventTodo> }) =>
      eventTodoApi.update(todoId, payload),
    onSuccess: refreshEverything,
    onError: (error: Error) => toast.error(error.message || "Failed to update todo"),
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (todoId: string) => eventTodoApi.delete(todoId),
    onSuccess: refreshEverything,
    onError: (error: Error) => toast.error(error.message || "Failed to delete todo"),
  });

  const sendMessageMutation = useMutation({
    mutationFn: () => {
      if (!messageText.trim() && !selectedFile) {
        throw new Error("Write a message or attach a file");
      }

      const nextText = messageText.trim();
      let messageType: "text" | "media" | "file" | "link" = "text";

      if (selectedFile) {
        messageType = selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/") ? "media" : "file";
      } else if (nextText && isLinkText(nextText)) {
        messageType = "link";
      }

      const form = new FormData();
      form.append("eventId", id);
      if (nextText) {
        form.append("text", nextText);
      }
      form.append("messageType", messageType);

      if (selectedFile) {
        form.append("file", selectedFile);
      }

      return jamApi.create(form);
    },
    onSuccess: () => {
      setMessageText("");
      setSelectedFile(null);
      refreshEverything();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to send message"),
  });

  const event = eventQuery.data;
  const participants = useMemo(() => mapParticipants(event?.participants || []), [event?.participants]);

  const addParticipantMutation = useMutation({
    mutationFn: (userId: string) => {
      if (!event) {
        throw new Error("Event not loaded yet");
      }

      const currentIds = event.participants.map((participant) =>
        typeof participant === "string" ? participant : participant._id
      );

      if (currentIds.includes(userId)) {
        throw new Error("User already added");
      }

      return eventApi.update(id, {
        participants: [...currentIds, userId],
      });
    },
    onSuccess: () => {
      toast.success("Participant added");
      refreshEverything();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add participant"),
  });

  if (eventQuery.isLoading) {
    return <SectionLoading rows={6} />;
  }

  if (!event) {
    return <EmptyState title="Event not found" description="The event was removed or you don't have access." />;
  }

  const messages = messagesQuery.data || [];
  const privateTodos = (eventTodosQuery.data || []).filter((todo) => !todo.isShared);
  const sharedTodos = (eventTodosQuery.data || []).filter((todo) => todo.isShared);
  const mediaMessages = messages.filter((message) => message.messageType === "media" || Boolean(message.mediaUrl));
  const fileMessages = messages.filter(
    (message) =>
      message.messageType === "file" ||
      (!message.mediaUrl && Boolean(message.fileName) && message.messageType !== "link")
  );
  const linkMessages = messages.filter(
    (message) => message.messageType === "link" || isLinkText(message.text || "")
  );
  const jamPreviewMessages = messages.slice(-2);
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);

  return (
    <div className="mx-auto w-full max-w-[430px] space-y-3 pb-8">
      <div className="flex items-center justify-between px-1">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#4D4D4D]">
          <ArrowLeft className="size-5" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-[#FF3B30]"
            onClick={() => deleteEventMutation.mutate()}
            aria-label="Delete event"
          >
            <Trash2 className="size-5" />
          </button>
          <button type="button" className="text-[#0088FF]" onClick={() => router.back()} aria-label="Done">
            <CalendarCheck2 className="size-5" />
          </button>
        </div>
      </div>

      <section className="rounded-[34px] border border-[#DEE3EC] bg-[#F4F6FA] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-start gap-2.5">
              <span className="mt-1 block h-7 w-1.5 rounded-sm bg-[#32ADE6]" />
              <p className="truncate text-[34px] font-medium leading-none text-[#4D4D4D]">{event.title}</p>
            </div>
            <div className="mt-2 pl-4">
              {event.brick ? (
                <Badge
                  variant="blue"
                  className="rounded-full px-2.5 py-0.5 text-sm"
                  style={{ backgroundColor: event.brick.color }}
                >
                  <BrickIcon name={event.brick.icon} className="size-3.5" /> {event.brick.name}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {participants.slice(0, 4).map((participant) => (
              <Avatar key={participant._id} className="-ml-2 size-6 border border-white first:ml-0">
                <AvatarImage src={participant.avatar?.url} />
                <AvatarFallback>{getParticipantDisplayName(participant).slice(0, 1)}</AvatarFallback>
              </Avatar>
            ))}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="ml-1 text-[#6F7789] hover:text-[#2E333B]"
                  aria-label="Share event"
                >
                  <Share2 className="size-[18px]" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl rounded-[26px]">
                <DialogHeader>
                  <DialogTitle>Share tasks with others.</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Search by name..."
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  className="h-12"
                />
                <div className="max-h-[320px] space-y-2 overflow-auto rounded-xl border border-[#DFE3EC] bg-[#F8FAFD] p-2">
                  {userSearchQuery.data?.map((user) => (
                    <div key={user._id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={user.avatar?.url} />
                          <AvatarFallback>{getParticipantDisplayName(user).slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <span>{getParticipantDisplayName(user)}</span>
                      </div>
                      <button className="text-[#80889A]" onClick={() => addParticipantMutation.mutate(user._id)}>
                        <UserPlus className="size-4" />
                      </button>
                    </div>
                  ))}
                  {!userSearchQuery.data?.length ? <p className="p-3 text-sm text-[#8A91A1]">No user found.</p> : null}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-[#4D4D4D]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-2 text-left"
              onClick={() => {
                setSelectedDates({ from: new Date(event.startTime), to: new Date(event.endTime) });
                setDateDialogOpen(true);
              }}
            >
              <CalendarDays className="size-4 text-[#8C93A2]" />
              <div>
                <p className="text-xs text-[#B8BDC8]">{format(startDate, "EEEE")}</p>
                <p className="text-[26px] leading-none">{format(startDate, "dd MMM yyyy").toUpperCase()}</p>
              </div>
            </button>
            <Badge variant="neutral" className="rounded-full border border-[#4D4D4D] bg-transparent px-2.5 py-0.5 text-sm text-[#4D4D4D]">
              {event.isAllDay ? "All day" : "Scheduled"}
            </Badge>
          </div>
          <p className="flex items-center gap-2 text-[31px] leading-none">
            <Clock3 className="size-4 text-[#8C93A2]" />
            {event.isAllDay ? "All day" : `${format(startDate, "hh:mm a")} - ${format(endDate, "hh:mm a")}`}
          </p>
          <p className="flex items-center gap-2 text-[31px] leading-none">
            <Locate className="size-4 text-[#8C93A2]" />
            {event.location || "No location"}
          </p>
        </div>

        <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
          <DialogContent className="max-w-md rounded-[26px]">
            <DialogHeader>
              <DialogTitle>Choose a date</DialogTitle>
            </DialogHeader>
            <Calendar
              mode="range"
              selected={selectedDates}
              onSelect={(range) => {
                setSelectedDates(range);
              }}
            />
            <DialogFooter>
              <Button
                onClick={() => {
                  if (!selectedDates?.from) {
                    toast.error("Please select at least start date");
                    return;
                  }

                  updateEventMutation.mutate({
                    startTime: selectedDates.from.toISOString(),
                    endTime: (selectedDates.to || selectedDates.from).toISOString(),
                  });
                  setDateDialogOpen(false);
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {jamView === "jam" ? (
          <div className="mt-4 space-y-4">
            <TodoSection
              todos={privateTodos}
              title="New todo"
              inputValue={newTodoText}
              onInputChange={setNewTodoText}
              onAdd={() => addTodoMutation.mutate({ text: newTodoText })}
              onToggle={(todo) =>
                updateTodoMutation.mutate({
                  todoId: todo._id,
                  payload: { isCompleted: !todo.isCompleted },
                })
              }
              onDelete={(todoId) => deleteTodoMutation.mutate(todoId)}
            />
            <TodoSection
              todos={sharedTodos}
              title="New shared todo"
              inputValue={newSharedTodoText}
              onInputChange={setNewSharedTodoText}
              onAdd={() => addTodoMutation.mutate({ text: newSharedTodoText, isShared: true })}
              onToggle={(todo) =>
                updateTodoMutation.mutate({
                  todoId: todo._id,
                  payload: { isCompleted: !todo.isCompleted },
                })
              }
              onDelete={(todoId) => deleteTodoMutation.mutate(todoId)}
            />
          </div>
        ) : null}

        <Card className="mt-4 rounded-[32px] border-none bg-[#ECEEF2] p-4 shadow-none">
          {jamView === "messages" ? (
            <div className="mb-3 flex items-center justify-between text-[#8E95A3]">
              <button
                type="button"
                className="rounded-full p-1 transition hover:bg-white"
                onClick={() => setJamView("jam")}
                aria-label="Back to jam"
              >
                <ArrowLeft className="size-5" />
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs transition hover:bg-white"
                onClick={() => {
                  setLibraryTab("media");
                  setJamView("media");
                }}
              >
                Media, files, link
              </button>
            </div>
          ) : null}

          {jamView === "media" ? (
            <>
              <div className="mb-3 flex items-center gap-2 text-[#8E95A3]">
                <button
                  type="button"
                  className="rounded-full p-1 transition hover:bg-white"
                  onClick={() => setJamView("messages")}
                  aria-label="Back to messages"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className="grid flex-1 grid-cols-3 rounded-full bg-[#E4E7ED] p-1 text-sm">
                  {(["media", "files", "link"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`rounded-full px-2 py-1 capitalize transition ${
                        tab === libraryTab ? "bg-white text-[#4D4D4D]" : "text-[#9AA1AE]"
                      }`}
                      onClick={() => setLibraryTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {libraryTab === "media" ? (
                mediaMessages.length ? (
                  <div className="grid max-h-[460px] grid-cols-4 gap-1 overflow-auto">
                    {mediaMessages.map((message) => (
                      <div key={message._id} className="overflow-hidden rounded-sm bg-white">
                        {message.mediaUrl ? (
                          <Image
                            src={message.mediaUrl}
                            alt={message.fileName || "media"}
                            width={120}
                            height={90}
                            className="h-[88px] w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-[88px] items-center justify-center px-2 text-center text-xs text-[#8B93A2]">
                            {getMessageLabel(message)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No media" description="Attach photos in chat and they will show here." />
                )
              ) : null}

              {libraryTab === "files" ? (
                fileMessages.length ? (
                  <div className="max-h-[460px] space-y-2 overflow-auto">
                    {fileMessages.map((message) => (
                      <div key={message._id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-[#4D4D4D]">{message.fileName || getMessageLabel(message)}</p>
                          <p className="text-xs text-[#9AA1AE]">{formatMessageStamp(message.createdAt)}</p>
                        </div>
                        <Paperclip className="size-4 text-[#9AA1AE]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No files" description="Uploaded files from chat will appear here." />
                )
              ) : null}

              {libraryTab === "link" ? (
                linkMessages.length ? (
                  <div className="max-h-[460px] space-y-2 overflow-auto">
                    {linkMessages.map((message) => {
                      const linkValue = (message.text || "").trim();
                      return (
                        <a
                          key={message._id}
                          href={linkValue}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl bg-white px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm text-[#4D4D4D]">{linkValue || "Link"}</p>
                            <p className="text-xs text-[#9AA1AE]">{formatMessageStamp(message.createdAt)}</p>
                          </div>
                          <Link2 className="size-4 text-[#9AA1AE]" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState title="No links" description="Links shared in messages will appear here." />
                )
              ) : null}
            </>
          ) : null}

          {jamView === "jam" || jamView === "messages" ? (
            <>
              <div className="max-h-[300px] space-y-3 overflow-auto">
                {messagesQuery.isLoading ? (
                  <SectionLoading rows={3} />
                ) : (jamView === "jam" ? jamPreviewMessages : messages).length ? (
                  (jamView === "jam" ? jamPreviewMessages : messages).map((message) => (
                    <div key={message._id} className="space-y-0.5">
                      <div className="flex items-end justify-between gap-2">
                        <p className={`text-sm ${getDisplayNameFromMessage(message) === "Me" ? "text-[#32ADE6]" : "text-[#4D4D4D]"}`}>
                          {getDisplayNameFromMessage(message)}
                        </p>
                        <p className="text-[10px] text-[#B3B9C6]">{formatMessageStamp(message.createdAt)}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 text-sm text-[#4D4D4D]">
                        {getMessageLabel(message)}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No messages" description="Start chatting with participants." />
                )}
              </div>

              <div className="mt-3">
                <MessageComposer
                  messageText={messageText}
                  onMessageChange={setMessageText}
                  onFileChange={setSelectedFile}
                  selectedFileName={selectedFile?.name}
                  onSend={() => sendMessageMutation.mutate()}
                  isSending={sendMessageMutation.isPending}
                />
              </div>
            </>
          ) : null}

          {jamView === "jam" ? (
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                className="flex items-center gap-1 rounded-full bg-white px-3 py-0.5 text-sm text-[#B7BCC7]"
                onClick={() => setJamView("messages")}
              >
                Let&apos;s JAM
                <ArrowLeft className="size-3 rotate-90" />
              </button>
            </div>
          ) : null}
        </Card>

        <div className="mt-3 flex items-center gap-2">
          {participants.map((participant) => (
            <Avatar key={participant._id} className="size-8 border border-[#d2d8e5]">
              <AvatarImage src={participant.avatar?.url} />
              <AvatarFallback>{getParticipantDisplayName(participant).slice(0, 1)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </section>

      {jamView !== "jam" ? (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            className="rounded-full text-[#80889A]"
            onClick={() => setJamView("jam")}
          >
            <ArrowLeft className="mr-1 size-4" /> Back to JAM
          </Button>
        </div>
      ) : null}
    </div>
  );
}
