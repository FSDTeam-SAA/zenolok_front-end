"use client";

import { ImagePlus, Send } from "lucide-react";

import { Input } from "@/components/ui/input";

type MessageComposerProps = {
  messageText: string;
  onMessageChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  selectedFileName?: string;
  onSend: () => void;
  isSending: boolean;
};

export function MessageComposer({
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
        <div className="rounded-xl border border-[#D7DDE7] bg-white px-3 py-2 text-xs text-[#6B7384]">
          {selectedFileName}
        </div>
      ) : null}
      <div className="flex items-center gap-2 rounded-full border border-[#D7DDE7] bg-[#F7F9FC] px-2 py-1">
        <label className="cursor-pointer p-1 text-[#939AA7] transition hover:text-[#667083]">
          <ImagePlus className="size-4" />
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
          className="h-7 rounded-full border-none bg-transparent px-0 text-[13px] placeholder:text-[#B2B9C7]"
        />
        <button
          type="button"
          className="flex size-6 items-center justify-center rounded-full bg-[#E8F4FE] text-[#32ADE6] disabled:opacity-40"
          onClick={onSend}
          disabled={isSending}
          aria-label="Send message"
        >
          <Send className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
