import { useJoinTeam } from '@/entities/team';
import { Role } from '@/shared/types/enums';
import { ChangeEvent, useState } from 'react';

export const useJoinTeamModal = (
  teamId: number | null,
  getHandledKey: (id: number) => string,
  onCancel: () => void,
  onJoinTeam: () => void,
) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [role, setRole] = useState<Role | ''>('');
  const [hadAdded, setHadAdded] = useState(false);

  const joinTeamMutation = useJoinTeam();

  const cancel = () => {
    if (teamId) {
      sessionStorage.setItem(getHandledKey(teamId), '1');
    }
    setModalOpen(false);
    onCancel();
  };

  const select = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as Role);
  };

  const joinTeam = async () => {
    if (!teamId || !role) return;
    setHadAdded(true);
    try {
      await joinTeamMutation.mutateAsync({ id: teamId, role });
      sessionStorage.setItem(getHandledKey(teamId), '1');
      setModalOpen(false);
      onJoinTeam();
    } catch (e) {
      console.error('[StartParamJoinHandler] join failed', e);
      // setHadAdded(false);
    }
  };

  const open = () => setModalOpen(true);
  const close = () => setModalOpen(false);
  return {
    hadAdded,
    close,
    open,
    cancel,
    select,
    joinTeam,
    role,
    modalOpen,
    setModalOpen,
    isLoading: joinTeamMutation.isPending,
  };
};
