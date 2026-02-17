import { useCreateResponse } from '@/entities/response';

export function useSendResponseAction(params?: { onSent?: () => void }) {
  const m = useCreateResponse();
  const send = async (vacancyId: number) => {
    await m.mutateAsync({
      vacancyId,
    });
    params?.onSent?.();
  };

  return { send, isSending: m.isPending, error: m.error };
}
