"use client";

import { useState, type ReactNode } from "react";
import { Plus, UserPlus } from "lucide-react";

import type { UserProfile } from "@/lib/api";
import { SectionLoading } from "@/components/shared/section-loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { colorPalette } from "@/lib/presets";

function getUserDisplayName(user: UserProfile) {
  return user.name || user.username || user.email || "User";
}

type AddCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCategoryName: string;
  onNewCategoryNameChange: (value: string) => void;
  newCategoryColor: string;
  onNewCategoryColorChange: (value: string) => void;
  onCreate: () => void;
  isCreating: boolean;
  title?: string;
  submitLabel?: string;
  pendingLabel?: string;
  trigger?: ReactNode;
  showDefaultTrigger?: boolean;
  allUsers?: UserProfile[];
  selectedParticipantIds?: string[];
  currentParticipantIds?: ReadonlySet<string>;
  onToggleParticipant?: (userId: string, checked: boolean) => void;
  isUsersLoading?: boolean;
  isUsersError?: boolean;
};

export function AddCategoryDialog({
  open,
  onOpenChange,
  newCategoryName,
  onNewCategoryNameChange,
  newCategoryColor,
  onNewCategoryColorChange,
  onCreate,
  isCreating,
  title = "New Category",
  submitLabel = "Add",
  pendingLabel = "Adding...",
  trigger,
  showDefaultTrigger = true,
  allUsers = [],
  selectedParticipantIds = [],
  currentParticipantIds = new Set<string>(),
  onToggleParticipant,
  isUsersLoading = false,
  isUsersError = false,
}: AddCategoryDialogProps) {
  const [collaboratorsOpen, setCollaboratorsOpen] = useState(false);
  const selectedUsers = allUsers.filter((user) =>
    selectedParticipantIds.includes(user._id),
  );
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCollaboratorsOpen(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : showDefaultTrigger ? (
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex size-16 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--surface-3)]"
            aria-label="Add category"
          >
            <Plus className="size-7" />
          </button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-5xl rounded-[30px] border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-[24px] text-[var(--text-strong)]">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              value={newCategoryName}
              onChange={(event) => onNewCategoryNameChange(event.target.value)}
              placeholder="Category name"
              className="h-12"
              style={{ color: newCategoryColor }}
            />
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] justify-items-center gap-2 sm:grid-cols-10 sm:gap-3">
              {colorPalette.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => onNewCategoryColorChange(color)}
                  className={`size-8 rounded-full border-2 sm:size-8 ${
                    newCategoryColor === color
                      ? "border-[var(--text-strong)]"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 items-end justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Dialog open={collaboratorsOpen} onOpenChange={setCollaboratorsOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-strong)]"
                  aria-label="Add collaborators"
                >
                  <UserPlus className="size-[16px]" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg space-y-4 rounded-[26px]">
                <DialogHeader>
                  <DialogTitle className="text-[24px]">Add collaborators</DialogTitle>
                </DialogHeader>
                <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-2">
                  {isUsersLoading ? (
                    <SectionLoading rows={3} />
                  ) : isUsersError ? (
                    <p className="px-2 py-3 text-center text-xs text-[var(--text-muted)]">
                      Failed to load users
                    </p>
                  ) : allUsers.length ? (
                    allUsers.map((user) => {
                      const checked = selectedParticipantIds.includes(user._id);
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
                                onToggleParticipant?.(user._id, Boolean(next))
                              }
                            />
                            <Avatar className="size-7 border border-[var(--border)]">
                              <AvatarImage src={user.avatar?.url} />
                              <AvatarFallback>
                                {getUserDisplayName(user).slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm text-[var(--text-default)]">
                                {getUserDisplayName(user)}
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
                  type="button"
                  className="h-10 w-full rounded-xl text-[20px] font-medium"
                  onClick={() => setCollaboratorsOpen(false)}
                  disabled={isUsersLoading}
                >
                  Save collaborators
                </Button>
              </DialogContent>
            </Dialog>
            <div className="flex min-w-0 items-center">
              {selectedUsers.slice(0, 4).map((user, index) => (
                <Avatar
                  key={user._id}
                  className={`size-8 border border-[var(--border)] ${index === 0 ? "" : "-ml-2"}`}
                >
                  <AvatarImage src={user.avatar?.url} />
                  <AvatarFallback>{getUserDisplayName(user).slice(0, 1)}</AvatarFallback>
                </Avatar>
              ))}
              {selectedUsers.length > 4 ? (
                <span className="-ml-2 flex size-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[12px] text-[var(--text-muted)]">
                  +{selectedUsers.length - 4}
                </span>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            className="font-poppins h-11 rounded-xl px-6 text-[20px] leading-[120%] font-medium"
            onClick={onCreate}
            disabled={isCreating}
          >
            {isCreating ? pendingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
