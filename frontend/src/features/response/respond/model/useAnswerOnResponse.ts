import { useCallback } from "react";
import { InviteStatus } from "@/entities/invite";
import { ResponseStatus, useUpdateResponse } from "@/entities/response";

interface UseAnswerOnResponseParams {
  responseId: number;
  onAnswered?: (status: ResponseStatus) => void;
}

export function useAnswerOnResponse({
  responseId,
  onAnswered,
}: UseAnswerOnResponseParams) {
  const mutation = useUpdateResponse();

  const answer = useCallback(
    async (status: InviteStatus) => {
      await mutation.mutateAsync({
        id: responseId,
        payload: { status },
      });

      onAnswered?.(status);
    },
    [responseId, mutation, onAnswered]
  );

  return {
    answer,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
