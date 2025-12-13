import styled from "styled-components";
import { Button, Input, List, Select } from "@telegram-apps/telegram-ui";

import { Hackathon } from "@/entities/hackathon";
import { Role, roleOptions } from "@/shared/types/enums";
import { FC } from "react";
import { InputSection } from "@/shared/ui";

interface HackathonTeamFormProps {
  hackathon: Hackathon;
  role?: Role | "";
  name: string | "";
  description: string | "";
  submitLabel: string;
  loading?: boolean;
  canSubmit: boolean;
  onRoleChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const HackathonTeamForm: FC<HackathonTeamFormProps> = ({
  hackathon,
  role = "",
  name,
  description,
  submitLabel,
  loading = false,
  canSubmit,
  onNameChange,
  onDescriptionChange,
  onRoleChange = () => {},
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const handleSaveClick = () => {
    if (!canSubmit) return;
    onSubmit();
  };

  return (
    <>
      <InputSection>
        <Input type="text" value={hackathon.name} disabled />
        <Input
          type="text"
          value={name}
          onChange={onNameChange}
          header={"Название"}
        />
        <Input
          type="text"
          value={description}
          onChange={onDescriptionChange}
          header={"Название"}
        />
        {!isEditing && (
          <Select value={role} onChange={onRoleChange} header="Роль">
            <option value="" disabled>
              Выберите роль
            </option>
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        )}
      </InputSection>

      <ButtonsSection>
        <Button
          size="l"
          onClick={handleSaveClick}
          stretched
          disabled={!canSubmit || loading}
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            size="l"
            mode="bezeled"
            stretched
            onClick={onCancel}
            disabled={loading}
          >
            Отмена
          </Button>
        )}
      </ButtonsSection>
    </>
  );
};

const ButtonsSection = styled(List)`
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
