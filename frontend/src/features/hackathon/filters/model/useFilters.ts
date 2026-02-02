import { useState, useCallback } from 'react';
import { HackathonMode } from '@/shared/types/enums';

export interface UseFiltersProps {
  initialMode?: HackathonMode | '';
  initialMoney?: boolean | null;
}

export const useFilters = ({ initialMode = '', initialMoney = null }: UseFiltersProps = {}) => {
  const [mode, setMode] = useState<HackathonMode | ''>(initialMode);
  const [appliedMode, setAppliedMode] = useState<HackathonMode | ''>(initialMode);
  const [money, setMoney] = useState<boolean | null>(initialMoney);
  const [appliedMoney, setAppliedMoney] = useState<boolean | null>(initialMoney);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setMode(appliedMode);
    setMoney(appliedMoney);
    setIsModalOpen(true);
  }, [appliedMode, appliedMoney]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedMode(mode);
    setAppliedMoney(money);
  }, [mode, money]);

  const resetFilters = useCallback(() => {
    setMode('');
    setAppliedMode('');
    setMoney(null);
    setAppliedMoney(null);
  }, []);

  return {
    mode,
    appliedMode,
    money,
    appliedMoney,
    isModalOpen,

    setMode,
    setMoney,

    openModal,
    closeModal,
    applyFilters,
    resetFilters,

    queryParams: {
      mode: appliedMode || undefined,
      hasPrize: appliedMoney === true ? true : appliedMoney === false ? false : undefined,
    },
  };
};
