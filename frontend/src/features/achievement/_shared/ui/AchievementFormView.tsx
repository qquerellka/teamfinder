import type { FC, ChangeEvent } from 'react';
import { Button, Input, Select } from '@telegram-apps/telegram-ui';
import styled from 'styled-components';

import type { Hackathon } from '@/entities/hackathon';
import { placeOptions } from '@/entities/achievement';
import { roleOptions } from '@/shared/types/enums';
import type { AchievementFormValues, AchievementFormField } from '../model/types';
import { SText, InputSection } from '@/shared/ui';

type BaseProps = {
  values: AchievementFormValues;
  onChange: (
    field: AchievementFormField,
    value: AchievementFormValues[AchievementFormField],
  ) => void;
  onSave: () => void;
  canSubmit: boolean;
  isSaving: boolean;
};

type CreateProps = BaseProps & {
  mode: 'create';
  hackathons: Hackathon[];
};

type EditProps = BaseProps & {
  mode: 'edit';
  hackathonName: string;
  onDelete: () => void;
  isDeleting: boolean;
};

type Props = CreateProps | EditProps;

export const AchievementFormView: FC<Props> = props => {
  const { values, onChange, onSave, canSubmit, isSaving } = props;

  const parseSelectValue = <K extends AchievementFormField>(
    field: K,
    raw: string,
  ): AchievementFormValues[K] => {
    switch (field) {
      case 'hackathonId':
        return (raw ? Number(raw) : null) as AchievementFormValues[K];

      case 'role':
        return raw as AchievementFormValues[K]; // Role | ""

      case 'place':
        return raw as AchievementFormValues[K]; // AchievementPlace | ""

      default: {
        const _exhaustive: never = field;
        return _exhaustive;
      }
    }
  };

  const handleSelect =
    <K extends AchievementFormField>(field: K) =>
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChange(field, parseSelectValue(field, e.target.value));
    };

  return (
    <SProfile>
      <SText $fs={14} $fw="semibold">
        {props.mode === 'create' ? 'Новое достижение' : 'Редактировать достижение'}
      </SText>

      <InputSection header={'Хакатон'}>
        {props.mode === 'create' ? (
          <Select value={values.hackathonId ?? ''} onChange={handleSelect('hackathonId')}>
            <option value="" disabled>
              Выберите хакатон
            </option>
            {props.hackathons.map(h => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
        ) : (
          <Input value={props.hackathonName} disabled />
        )}
      </InputSection>

      <InputSection header={'Роль в команде'}>
        <Select value={values.role} onChange={handleSelect('role')}>
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

      <InputSection header={'Место'}>
        <Select value={values.place} onChange={handleSelect('place')}>
          <option value="" disabled>
            Выберите место
          </option>
          {placeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </InputSection>

      <ButtonsSection>
        <Button size="l" onClick={onSave} stretched disabled={!canSubmit || isSaving}>
          {props.mode === 'create' ? 'Добавить' : 'Сохранить'}
        </Button>

        {props.mode === 'edit' && (
          <DeleteButton size="l" onClick={props.onDelete} stretched disabled={props.isDeleting}>
            Удалить
          </DeleteButton>
        )}
      </ButtonsSection>
    </SProfile>
  );
};

const SProfile = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  gap: 1.5rem;
  flex: 1;
`;

const DeleteButton = styled(Button)`
  background-color: var(--tg-theme-destructive-text-color);
`;

const ButtonsSection = styled.section`
  width: 100%;
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
