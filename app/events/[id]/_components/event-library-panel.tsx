"use client";

import Image from "next/image";
import { ArrowLeft, Link2, Paperclip } from "lucide-react";

import type { JamMessage } from "@/lib/api";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMessageStamp, getMessageLabel } from "./event-detail-helpers";

type EventLibraryTab = "media" | "files" | "link";

type EventLibraryPanelProps = {
  libraryTab: EventLibraryTab;
  onLibraryTabChange: (tab: EventLibraryTab) => void;
  mediaMessages: JamMessage[];
  fileMessages: JamMessage[];
  linkMessages: JamMessage[];
  use24Hour: boolean;
  onBackToJam: () => void;
};

export function EventLibraryPanel({
  libraryTab,
  onLibraryTabChange,
  mediaMessages,
  fileMessages,
  linkMessages,
  use24Hour,
  onBackToJam,
}: EventLibraryPanelProps) {
  return (
    <>
      <div className="mb-3 flex items-center gap-2 text-[var(--text-muted)]">
        <button
          type="button"
          className="rounded-full p-1 transition hover:bg-[var(--surface-3)]"
          onClick={onBackToJam}
          aria-label="Back to JAM"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="grid flex-1 grid-cols-3 rounded-full bg-[var(--surface-3)] p-1 text-sm">
          {(["media", "files", "link"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-full px-2 py-1 capitalize transition ${
                tab === libraryTab
                  ? "bg-[var(--surface-1)] text-[var(--text-strong)]"
                  : "text-[var(--text-muted)]"
              }`}
              onClick={() => onLibraryTabChange(tab)}
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
              <div
                key={message._id}
                className="overflow-hidden rounded-sm bg-[var(--surface-1)]"
              >
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
                  <div className="flex h-[88px] items-center justify-center px-2 text-center text-xs text-[var(--text-muted)]">
                    {getMessageLabel(message)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No media"
            description="Attach photos in chat and they will show here."
          />
        )
      ) : null}

      {libraryTab === "files" ? (
        fileMessages.length ? (
          <div className="max-h-[460px] space-y-2 overflow-auto">
            {fileMessages.map((message) => (
              <div
                key={message._id}
                className="flex items-center justify-between rounded-xl bg-[var(--surface-1)] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-[var(--text-strong)]">
                    {message.fileName || getMessageLabel(message)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatMessageStamp(message.createdAt, use24Hour)}
                  </p>
                </div>
                <Paperclip className="size-4 text-[var(--text-muted)]" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No files"
            description="Uploaded files from chat will appear here."
          />
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
                  className="flex items-center justify-between rounded-xl bg-[var(--surface-1)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[var(--text-strong)]">
                      {linkValue || "Link"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatMessageStamp(message.createdAt, use24Hour)}
                    </p>
                  </div>
                  <Link2 className="size-4 text-[var(--text-muted)]" />
                </a>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No links"
            description="Links shared in messages will appear here."
          />
        )
      ) : null}
    </>
  );
}
