import { useState } from 'react';

export const useHaveTeamModal = (
  teamId: number | null,
  onClose: () => void,
  getHandledKey: (id: number) => string,
) => {
  const [modalOpen, setModalOpen] = useState(false);

  const close = () => {
    if (teamId) {
      sessionStorage.setItem(getHandledKey(teamId), '1');
    }
    setModalOpen(false);
    onClose();
  };

  const open = () => setModalOpen(true);

  return {
    close,
    open,
    modalOpen,
    setModalOpen,
  };
};
