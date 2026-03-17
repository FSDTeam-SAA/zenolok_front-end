"use client";

import { ImagePlus, Send } from "lucide-react";

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
      <div className="flex items-end gap-2 rounded-[20px] border border-[#D7DDE7] bg-white px-2.5 py-1.5">
        <label className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-[#B1B7C3] transition hover:bg-[#F1F4F9] hover:text-[#7A8190]">
          <ImagePlus className="size-4" />
          <input
            type="file"
            className="hidden"
            onChange={(event) => onFileChange(event.target.files?.[0] || null)}
          />
        </label>
        <textarea
          value={messageText}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="Type here..."
          rows={1}
          className="min-h-8 max-h-28 w-full resize-none overflow-y-auto rounded border-none bg-transparent px-0 text-[16px] text-[#616772] placeholder:text-[16px] placeholder:text-[#D1D5DD] focus:outline-none"
        />
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded-full text-[#32ADE6] transition hover:bg-[#EAF6FF] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
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
