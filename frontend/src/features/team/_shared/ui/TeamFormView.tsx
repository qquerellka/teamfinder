import type { FC, ChangeEvent } from 'react';
import { Button, Input, Select, Textarea } from '@telegram-apps/telegram-ui';
import styled from 'styled-components';

import { roleOptions, type Role } from '@/shared/types/enums';
import { InputSection, ButtonsSection } from '@/shared/ui';

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

  const handleRole = (e: ChangeEvent<HTMLSelectElement>) => {
    if (props.mode !== 'create') return;
    props.onRoleChange(parseRole(e.target.value));
  };

  return (
    <>
      <InputsWrapper>
        <InputSection header="Хакатон">
          <Input value={hackathonName} disabled />
        </InputSection>

        <InputSection header="Название команды">
          <Input value={name} onChange={e => onNameChange(e.target.value)} />
        </InputSection>

        <InputSection header="Описание команды">
          <Textarea value={description} onChange={e => onDescriptionChange(e.target.value)} />
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
