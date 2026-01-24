import { useCreateResponse } from '@/entities/response';

export function useSendResponseAction(
  //   vacancyId: number,
  params?: { onSent?: () => void },
) {
  //   const m = useCreateInvite();
  const m = useCreateResponse();
  const send = async (vacancyId: number) => {
    await m.mutateAsync({
      vacancyId,
      //   payload: { vacancyId, role },
    });
    params?.onSent?.();
  };

  return { send, isSending: m.isPending, error: m.error };
}
