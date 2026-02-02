import { type FC, type ChangeEvent, useState, useEffect, useRef } from 'react';
import { Button, Input, Select, Textarea } from '@telegram-apps/telegram-ui';
import styled from 'styled-components';

import { roleOptions, type Role } from '@/shared/types/enums';
import { InputSection, ButtonsSection, ErrorText } from '@/shared/ui';
import { useHaptic } from '@/shared/telegram/useTelegramHaptic';

type BaseProps = {
  hackathonName: string;
  name: string;
  description: string;
  submitLabel: string;
  canSubmit: boolean;
  loading?: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  extra?: React.ReactNode;
};

type CreateProps = BaseProps & {
  mode: 'create';
  role: Role | '';
  onRoleChange: (role: Role | '') => void;
};

type EditProps = BaseProps & {
  mode: 'edit';
};

type Props = CreateProps | EditProps;

const parseRole = (raw: string): Role | '' => (raw ? (raw as Role) : '');

export const TeamFormView: FC<Props> = props => {
  const {
    hackathonName,
    name,
    description,
    submitLabel,
    canSubmit,
    loading = false,
    onNameChange,
    onDescriptionChange,
    onSubmit,
    onCancel,
  } = props;
  const [errorName, setErrorName] = useState(false);
  const [errorDescription, setErrorDescription] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';

      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [description]);

  const handleRole = (e: ChangeEvent<HTMLSelectElement>) => {
    if (props.mode !== 'create') return;
    props.onRoleChange(parseRole(e.target.value));
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 64) {
      setErrorName(false);
      onNameChange(value);
    } else {
      setErrorName(true);
      useHaptic();
    }
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 256) {
      setErrorDescription(false);
      onDescriptionChange(value);
    } else {
      setErrorDescription(true);
      useHaptic();
    }
  };

  return (
    <>
      <InputsWrapper>
        <InputSection header="Хакатон">
          <Input value={hackathonName} disabled />
        </InputSection>

        <InputSection header="Название команды">
          <Input
            value={name}
            onChange={handleNameChange}
            status={errorName ? 'error' : 'default'}
          />
          {errorName && <ErrorText>{'Слишком длиное название команды!'}</ErrorText>}
        </InputSection>

        <InputSection header="Описание команды">
          <Textarea
            ref={textareaRef}
            value={description}
            onChange={handleDescriptionChange}
            status={errorDescription ? 'error' : 'default'}
            style={{
              resize: 'none',
              overflowY: 'hidden',
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              transition: 'height 0.2s ease',
            }}
          />
          {errorDescription && <ErrorText>{'Слишком длиное описание команды!'}</ErrorText>}
        </InputSection>

        {props.mode === 'create' && (
          <InputSection header="Ваша роль">
            <Select value={props.role} onChange={handleRole}>
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
        )}
        {props.extra}
      </InputsWrapper>
      <ButtonsSection>
        <Button onClick={onSubmit} stretched disabled={!canSubmit || loading}>
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

const InputsWrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
