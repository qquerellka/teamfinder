import { useDeleteTeamMember } from '@/entities/teamMember';
import { useState } from 'react';

export function useRemoveTeamMember(params: {
  teamId: number;
  userId: number;
  onDone?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);

  const m = useDeleteTeamMember(params.teamId, params.userId);
  const cancel = () => {
    if (m.isPending) return;
    setIsOpen(false);
  };
  const remove = async () => {
    await m.mutateAsync();
    params.onDone?.();
    setIsOpen(false);
  };

  return { isOpen, open, remove, cancel, isRemoving: m.isPending };
}
