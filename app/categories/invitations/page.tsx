"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Mail, X } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionLoading } from "@/components/shared/section-loading";
import { Button } from "@/components/ui/button";
import { todoCategoryApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

function CategoryInvitationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const urlToken = searchParams.get("token");

  const invitationsQuery = useQuery({
    queryKey: queryKeys.myCategoryInvitations,
    queryFn: todoCategoryApi.listMyInvitations,
  });

  const invalidateInvitations = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.myCategoryInvitations });
    queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    queryClient.invalidateQueries({ queryKey: queryKeys.categoriesWithItems });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  }, [queryClient]);

  const acceptMutation = useMutation({
    mutationFn: (token: string) => todoCategoryApi.acceptInvitation(token),
    onSuccess: () => {
      toast.success("Invitation accepted");
      invalidateInvitations();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to accept invitation"),
  });

  const declineMutation = useMutation({
    mutationFn: (token: string) => todoCategoryApi.declineInvitation(token),
    onSuccess: () => {
      toast.success("Invitation declined");
      invalidateInvitations();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to decline invitation"),
  });

  const handledUrlTokenRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!urlToken || handledUrlTokenRef.current === urlToken) {
      return;
    }
    handledUrlTokenRef.current = urlToken;
    acceptMutation.mutate(urlToken, {
      onSettled: () => {
        router.replace("/categories/invitations", { scroll: false });
      },
    });
  }, [urlToken, acceptMutation, router]);

  const invitations = invitationsQuery.data || [];

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
      <header>
        <h1 className="font-poppins text-[28px] leading-[120%] font-semibold text-[var(--text-strong)]">
          Category invitations
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          Review and respond to invitations to collaborate on Categories.
        </p>
      </header>

      {invitationsQuery.isLoading ? (
        <SectionLoading rows={3} />
      ) : invitations.length ? (
        <div className="space-y-3">
          {invitations.map((invitation) => {
            const { category } = invitation;
            const inviter =
              typeof category.createdBy === "object" ? category.createdBy : null;
            const isProcessing =
              (acceptMutation.isPending &&
                acceptMutation.variables === invitation.token) ||
              (declineMutation.isPending &&
                declineMutation.variables === invitation.token);

            return (
              <article
                key={invitation._id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: category.color }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-poppins text-[16px] font-semibold text-[var(--text-default)]">
                      {category.name}
                    </p>
                    <p className="truncate text-[13px] text-[var(--text-muted)]">
                      <Mail className="mr-1 inline size-3 align-[-2px]" />
                      Invited by {inviter?.name || inviter?.email || "a teammate"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-full px-3 text-[14px]"
                    onClick={() => declineMutation.mutate(invitation.token)}
                    disabled={isProcessing}
                  >
                    <X className="size-4" />
                    Decline
                  </Button>
                  <Button
                    type="button"
                    className="h-9 rounded-full bg-[#31C65B] px-4 text-[14px] text-white hover:bg-[#2cb655]"
                    onClick={() => acceptMutation.mutate(invitation.token)}
                    disabled={isProcessing}
                  >
                    <Check className="size-4" />
                    Accept
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No invitations"
          description="You have no pending Category invitations right now."
        />
      )}
    </div>
  );
}

export default function CategoryInvitationsPage() {
  return (
    <React.Suspense fallback={<SectionLoading rows={3} />}>
      <CategoryInvitationsContent />
    </React.Suspense>
  );
}
