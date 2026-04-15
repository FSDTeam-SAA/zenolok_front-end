"use client";

import { Bell, CalendarDays, Clock3, Locate, MapPin, RefreshCw } from "lucide-react";
import { format, isSameDay } from "date-fns";

import type { EventData, UserProfile } from "@/lib/api";
import { BrickIcon } from "@/components/shared/brick-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatTimeByPreference } from "@/lib/time-format";
import { getParticipantDisplayName } from "./event-detail-helpers";
import { ParticipantShareDialog } from "./participant-share-dialog";

type EventSummaryMetaRangeProps = {
  icon: React.ComponentType<{ className?: string }>;
  startLabel?: string | null;
  startValue: string;
  endLabel?: string | null;
  endValue?: string | null;
  labelPosition?: "below" | "hidden";
};

function EventSummaryMetaRange({
  icon: Icon,
  startLabel,
  startValue,
  endLabel,
  endValue,
  labelPosition = "below",
}: EventSummaryMetaRangeProps) {
  const normalizedStartValue = startValue.trim();
  const normalizedEndValue = endValue?.trim() || "";
  const showEnd = Boolean(
    normalizedEndValue &&
    (labelPosition === "hidden"
      ? normalizedEndValue !== normalizedStartValue
      : normalizedEndValue !== normalizedStartValue ||
        (endLabel || "") !== (startLabel || "")),
  );
  const isInlineRow = labelPosition === "hidden";

  const renderValueBlock = (value: string, label?: string | null) => (
    <div
      className={`min-w-0 ${
        isInlineRow ? "flex items-center gap-2" : "flex flex-col"
      }`}
    >
      <p
        className={`font-poppins text-[20px] font-semibold text-[var(--text-default)] ${
          isInlineRow ? "leading-none" : "leading-[120%]"
        }`}
      >
        {value}
      </p>
      {labelPosition === "below" && label ? (
        <p className="font-poppins mt-1 text-[12px] leading-none font-medium text-[var(--text-muted)]">
          {label}
        </p>
      ) : null}
    </div>
  );

  return (
    <div
      className={`flex min-w-0 gap-3 ${
        isInlineRow ? "items-center" : "items-start"
      }`}
    >
      <Icon
        className={`size-5 shrink-0 text-[var(--text-muted)] ${
          isInlineRow ? "" : "mt-0.5"
        }`}
      />
      <div
        className={`flex min-w-0 flex-wrap gap-x-4 gap-y-2 ${
          isInlineRow ? "items-center" : "items-start"
        }`}
      >
        {renderValueBlock(
          normalizedStartValue,
          labelPosition === "hidden" ? undefined : startLabel,
        )}
        {showEnd ? (
          <>
            <span className="self-center text-[20px] leading-none text-[var(--text-muted)]">
              -
            </span>
            {renderValueBlock(
              normalizedEndValue,
              labelPosition === "hidden" ? undefined : endLabel,
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

type EventSummaryCardProps = {
  event: EventData;
  participants: UserProfile[];
  use24Hour: boolean;
  shareDialogOpen: boolean;
  onShareDialogOpenChange: (open: boolean) => void;
  isEventOwner: boolean;
  allUsers: UserProfile[];
  selectedShareUserIds: string[];
  currentParticipantIds: ReadonlySet<string>;
  onToggleShareUser: (userId: string, checked: boolean) => void;
  onSaveParticipants: () => void;
  isUsersLoading: boolean;
  isUsersError: boolean;
  isParticipantsSaving: boolean;
};

export function EventSummaryCard({
  event,
  participants,
  use24Hour,
  shareDialogOpen,
  onShareDialogOpenChange,
  isEventOwner,
  allUsers,
  selectedShareUserIds,
  currentParticipantIds,
  onToggleShareUser,
  onSaveParticipants,
  isUsersLoading,
  isUsersError,
  isParticipantsSaving,
}: EventSummaryCardProps) {
  const startsAt = new Date(event.startTime);
  const endsAt = new Date(event.endTime);
  const spansMultipleDays =
    !Number.isNaN(startsAt.getTime()) &&
    !Number.isNaN(endsAt.getTime()) &&
    !isSameDay(startsAt, endsAt);
  const hasValidSchedule =
    !Number.isNaN(startsAt.getTime()) && !Number.isNaN(endsAt.getTime());
  const startDateLabel = hasValidSchedule
    ? format(startsAt, "dd MMM yyyy").toUpperCase()
    : "Invalid date";
  const endDateLabel = hasValidSchedule
    ? format(endsAt, "dd MMM yyyy").toUpperCase()
    : "";
  const startDayLabel = hasValidSchedule ? format(startsAt, "EEEE") : "";
  const endDayLabel = hasValidSchedule ? format(endsAt, "EEEE") : "";
  const startTimeLabel = event.isAllDay
    ? "All day"
    : hasValidSchedule
      ? formatTimeByPreference(startsAt, use24Hour)
      : "Invalid time";
  const endTimeLabel =
    !event.isAllDay && hasValidSchedule
      ? formatTimeByPreference(endsAt, use24Hour)
      : "";

  return (
    <div className="event-details-card rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
      <div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <span
                className="mt-1 h-8 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: event.brick?.color || "#F7C700" }}
              />
              <div className="min-w-0 space-y-3">
                <p className="truncate text-[28px] font-semibold leading-[1.05] text-[var(--text-strong)] sm:text-[32px] mt-2">
                  {event.title}
                </p>
                {event.brick ? (
                  <Badge
                    variant="blue"
                    className="rounded-full px-3 py-1 text-[13px] font-medium shadow-sm"
                    style={{ backgroundColor: event.brick.color }}
                  >
                    <BrickIcon
                      name={event.brick.icon}
                      className="mr-1 size-3.5"
                    />
                    {event.brick.name}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {participants.slice(0, 4).map((participant, index) => (
                  <Avatar
                    key={participant._id}
                    className={`size-8 border-2 border-[var(--border)] ${
                      index === 0 ? "" : "-ml-2.5"
                    }`}
                  >
                    <AvatarImage src={participant.avatar?.url} />
                    <AvatarFallback className="bg-[var(--surface-1)] text-[12px] text-[var(--text-muted)]">
                      {getParticipantDisplayName(participant).slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {participants.length > 4 ? (
                  <span className="-ml-2.5 inline-flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--surface-1)] px-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                    +{participants.length - 4}
                  </span>
                ) : null}
              </div>

              <ParticipantShareDialog
                open={shareDialogOpen}
                onOpenChange={onShareDialogOpenChange}
                isEventOwner={isEventOwner}
                allUsers={allUsers}
                selectedUserIds={selectedShareUserIds}
                currentParticipantIds={currentParticipantIds}
                onToggleUser={onToggleShareUser}
                onSave={onSaveParticipants}
                isLoading={isUsersLoading}
                isError={isUsersError}
                isSaving={isParticipantsSaving}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <EventSummaryMetaRange
                icon={CalendarDays}
                startLabel={startDayLabel}
                startValue={startDateLabel}
                endLabel={spansMultipleDays ? endDayLabel : undefined}
                endValue={spansMultipleDays ? endDateLabel : undefined}
                labelPosition="below"
              />
              <EventSummaryMetaRange
                icon={Clock3}
                startValue={startTimeLabel}
                endValue={event.isAllDay ? undefined : endTimeLabel}
                labelPosition="hidden"
              />
            </div>

            <div className="space-y-3 lg:min-w-[220px]">
              <div className="flex items-center gap-2 lg:justify-end">
                <div className="flex items-center gap-2 lg:justify-end">
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)] transition hover:bg-[var(--surface-3)]"
                    aria-label="Notification"
                  >
                    <Bell className="size-4" />
                  </button>
                </div>
                <div>
                  {spansMultipleDays ? (
                    <div
                      className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)] transition hover:bg-[var(--surface-3)]"
                      aria-label="Repeats across dates"
                    >
                      <RefreshCw className="size-4" />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-1)] px-3 py-3">
                <p className="flex items-center gap-2 text-[14px] text-[var(--text-default)]">
                  <MapPin className="size-4 shrink-0 text-[var(--text-muted)]" />
                  <span className="truncate">
                    {event.location || "No location"}
                  </span>
                </p>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-1)] px-3 py-3">
                <p className="flex items-center gap-2 text-[14px] text-[var(--text-default)]">
                  <Locate className="size-4 shrink-0 text-[var(--text-muted)]" />
                  <span className="truncate">
                    {event.location || "No location"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
