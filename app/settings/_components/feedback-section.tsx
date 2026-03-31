import Image from "next/image";
import { ImagePlus, Video, X } from "lucide-react";

import type { FeedbackData } from "@/lib/api";
import { Button } from "@/components/ui/button";

import { SectionHeader } from "./section-header";

interface FeedbackSectionProps {
  feedbacks: FeedbackData[];
  isFeedbacksLoading: boolean;
  isSubmitting: boolean;
  message: string;
  photos: File[];
  videos: File[];
  onAddPhotos: (files: FileList | null) => void;
  onAddVideos: (files: FileList | null) => void;
  onChangeMessage: (value: string) => void;
  onRemovePhoto: (index: number) => void;
  onRemoveVideo: (index: number) => void;
  onSubmit: () => void;
}

export function FeedbackSection({
  feedbacks,
  isFeedbacksLoading,
  isSubmitting,
  message,
  photos,
  videos,
  onAddPhotos,
  onAddVideos,
  onChangeMessage,
  onRemovePhoto,
  onRemoveVideo,
  onSubmit,
}: FeedbackSectionProps) {
  const hasSelectedMedia = photos.length > 0 || videos.length > 0;

  return (
    <section className="space-y-5">
      <SectionHeader
        title="Feedback"
        description="Send us your feedback and suggestions."
        titleClassName="text-[30px] text-[var(--text-strong)] sm:text-[36px] lg:text-[40px]"
      />

      <div className="w-full settings-action-card rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <textarea
          value={message}
          onChange={(event) => onChangeMessage(event.target.value)}
          placeholder="Type your feedback..."
          className="font-poppins min-h-[180px] w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3 text-[16px] leading-[120%] font-normal text-[var(--text-default)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--ring)]"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                onAddPhotos(event.target.files);
                event.currentTarget.value = "";
              }}
            />
            <span className="font-poppins inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-4 text-[14px] leading-[120%] font-medium text-[var(--text-default)] hover:bg-[var(--surface-3)]">
              <ImagePlus className="size-4" />
              Add Photos ({photos.length}/5)
            </span>
          </label>

          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={(event) => {
                onAddVideos(event.target.files);
                event.currentTarget.value = "";
              }}
            />
            <span className="font-poppins inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-4 text-[14px] leading-[120%] font-medium text-[var(--text-default)] hover:bg-[var(--surface-3)]">
              <Video className="size-4" />
              Add Videos ({videos.length}/5)
            </span>
          </label>
        </div>

        {hasSelectedMedia ? (
          <div className="mt-3 space-y-2">
            {photos.map((file, index) => (
              <div
                key={`${file.name}-${file.lastModified}-photo-${index}`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2"
              >
                <p className="truncate text-[14px] text-[var(--text-default)]">
                  {file.name}
                </p>
                <button
                  type="button"
                  className="rounded-full p-1 text-[var(--text-muted)] transition hover:bg-[var(--surface-3)]"
                  onClick={() => onRemovePhoto(index)}
                  aria-label="Remove photo"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}

            {videos.map((file, index) => (
              <div
                key={`${file.name}-${file.lastModified}-video-${index}`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2"
              >
                <p className="truncate text-[14px] text-[var(--text-default)]">
                  {file.name}
                </p>
                <button
                  type="button"
                  className="rounded-full p-1 text-[var(--text-muted)] transition hover:bg-[var(--surface-3)]"
                  onClick={() => onRemoveVideo(index)}
                  aria-label="Remove video"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            className="font-poppins h-11 rounded-xl px-5 text-[20px] leading-[120%] font-medium"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </div>

      <div className="w-full settings-action-card rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
        <p className="font-poppins text-[20px] leading-[120%] font-medium text-[var(--text-strong)]">
          Previous Feedback
        </p>

        {isFeedbacksLoading ? (
          <p className="mt-2 text-[14px] text-[var(--text-muted)]">
            Loading feedback...
          </p>
        ) : feedbacks.length ? (
          <div className="mt-3 space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3"
              >
                <p className="text-[15px] text-[var(--text-default)]">
                  {feedback.message}
                </p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                  {new Date(feedback.createdAt).toLocaleString()}
                </p>

                {feedback.photos.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {feedback.photos.map((photo, index) => (
                      <Image
                        key={`${photo.public_id || photo.url}-photo-${index}`}
                        src={photo.url}
                        alt={`Feedback photo ${index + 1}`}
                        width={160}
                        height={96}
                        unoptimized
                        className="h-24 w-full rounded-lg border border-[var(--border)] object-cover"
                      />
                    ))}
                  </div>
                ) : null}

                {feedback.videos.length ? (
                  <div className="mt-3 space-y-2">
                    {feedback.videos.map((video, index) => (
                      <video
                        key={`${video.public_id || video.url}-video-${index}`}
                        src={video.url}
                        controls
                        preload="metadata"
                        className="w-full rounded-lg border border-[var(--border)] bg-black"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[14px] text-[var(--text-muted)]">
            No feedback submitted yet.
          </p>
        )}
      </div>
    </section>
  );
}

