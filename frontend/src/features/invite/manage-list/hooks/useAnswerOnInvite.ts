import { useCallback } from "react";
import { InviteStatus } from "@/entities/invite/model/types";
import { useUpdateInvite } from "@/entities/invite/api/hooks";

interface UseAnswerOnInviteParams {
  inviteId: number;
  onAnswered?: (status: InviteStatus) => void;
}

export function useAnswerOnInvite({
  inviteId,
  onAnswered,
}: UseAnswerOnInviteParams) {
  const mutation = useUpdateInvite();

  const answer = useCallback(
    async (status: InviteStatus) => {
      await mutation.mutateAsync({
        id: inviteId,
        payload: { status },
      });

      onAnswered?.(status);
    },
    [inviteId, mutation, onAnswered]
  );

  return {
    answer,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
