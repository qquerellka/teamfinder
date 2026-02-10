import styled from 'styled-components';
import { Button, Select, Textarea } from '@telegram-apps/telegram-ui';
import { type FC, type ChangeEvent, useState } from 'react';

import { roleOptions, type Role } from '@/shared/types/enums';
import { ButtonsSection, ErrorText, InputSection } from '@/shared/ui';
import { haptic } from '@/shared/telegram/useTelegramHaptic';

interface VacancyFormViewProps {
  role: Role | '';
  description: string;
  submitLabel: string;
  loading?: boolean;
  canSubmit: boolean;
  onRoleChange: (role: Role | '') => void;
  onDescriptionChange: (decription: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

const parseRole = (raw: string): Role | '' => (raw ? (raw as Role) : '');

export const VacancyFormView: FC<VacancyFormViewProps> = ({
  role,
  description,
  submitLabel,
  loading = false,
  canSubmit,
  onRoleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
}) => {
  const [errorDescription, setErrorDescription] = useState(false);

  const handleSaveClick = () => {
    if (!canSubmit) return;
    onSubmit();
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    onRoleChange(parseRole(e.target.value));
  };

  const handleTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (value.length <= 128) {
      setErrorDescription(false);
      onDescriptionChange(e.target.value);
    } else {
      haptic();
      setErrorDescription(true);
    }
  };

  return (
    <>
      <InputsWrapper>
        <InputSection header={'Описание'}>
          <Textarea
            value={description}
            onChange={handleTextarea}
            placeholder="Хотим заряженного ИБО перваша"
            status={errorDescription ? 'error' : 'default'}
          />
          {errorDescription && <ErrorText>{'Слишком большое описание!'}</ErrorText>}
        </InputSection>

        <InputSection header={'Роль'}>
          <Select value={role} onChange={handleSelect}>
            <option value="" disabled>
              Выберите роль
            </option>
            {roleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </InputSection>
      </InputsWrapper>
      <ButtonsSection>
        <Button onClick={handleSaveClick} stretched disabled={!canSubmit || loading}>
          {submitLabel}
        </Button>

        {onCancel && (
          <Button mode="white" stretched onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
        )}
      </ButtonsSection>
    </>
  );
};

const InputsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
