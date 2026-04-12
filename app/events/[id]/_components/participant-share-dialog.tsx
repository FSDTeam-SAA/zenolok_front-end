"use client";

import { UserPlus } from "lucide-react";

import type { UserProfile } from "@/lib/api";
import { SectionLoading } from "@/components/shared/section-loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getParticipantDisplayName } from "./event-detail-helpers";

type ParticipantShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEventOwner: boolean;
  allUsers: UserProfile[];
  selectedUserIds: string[];
  currentParticipantIds: ReadonlySet<string>;
  onToggleUser: (userId: string, checked: boolean) => void;
  onSave: () => void;
  isLoading: boolean;
  isError: boolean;
  isSaving: boolean;
};

export function ParticipantShareDialog({
  open,
  onOpenChange,
  isEventOwner,
  allUsers,
  selectedUserIds,
  currentParticipantIds,
  onToggleUser,
  onSave,
  isLoading,
  isError,
  isSaving,
}: ParticipantShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Add participants"
          disabled={!isEventOwner}
        >
          <UserPlus className="size-[16px]" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-[26px] space-y-4">
        <DialogHeader>
          <DialogTitle className="text-[24px]">Add participants</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-2">
              {isLoading ? (
                <SectionLoading rows={3} />
              ) : isError ? (
                <p className="px-2 py-3 text-center text-xs text-[var(--text-muted)]">
                  Failed to load users
                </p>
              ) : allUsers.length ? (
                allUsers.map((user) => {
                  const checked = selectedUserIds.includes(user._id);
                  const alreadyAdded = currentParticipantIds.has(user._id);

                  return (
                    <label
                      key={user._id}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--surface-3)]"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) =>
                            onToggleUser(user._id, Boolean(next))
                          }
                        />
                        <Avatar className="size-7 border border-[var(--border)]">
                          <AvatarImage src={user.avatar?.url} />
                          <AvatarFallback>
                            {getParticipantDisplayName(user).slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-[var(--text-default)]">
                            {getParticipantDisplayName(user)}
                          </p>
                          <p className="truncate text-[11px] text-[var(--text-muted)]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {alreadyAdded ? (
                        <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                          Added
                        </span>
                      ) : null}
                    </label>
                  );
                })
              ) : (
                <p className="px-2 py-3 text-center text-xs text-[var(--text-muted)]">
                  No users found
                </p>
              )}
            </div>
            <Button
              className="h-10 w-full rounded-xl text-[20px] font-medium"
              onClick={onSave}
              disabled={isLoading || isSaving}
            >
              {isSaving ? "Saving..." : "Save participants"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
