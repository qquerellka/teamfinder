import { Button, Input, Select } from '@telegram-apps/telegram-ui';
import type { FC, ChangeEvent } from 'react';

import { roleOptions, type Role } from '@/shared/types/enums';
import { ButtonsSection, InputSection } from '@/shared/ui';

interface ApplicationFormViewProps {
  hackathonName: string;
  role: Role | '';
  submitLabel: string;
  loading?: boolean;
  canSubmit: boolean;
  onRoleChange: (role: Role | '') => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

const parseRole = (raw: string): Role | '' => (raw ? (raw as Role) : '');

export const ApplicationFormView: FC<ApplicationFormViewProps> = ({
  hackathonName,
  role,
  submitLabel,
  loading = false,
  canSubmit,
  onRoleChange,
  onSubmit,
  onCancel,
}) => {
  const handleSaveClick = () => {
    if (!canSubmit) return;
    onSubmit();
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    onRoleChange(parseRole(e.target.value));
  };

  return (
    <>
      <InputSection header={'Хакатон'}>
        <Input type="text" value={hackathonName} disabled />
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
