import { useState, useCallback } from 'react';
import { HackathonMode, HackathonStatus } from '@/shared/types/enums';

export interface UseFiltersProps {
  initialMode?: HackathonMode | '';
  initialMoney?: boolean | null;
  initialStatus?: HackathonStatus | '';
}

export const useFilters = ({
  initialMode = '',
  initialMoney = null,
  initialStatus = 'open',
}: UseFiltersProps = {}) => {
  const [mode, setMode] = useState<HackathonMode | ''>(initialMode);
  const [appliedMode, setAppliedMode] = useState<HackathonMode | ''>(initialMode);
  const [money, setMoney] = useState<boolean | null>(initialMoney);
  const [appliedMoney, setAppliedMoney] = useState<boolean | null>(initialMoney);
  const [status, setStatus] = useState<HackathonStatus | ''>(initialStatus);
  const [appliedStatus, setAppliedStatus] = useState<HackathonStatus | ''>(initialStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setMode(appliedMode);
    setMoney(appliedMoney);
    setStatus(appliedStatus);
    setIsModalOpen(true);
  }, [appliedMode, appliedMoney, appliedStatus]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedMode(mode);
    setAppliedMoney(money);
    setAppliedStatus(status);
  }, [mode, money, status]);

  const resetFilters = useCallback(() => {
    setMode('');
    setAppliedMode('');
    setMoney(null);
    setAppliedMoney(null);
    setStatus('');
    setAppliedStatus('');
  }, []);

  return {
    mode,
    appliedMode,
    money,
    appliedMoney,
    status,
    appliedStatus,
    isModalOpen,

    setMode,
    setMoney,
    setStatus,

    openModal,
    closeModal,
    applyFilters,
    resetFilters,

    queryParams: {
      mode: appliedMode || undefined,
      hasPrize: appliedMoney === true ? true : appliedMoney === false ? false : undefined,
      status: appliedStatus || undefined,
    },
  };
};
