"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { paginateArray, todoCategoryApi, type TodoCategory } from "@/lib/api";
import { colorPalette } from "@/lib/presets";
import { queryKeys } from "@/lib/query-keys";

const defaultCategoryForm = {
  name: "",
  color: "#F7C700",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CategoryManagePanel() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
  const [name, setName] = React.useState(defaultCategoryForm.name);
  const [color, setColor] = React.useState(defaultCategoryForm.color);
  const [inviteEmail, setInviteEmail] = React.useState("");

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: todoCategoryApi.getAll,
  });

  const categoryDetailQuery = useQuery({
    queryKey: queryKeys.category(editingCategoryId || "new"),
    queryFn: () => todoCategoryApi.getById(editingCategoryId as string),
    enabled: Boolean(editingCategoryId) && dialogOpen,
  });

  const editingCategory: TodoCategory | null = categoryDetailQuery.data || null;

  const invalidateCategories = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    queryClient.invalidateQueries({ queryKey: queryKeys.categoriesWithItems });
  }, [queryClient]);

  const refreshCategoryDetail = React.useCallback(() => {
    if (editingCategoryId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.category(editingCategoryId),
      });
    }
    invalidateCategories();
  }, [editingCategoryId, queryClient, invalidateCategories]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        throw new Error("Category name is required");
      }

      const payload = {
        name: name.trim(),
        color,
      };

      if (editingCategoryId) {
        return todoCategoryApi.update(editingCategoryId, payload);
      }

      return todoCategoryApi.create(payload);
    },
    onSuccess: () => {
      invalidateCategories();
      toast.success(editingCategoryId ? "Category updated" : "Category created");
      closeDialog();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to save category"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!editingCategoryId) {
        throw new Error("No category selected");
      }
      return todoCategoryApi.delete(editingCategoryId);
    },
    onSuccess: () => {
      invalidateCategories();
      toast.success("Category deleted");
      closeDialog();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete category"),
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!editingCategoryId) {
        throw new Error("Save the category first to invite collaborators");
      }
      return todoCategoryApi.inviteCollaborator(editingCategoryId, email);
    },
    onSuccess: () => {
      toast.success("Invitation sent");
      setInviteEmail("");
      refreshCategoryDetail();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to send invitation"),
  });

  const revokeMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!editingCategoryId) {
        throw new Error("No category selected");
      }
      return todoCategoryApi.revokeInvitation(editingCategoryId, invitationId);
    },
    onSuccess: () => {
      toast.success("Invitation revoked");
      refreshCategoryDetail();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to revoke invitation"),
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!editingCategoryId) {
        throw new Error("No category selected");
      }
      return todoCategoryApi.removeCollaborator(editingCategoryId, userId);
    },
    onSuccess: () => {
      toast.success("Collaborator removed");
      refreshCategoryDetail();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to remove collaborator"),
  });

  const categories = React.useMemo(
    () => categoriesQuery.data || [],
    [categoriesQuery.data],
  );
  const paged = React.useMemo(() => paginateArray(categories, page, 12), [categories, page]);

  React.useEffect(() => {
    setPage(1);
  }, [categories.length]);

  const closeDialog = React.useCallback(() => {
    setDialogOpen(false);
    setEditingCategoryId(null);
    setName(defaultCategoryForm.name);
    setColor(defaultCategoryForm.color);
    setInviteEmail("");
  }, []);

  const openCreateDialog = () => {
    setEditingCategoryId(null);
    setName(defaultCategoryForm.name);
    setColor(defaultCategoryForm.color);
    setInviteEmail("");
    setDialogOpen(true);
  };

  const openEditDialog = (category: TodoCategory) => {
    setEditingCategoryId(category._id);
    setName(category.name);
    setColor(category.color);
    setInviteEmail("");
    setDialogOpen(true);
  };

  const handleInvite = () => {
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    inviteMutation.mutate(trimmed);
  };

  const ownerId = editingCategory?.createdBy;
  const participantUsers = editingCategory?.participantUsers || [];
  const pendingInvitations = editingCategory?.pendingInvitations || [];

  return (
    <div>
      <div className="mb-5 flex items-center justify-end">
        <Button
          type="button"
          className="font-poppins h-11 rounded-2xl bg-[#36A9E1] px-5 text-[20px] leading-[120%] font-medium text-white hover:bg-[#2a98cd]"
          onClick={openCreateDialog}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {categoriesQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : paged.items.length ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {paged.items.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => openEditDialog(category)}
                className="group flex items-center justify-between rounded-3xl px-4 py-4 text-left text-white shadow-[0_10px_24px_rgba(15,18,28,0.18)] transition hover:translate-y-[-1px]"
                style={{ backgroundColor: category.color }}
              >
                <span className="font-poppins truncate text-[18px] leading-[120%] font-semibold">
                  {category.name}
                </span>
                <Pencil className="size-5 opacity-75 transition group-hover:opacity-100" />
              </button>
            ))}
          </div>
          <PaginationControls page={paged.page} totalPages={paged.totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title="No categories found" description="Create your first category to organize todos." />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}
      >
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-6">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle className="font-poppins text-[24px] leading-[120%] font-semibold text-[var(--text-strong)]">
              {editingCategoryId ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div
                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full px-5 py-2 text-white"
                style={{ backgroundColor: color }}
              >
                <span className="font-poppins text-[24px] leading-[120%] font-semibold">
                  {name.trim() || "Category"}
                </span>
              </div>
            </div>

            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Category name"
              className="h-12 rounded-xl bg-[var(--surface-1)] font-poppins text-[20px] leading-[120%] font-medium text-[var(--text-default)]"
            />

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-3 sm:p-4">
              <div className="grid grid-cols-10 gap-2 sm:gap-3">
                {colorPalette.map((paletteColor) => (
                  <button
                    key={paletteColor}
                    type="button"
                    onClick={() => setColor(paletteColor)}
                    className={`size-8 rounded-full border-2 transition sm:size-10 ${
                      color === paletteColor ? "border-[#262B34] scale-[1.05]" : "border-transparent"
                    }`}
                    style={{ backgroundColor: paletteColor }}
                    aria-label={`Select ${paletteColor} color`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-poppins text-[18px] leading-[120%] font-semibold text-[var(--text-strong)]">
                Collaborators
              </h3>

              {!editingCategoryId ? (
                <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[14px] text-[var(--text-muted)]">
                  Save the Category first. Once created, you can invite collaborators by email.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
                      <Input
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
                        placeholder="Invite by email"
                        type="email"
                        className="h-11 rounded-xl pl-9 font-poppins text-[16px] text-[var(--text-default)]"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleInvite();
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleInvite}
                      disabled={inviteMutation.isPending || !inviteEmail.trim()}
                      className="h-11 rounded-xl px-5 font-poppins text-[16px] font-medium"
                    >
                      {inviteMutation.isPending ? "Sending..." : "Invite"}
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="mb-2 font-poppins text-[12px] uppercase tracking-wide text-[var(--text-muted)]">
                      Current Collaborators
                    </p>
                    {categoryDetailQuery.isLoading ? (
                      <Skeleton className="h-12 w-full rounded-xl" />
                    ) : participantUsers.length ? (
                      <div className="space-y-2">
                        {participantUsers.map((user) => {
                          const isOwner = ownerId === user._id;
                          return (
                            <div
                              key={user._id}
                              className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-1)] px-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate font-poppins text-[14px] font-medium text-[var(--text-default)]">
                                    {user.name || user.username || user.email}
                                  </p>
                                  {isOwner ? (
                                    <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium uppercase text-[var(--text-muted)]">
                                      Owner
                                    </span>
                                  ) : null}
                                </div>
                                <p className="truncate text-[12px] text-[var(--text-muted)]">
                                  {user.email}
                                </p>
                              </div>
                              {!isOwner ? (
                                <button
                                  type="button"
                                  aria-label={`Remove ${user.email}`}
                                  onClick={() => removeMutation.mutate(user._id)}
                                  disabled={removeMutation.isPending}
                                  className="text-[var(--text-muted)] transition hover:text-[var(--text-strong)]"
                                >
                                  <X className="size-4" />
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="px-1 text-[13px] text-[var(--text-muted)]">No collaborators yet.</p>
                    )}
                  </div>

                  {pendingInvitations.length ? (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                      <p className="mb-2 font-poppins text-[12px] uppercase tracking-wide text-[var(--text-muted)]">
                        Pending Invitations
                      </p>
                      <div className="space-y-2">
                        {pendingInvitations.map((invitation) => (
                          <div
                            key={invitation._id}
                            className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-1)] px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-poppins text-[14px] font-medium text-[var(--text-default)]">
                                {invitation.email}
                              </p>
                              <p className="text-[12px] text-[var(--text-muted)]">
                                Awaiting acceptance
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label={`Revoke invitation for ${invitation.email}`}
                              onClick={() => revokeMutation.mutate(invitation._id)}
                              disabled={revokeMutation.isPending}
                              className="text-[var(--text-muted)] transition hover:text-[var(--text-strong)]"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 flex shrink-0 items-center justify-between gap-3 sm:flex-row">
            {editingCategoryId ? (
              <Button
                type="button"
                variant="destructive"
                className="font-poppins h-11 rounded-xl px-5 text-[18px] leading-[120%] font-medium"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              className="font-poppins h-11 rounded-xl px-6 text-[20px] leading-[120%] font-medium"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending
                ? "Saving..."
                : editingCategoryId
                  ? "Save"
                  : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
