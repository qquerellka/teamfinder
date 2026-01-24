import { useLeaveTeam } from '@/entities/teamMember';

export function useLeaveTeamAction(teamId: number, params?: { onDone?: () => void }) {
  const m = useLeaveTeam(teamId);

  const leave = async () => {
    await m.mutateAsync();
    params?.onDone?.();
  };

  return { leave, isLeaving: m.isPending };
}
