import { useDeleteTeamMember } from "@/entities/teamMember";

export function useRemoveTeamMember(params: {
  teamId: number;
  userId: number;
  onDone?: () => void;
}) {
  const m = useDeleteTeamMember(params.teamId, params.userId);

  const remove = async () => {
    await m.mutateAsync();
    params.onDone?.();
  };

  return { remove, isRemoving: m.isPending };
}
