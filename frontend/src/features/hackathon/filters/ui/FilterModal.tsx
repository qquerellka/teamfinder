import { FC, useCallback } from 'react';
import styled from 'styled-components';
import { Button, Modal, Radio, Text } from '@telegram-apps/telegram-ui';
import { HackathonMode, HackathonStatus } from '@/shared/types/enums';

const MODE_OPTIONS = [
  { value: '', label: 'Неважно' },
  { value: 'online', label: 'Онлайн' },
  { value: 'offline', label: 'Оффлайн' },
  { value: 'hybrid', label: 'Гибрид' },
] as const;

const MONEY_OPTIONS = [
  { value: null, label: 'Неважно' },
  { value: true, label: 'Да' },
  { value: false, label: 'Нет' },
] as const;

const STATUS_OPTIONS = [
  { value: 'open', label: 'Актуальные' },
  { value: 'closed', label: 'Архивные' },
] as const;

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: HackathonMode | '';
  onModeChange: (mode: HackathonMode | '') => void;
  money: boolean | null;
  onMoneyChange: (money: boolean | null) => void;
  status: HackathonStatus | '';
  onStatusChange: (status: HackathonStatus | '') => void;
  onApply: () => void;
  onReset: () => void;
}

export const FilterModal: FC<FilterModalProps> = ({
  isOpen,
  onClose,
  mode,
  onModeChange,
  money,
  onMoneyChange,
  status,
  onStatusChange,
  onApply,
  onReset,
}) => {
  const handleApply = useCallback(() => {
    onApply();
    onClose();
  }, [onApply, onClose]);

  const handleReset = useCallback(() => {
    onReset();
    onClose();
  }, [onReset, onClose]);

  return (
    <Modal open={isOpen}>
      <ModalContainer>
        <Text>{'Фильтры'}</Text>

        <Section>
          <Text>{'Формат проведения'}</Text>
          {MODE_OPTIONS.map(({ value, label }) => (
            <RatioContainer key={`mode-${value}`}>
              <Radio name="mode" checked={mode === value} onChange={() => onModeChange(value)} />
              <Text>{label}</Text>
            </RatioContainer>
          ))}
        </Section>

        <Section>
          <Text>{'Призовые'}</Text>
          {MONEY_OPTIONS.map(({ value, label }) => (
            <RatioContainer key={`money-${value}`}>
              <Radio name="money" checked={money === value} onChange={() => onMoneyChange(value)} />
              <Text>{label}</Text>
            </RatioContainer>
          ))}
        </Section>

        <Section>
          <Text>{'Статус'}</Text>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <RatioContainer key={`status-${value}`}>
              <Radio
                name="status"
                checked={status === value}
                onChange={() => onStatusChange(value)}
              />
              <Text>{label}</Text>
            </RatioContainer>
          ))}
        </Section>

        <ButtonsContainer>
          <Button mode="white" type="button" stretched onClick={handleReset}>
            {'Сбросить'}
          </Button>
          <Button type="button" stretched onClick={handleApply}>
            {'Применить'}
          </Button>
        </ButtonsContainer>
      </ModalContainer>
    </Modal>
  );
};

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 0.5rem;
`;

const RatioContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  text-align: initial;
  gap: 1rem;
`;

const ModalContainer = styled.form`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 0.5rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;
