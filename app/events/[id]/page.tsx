"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import {
  ArrowLeft,
  Bell,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  ImagePlus,
  Link2,
  Locate,
  Paperclip,
  Share2,
  Trash2,
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
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { BrickIcon } from "@/components/shared/brick-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionLoading } from "@/components/shared/section-loading";
import { MessageComposer } from "./_components/message-composer";
import { TodoSection } from "./_components/todo-section";
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

function mapParticipants(participants: EventData["participants"]) {
  const mapped = participants
    .map((participant) => (typeof participant === "string" ? null : participant))
    .filter((participant): participant is NonNullable<typeof participant> => Boolean(participant));

  const seen = new Set<string>();
  return mapped.filter((participant) => {
    if (seen.has(participant._id)) {
      return false;
    }
    seen.add(participant._id);
    return true;
  });
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

function sortMessagesByCreatedAt(messages: JamMessage[]) {
  return [...messages].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function appendMessageIfMissing(messages: JamMessage[], next: JamMessage) {
  if (messages.some((message) => message._id === next._id)) {
    return messages;
  }

  return sortMessagesByCreatedAt([...messages, next]);
}

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const id = params.id;

  const [newTodoText, setNewTodoText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>(undefined);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jamView, setJamView] = useState<"jam" | "messages" | "media">("jam");
  const [libraryTab, setLibraryTab] = useState<"media" | "files" | "link">("media");
  const socketRef = React.useRef<Socket | null>(null);
  const socketServerUrl = React.useMemo(
    () =>
      (
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXTPUBLICBASEURL ||
        ""
      ).replace(/\/+$/, ""),
    [],
  );

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

  React.useEffect(() => {
    if (!id || !socketServerUrl) {
      return;
    }

    const socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const handleConnect = () => {
      socket.emit("joinEventRoom", id);
    };

    const handleNewMessage = (message: JamMessage) => {
      queryClient.setQueryData<JamMessage[]>(
        queryKeys.jamMessages(id),
        (previous = []) => appendMessageIfMissing(previous, message),
      );
    };

    const handleDeleteMessage = (messageId: string) => {
      queryClient.setQueryData<JamMessage[]>(
        queryKeys.jamMessages(id),
        (previous = []) =>
          previous.filter((message) => message._id !== messageId),
      );
    };

    socket.on("connect", handleConnect);
    socket.on("newMessage", handleNewMessage);
    socket.on("deleteMessage", handleDeleteMessage);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("newMessage", handleNewMessage);
      socket.off("deleteMessage", handleDeleteMessage);
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [id, queryClient, socketServerUrl]);

  React.useEffect(() => {
    setShareUrl(window.location.href);
  }, [id]);

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
    onSuccess: () => {
      setNewTodoText("");
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
    onSuccess: (message) => {
      setMessageText("");
      setSelectedFile(null);
      queryClient.setQueryData<JamMessage[]>(
        queryKeys.jamMessages(id),
        (previous = []) => appendMessageIfMissing(previous, message),
      );
    },
    onError: (error: Error) => toast.error(error.message || "Failed to send message"),
  });

  const event = eventQuery.data;
  const participants = useMemo(() => mapParticipants(event?.participants || []), [event?.participants]);

  if (eventQuery.isLoading) {
    return <SectionLoading rows={6} />;
  }

  if (!event) {
    return <EmptyState title="Event not found" description="The event was removed or you don't have access." />;
  }

  const messages = messagesQuery.data || [];
  const privateTodos = (eventTodosQuery.data || []).filter((todo) => !todo.isShared);
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
  const shareMessage = `Join "${event.title}" on Zenolok`;
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedShareMessage = encodeURIComponent(shareMessage);
  const socialLinks = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedShareMessage}%20${encodedShareUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedShareMessage}&url=${encodedShareUrl}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedShareMessage}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}` },
  ];

  const handleCopyShareLink = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl || typeof navigator === "undefined" || !navigator.share) {
      return;
    }

    try {
      await navigator.share({
        title: event.title,
        text: shareMessage,
        url: shareUrl,
      });
    } catch {
      // Ignore cancellation or unsupported browser behavior.
    }
  };

  return (
    <div className="space-y-3 ">
      <div className=" flex items-center justify-between pt-1">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[12px] text-[#4D5463]"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-1 text-[#FF3B30] transition hover:bg-[#FFECEC]"
            onClick={() => deleteEventMutation.mutate()}
            aria-label="Delete event"
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            className="rounded-full p-1 text-[#0088FF] transition hover:bg-[#E8F4FF]"
            onClick={() => router.back()}
            aria-label="Done"
          >
            <CalendarCheck2 className="size-4" />
          </button>
        </div>
      </div>

      <section className=" rounded-[16px] border border-[#E4E9F1] bg-[#F6F8FB] p-2">
        <div className="rounded-[14px] border border-[#D8DEE8] bg-[#ECEFF4] p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-start gap-2">
                <span className="mt-1 block h-6 w-1 rounded-sm bg-[#32ADE6]" />
                <p className="truncate text-[25px] font-medium leading-tight text-[#4D4D4D]">
                  {event.title}
                </p>
              </div>
              <div className="mt-1.5 pl-3">
                {event.brick ? (
                  <Badge
                    variant="blue"
                    className="rounded-full px-2.5 py-0 text-[11px]"
                    style={{ backgroundColor: event.brick.color }}
                  >
                    <BrickIcon name={event.brick.icon} className="size-3.5" />{" "}
                    {event.brick.name}
                  </Badge>
                ) : null}
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-[#6F7789] transition hover:text-[#2E333B]"
                  aria-label="Share event"
                >
                  <Share2 className="size-[16px]" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg rounded-[26px]">
                <DialogHeader>
                  <DialogTitle>Share on social media</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#DFE3EC] bg-[#F8FAFD] px-3 py-2 text-sm text-[#687083]">
                    {shareUrl || "Preparing link..."}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={handleCopyShareLink}
                      disabled={!shareUrl}
                    >
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={handleNativeShare}
                      disabled={!shareUrl || typeof navigator === "undefined" || !navigator.share}
                    >
                      Quick Share
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {socialLinks.map((platform) => (
                      <a
                        key={platform.label}
                        href={platform.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-[#D7DDE8] bg-white px-3 text-sm text-[#4C5463] transition hover:bg-[#F1F5FB]"
                      >
                        {platform.label}
                      </a>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-4 flex items-start justify-between gap-3 text-[#4D4D4D]">
            <div className="space-y-2.5">
              <button
                type="button"
                className="flex items-center gap-2 text-left"
                onClick={() => {
                  setSelectedDates({
                    from: new Date(event.startTime),
                    to: new Date(event.endTime),
                  });
                  setDateDialogOpen(true);
                }}
              >
                <CalendarDays className="size-4 text-[#8C93A2]" />
                <p className="text-[13px] font-medium tracking-[0.02em] text-[#5A6272]">
                  {format(startDate, "dd MMM yyyy").toUpperCase()}
                </p>
              </button>
              <p className="flex items-center gap-2 text-[13px] text-[#5A6272]">
                <Clock3 className="size-4 text-[#8C93A2]" />
                {event.isAllDay
                  ? "All day"
                  : `${format(startDate, "hh:mm a")} - ${format(
                      endDate,
                      "hh:mm a",
                    )}`}
              </p>
              <p className="flex items-center gap-2 text-[13px] text-[#5A6272]">
                <Locate className="size-4 text-[#8C93A2]" />
                {event.location || "No location"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                className="rounded-full p-1 text-[#7E8696] transition hover:bg-white"
                aria-label="Notification"
              >
                <Bell className="size-4" />
              </button>
              <Badge
                variant="neutral"
                className="rounded-full border border-[#7E8696] bg-transparent px-2.5 py-0 text-[11px] text-[#4D4D4D]"
              >
                {event.isAllDay ? "All day" : "Scheduled"}
              </Badge>
            </div>
          </div>
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
          <div className="mt-3 space-y-3">
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
            {/* <TodoSection
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
            /> */}
          </div>
        ) : null}

        <Card className="mt-3 rounded-[22px] border border-[#DCE2EB] bg-[#ECEFF4] p-3.5 shadow-none">
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

          {jamView === "jam" ? (
            <div className="mb-2 flex items-center justify-end">
              <button
                type="button"
                className="rounded-full p-1 text-[#8E95A3] transition hover:bg-white"
                onClick={() => {
                  setLibraryTab("media");
                  setJamView("media");
                }}
                aria-label="Open media files and links"
              >
                <ImagePlus className="size-4" />
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
                    <div key={message._id} className="space-y-1">
                      <div className="flex items-end justify-between gap-2">
                        <p
                          className={`text-[11px] ${
                            getDisplayNameFromMessage(message) === "Me"
                              ? "text-[#32ADE6]"
                              : "text-[#4D4D4D]"
                          }`}
                        >
                          {getDisplayNameFromMessage(message)}
                        </p>
                        <p className="text-[9px] text-[#B3B9C6]">
                          {formatMessageStamp(message.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-1.5 text-[12px] text-[#4D4D4D]">
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
            <div className="mt-3 flex items-center justify-center">
              <button
                type="button"
                className="flex items-center gap-1 rounded-full border border-[#D6DCE8] bg-white px-3 py-0.5 text-[12px] text-[#AAB0BC]"
                onClick={() => setJamView("messages")}
              >
                Let&apos;s JAM
                <ArrowLeft className="size-3 rotate-90" />
              </button>
            </div>
          ) : null}
        </Card>

        <div className="mt-2 flex items-center gap-2">
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
