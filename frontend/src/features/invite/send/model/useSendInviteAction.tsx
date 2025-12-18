import { useCreateInvite } from "@/entities/invite";
import type { Role } from "@/shared/types/enums";

export function useSendInviteAction(
  teamId: number,
  params?: { onSent?: () => void }
) {
  const m = useCreateInvite();

  const send = async (applicationId: number, role: Role) => {
    await m.mutateAsync({
      teamId,
      payload: { applicationId, role },
    });
    params?.onSent?.();
  };

  return { send, isSending: m.isPending, error: m.error };
}
