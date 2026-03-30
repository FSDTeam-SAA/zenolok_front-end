import { Button } from "@/components/ui/button";

import { SectionHeader } from "./section-header";

interface FeedbackSectionProps {
  message: string;
  onChangeMessage: (value: string) => void;
  onSubmit: () => void;
}

export function FeedbackSection({
  message,
  onChangeMessage,
  onSubmit,
}: FeedbackSectionProps) {
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
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            className="font-poppins h-11 rounded-xl px-5 text-[20px] leading-[120%] font-medium"
            onClick={onSubmit}
          >
            Submit Feedback
          </Button>
        </div>
      </div>
    </section>
  );
}

